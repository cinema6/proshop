define([], function() {
    'use strict';

    return angular.module('c6.proshop.categories',[])
        .controller('CategoriesController', ['$scope','$log','ConfirmDialogService','$q','$location',
        function                            ( $scope , $log , ConfirmDialogService , $q , $location ) {
            var self = this,
                _data = {};

            $log = $log.context('CategoriesCtrl');
            $log.info('instantiated');

            function initView() {

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
                {label:'Name',value:'name'},
                {label:'Domain',value:'host'},
                {label:'Org',value:'org.name'},
                {label:'AdTech ID',value:'placementId'},
                {label:'Wild Card ID',value:'wildCardPlacement'},
                {label:'Branding',value:'branding'},
                {label:'Status',value:'status'},
                {label:'Last Updated',value:'lastUpdated'}
            ];

            $scope.sort = {
                column: 'name',
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
        }])
        .controller('CategoryController', [function() {
            var self = this;

            self.save = function() {

            };

            self.delete = function() {

            };
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

            this.getCategory = function(id) {
                return httpWrapper({
                    method: 'GET',
                    url: c6UrlMaker('categories/' + id, 'api')
                });
            };

            this.putCategory = function(id, cat) {
                return httpWrapper({
                    method: 'PUT',
                    url: c6UrlMaker('categories/' + id, 'api'),
                    data: cat
                });
            };

            this.postCategory = function(cat) {
                return httpWrapper({
                    method: 'POST',
                    url: c6UrlMaker('categories', 'api'),
                    data: cat
                });
            };

            this.deleteCategory = function(id) {
                return httpWrapper({
                    method: 'DELETE',
                    url: c6UrlMaker('categories/' + id, 'api')
                });
            };
        }]);
});