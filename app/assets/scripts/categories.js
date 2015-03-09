define(['angular','./mixins/paginatedListController'], function(angular, PaginatedListCtrl) {
    'use strict';

    return angular.module('c6.proshop.categories',[])
        .controller('CategoriesController', ['$scope','$log','$location','Cinema6Service','scopePromise','$injector',
        function                            ( $scope , $log , $location , Cinema6Service , scopePromise , $injector ) {
            var self = this;

            $log = $log.context('CategoriesCtrl');
            $log.info('instantiated');

            $scope.endpoint = 'categories';

            self.addNew = function() {
                $location.path('/category/new');
            };

            $scope.tableHeaders = [
                {label:'Label',value:'label',sortable:true},
                {label:'Name',value:'name',sortable:false},
                {label:'Status',value:'status',sortable:false},
                {label:'Last Updated',value:'lastUpdated',sortable:true}
            ];

            $scope.sort = {
                column: 'label',
                descending: false
            };

            $injector.invoke(PaginatedListCtrl, self, {
                $scope: $scope,
                scopePromise: scopePromise,
                Cinema6Service: Cinema6Service
            });
        }])
        .controller('CategoryController', ['$scope','$log','ConfirmDialogService','$q','$location','CategoriesService','$routeParams',
        function                          ( $scope , $log , ConfirmDialogService , $q , $location , CategoriesService , $routeParams ) {
            var self = this,
                bindLabelToName = false;

            function initView() {
                self.loading = true;

                if ($routeParams.id) {
                    CategoriesService.getCategory($routeParams.id)
                        .then(function(category) {
                            self.category = category;
                        })
                        .finally(function() {
                            self.loading = false;
                        });
                } else {
                    bindLabelToName = true;
                    self.loading = false;
                    self.category = {
                        status: 'active'
                    };
                }
            }

            function convertLabelToName(label) {
                return label.toLowerCase()
                    .replace(/ /g, '_')
                    .replace(/[^0-9a-zA-Z_ ]*/g,'')
                    .replace(/^(_)+/,'')
                    .replace(/(_)+$/,'');
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

            self.disableLabelBinding = function() {
                bindLabelToName = false;
            };

            $scope.$watch(function() {return self.category && self.category.label;}, function(newLabel) {
                if (newLabel && bindLabelToName && !self.category.id) {
                    self.category.name = convertLabelToName(newLabel);
                }
            });

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

            this.getCategories = function() {
                return httpWrapper({
                    method: 'GET',
                    url: c6UrlMaker('content/categories', 'api')
                });
            };

            this.getCategory = function(id) {
                return httpWrapper({
                    method: 'GET',
                    url: c6UrlMaker('content/category/' + id, 'api')
                });
            };

            this.putCategory = function(id, cat) {
                return httpWrapper({
                    method: 'PUT',
                    url: c6UrlMaker('content/category/' + id, 'api'),
                    data: cat
                });
            };

            this.postCategory = function(cat) {
                return httpWrapper({
                    method: 'POST',
                    url: c6UrlMaker('content/category', 'api'),
                    data: cat
                });
            };

            this.deleteCategory = function(id) {
                return httpWrapper({
                    method: 'DELETE',
                    url: c6UrlMaker('content/category/' + id, 'api')
                });
            };
        }]);
});