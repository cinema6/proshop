define([], function() {
    'use strict';

    return angular.module('c6.proshop.categories',[])
        .controller('CategoriesController', ['$scope','$log','$location','CategoriesService',
        function                            ( $scope , $log , $location , CategoriesService ) {
            var self = this,
                _data = {};

            $log = $log.context('CategoriesCtrl');
            $log.info('instantiated');

            function initView() {
                self.loading = true;

                CategoriesService.getCategories()
                    .then(function(categories) {
                        self.categories = categories;
                    })
                    .finally(function() {
                        self.loading = false;
                    });
            }

            self.query = null;
            self.page = 1;
            self.limit = 50;
            self.limits = [5,10,50,100];
            Object.defineProperties(self, {
                total: {
                    get: function() {
                        return self.sites && Math.ceil(self.sites.length / self.limit);
                    }
                }
            });

            self.addNew = function() {
                $location.path('/categories/new');
            };

            self.filterData = function(query) {
                var _query = query.toLowerCase(),
                    orgs = _data.orgs.filter(function(org) {
                        return org.name.toLowerCase().indexOf(_query) >= 0;
                    });

                self.sites = _data.sites.filter(function(site) {
                    var bool = false;

                    orgs.forEach(function(org) {
                        bool = (site.org && (site.org.id.indexOf(org.id) >= 0)) || bool;
                    });

                    [site.name, site.host].forEach(function(field) {
                        bool = (field && field.toLowerCase().indexOf(_query) >= 0) || bool;
                    });

                    return bool;
                });

                self.page = 1;
            };

            $scope.tableHeaders = [
                {label:'Label',value:'label'},
                {label:'Name',value:'name'},
                {label:'Status',value:'status'},
                {label:'Last Updated',value:'lastUpdated'}
            ];

            $scope.sort = {
                column: 'label',
                descending: false
            };

            $scope.doSort = function(column) {
                var sort = $scope.sort;
                if (sort.column === column) {
                    sort.descending = !sort.descending;
                } else {
                    sort.column = column;
                    sort.descending = false;
                }
            };

            initView();
        }])
        .controller('CategoryController', ['$scope','$log','ConfirmDialogService','$q','$location','CategoriesService','$routeParams',
        function                          ( $scope , $log , ConfirmDialogService , $q , $location , CategoriesService , $routeParams ) {
            var self = this;

            function initView() {

                if ($routeParams.id) {
                    self.loading = true;

                    CategoriesService.getCategory($routeParams.id)
                        .then(function(category) {
                            self.category = category;
                        })
                        .finally(function() {
                            self.loading = false;
                        });
                } else {
                    self.category = {
                        status: 'active'
                    };
                }
            }

            self.save = function(category) {
                var c = {};

                function handleError(err) {
                    $log.error(err);
                    ConfirmDialogService.display({
                        prompt: 'There was a problem saving the Category. ' + err + '.',
                        affirm: 'Close',
                        onAffirm: function() {
                            ConfirmDialogService.close();
                        }
                    });
                }

                function handleSuccess(category) {
                    $log.info('saved user: ', category);
                    $scope.message = 'Successfully saved Category: ' + category.name;
                    $location.path('/categories');
                }

                ['name','label','status'].forEach(function(prop) {
                    c[prop] = category[prop];
                });

                if (category.id) {
                    CategoriesService.putCategory(category.id, c)
                        .then(handleSuccess, handleError);
                } else {
                    CategoriesService.postCategory(c)
                        .then(handleSuccess, handleError);
                }
            };

            self.delete = function() {
                ConfirmDialogService.display({
                    prompt: 'Are you sure you want to delete this Category?',
                    affirm: 'Yes',
                    cancel: 'Cancel',
                    onAffirm: function() {
                        ConfirmDialogService.close();
                        CategoriesService.deleteCategory(self.category.id)
                            .then(function() {
                                $scope.message = 'Successfully deleted Category: ' + self.category.name;
                                $location.path('/categories');
                            }, function(err) {
                                $log.error(err);
                                ConfirmDialogService.display({
                                    prompt: 'There was a problem deleting the Category. ' + err + '.',
                                    affirm: 'Close',
                                    onAffirm: function() {
                                        ConfirmDialogService.close();
                                    }
                                });
                            });
                    },
                    onCancel: function() {
                        ConfirmDialogService.close();
                    }
                });
            };

            initView();
        }])
        .service('CategoriesService', ['c6UrlMaker','$http','$q','$timeout',
        function                      ( c6UrlMaker , $http , $q , $timeout ) {
            function httpWrapper(request) {
                var deferred = $q.defer(),
                    deferredTimeout = $q.defer(),
                    cancelTimeout;

                request.timeout = deferredTimeout.promise;

                $http(request)
                .success(function(data) {
                    $timeout.cancel(cancelTimeout);
                    deferred.resolve(data);
                })
                .error(function(data) {
                    if (!data) {
                        data = 'Unable to locate failed';
                    }
                    $timeout.cancel(cancelTimeout);
                    deferred.reject(data);
                });

                cancelTimeout = $timeout(function() {
                    deferredTimeout.resolve();
                    deferred.reject('Request timed out.');
                },10000);

                return deferred.promise;
            }

            this.getCategories = function(param, value) {
                return httpWrapper({
                    method: 'GET',
                    url: c6UrlMaker('categories' + (param && value ? '?' + param + '=' + value : ''), 'api')
                });
            };

            this.getCategory = function(id) {
                return httpWrapper({
                    method: 'GET',
                    url: c6UrlMaker('category/' + id, 'api')
                });
            };

            this.putCategory = function(id, cat) {
                return httpWrapper({
                    method: 'PUT',
                    url: c6UrlMaker('category/' + id, 'api'),
                    data: cat
                });
            };

            this.postCategory = function(cat) {
                return httpWrapper({
                    method: 'POST',
                    url: c6UrlMaker('category', 'api'),
                    data: cat
                });
            };

            this.deleteCategory = function(id) {
                return httpWrapper({
                    method: 'DELETE',
                    url: c6UrlMaker('category/' + id, 'api')
                });
            };
        }]);
});