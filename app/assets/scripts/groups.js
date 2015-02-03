define(['angular'], function(angular) {
    'use strict';

    return angular.module('c6.proshop.groups',[])
        .controller('GroupsController', ['$scope','$log','$location','GroupsService',
        function                        ( $scope , $log , $location , GroupsService ) {
            var self = this,
                _data = {};

            $log = $log.context('GroupsCtrl');
            $log.info('instantiated');

            function initView() {
                self.loading = true;

                GroupsService.getGroups()
                    .then(function(groups) {
                        self.groups = groups;
                        _data.groups = groups;
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
                        return self.groups && Math.ceil(self.groups.length / self.limit);
                    }
                }
            });

            self.filterData = function(query) {
                var _query = query.toLowerCase();

                self.groups = _data.groups.filter(function(group) {
                    return group.name.toLowerCase().indexOf(_query) >= 0 ||
                        group.id.indexOf(_query) >= 0;
                });

                self.page = 1;
            };

            $scope.tableHeaders = [
                {label:'Name',value:'name'},
                {label:'ID',value:'id'},
                {label:'Categories',value:'categories'},
                {label:'MiniReel Count',value:'miniReels.length'},
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

            initView();
        }])

        .controller('GroupController', ['$scope','$log','$q','$location','$routeParams',
                                        'GroupsService','ConfirmDialogService','CategoriesService',
        function                       ( $scope , $log , $q , $location , $routeParams ,
                                         GroupsService , ConfirmDialogService , CategoriesService ) {
            var self = this;

            $log = $log.context('GroupCtrl');
            $log.info('instantiated');

            function initView() {
                var id = $routeParams.id,
                    promiseArray = [CategoriesService.getCategories()];

                self.loading = true;

                if (id) {
                    promiseArray.push(GroupsService.getGroup(id));
                }

                $q.all(promiseArray)
                    .then(function(promises) {
                        var categories = promises[0],
                            group = promises[1] || {
                                name: '',
                                categories: [],
                                miniReels: []
                            };

                        self.categories = categories;
                        self.group = group;
                    })
                    .finally(function() {
                        self.loading = false;
                    });
            }

            self.save = function(group) {
                var _group = {};

                function handleError(err) {
                    $log.error(err);
                    ConfirmDialogService.display({
                        prompt: 'There was a problem saving the Group. ' + err + '.',
                        affirm: 'Close',
                        onAffirm: function() {
                            ConfirmDialogService.close();
                        }
                    });
                }

                function handleSuccess(group) {
                    $log.info('saved Group: ', group);
                    $location.path('/customers');
                }

                if (group.id) {
                    GroupsService.putGroup(group.id, _group)
                        .then(handleSuccess, handleError);
                } else {
                    GroupsService.postGroup(_group)
                        .then(handleSuccess, handleError);
                }
            };

            self.delete = function() {
                ConfirmDialogService.display({
                    prompt: 'Are you sure you want to delete this Group?',
                    affirm: 'Yes',
                    cancel: 'Cancel',
                    onAffirm: function() {
                        ConfirmDialogService.close();

                        GroupsService.deleteGroup(self.group.id)
                            .then(function() {
                                $scope.message = 'Successfully deleted Group: ' + self.group.name;
                                $location.path('/groups');
                            }, function(err) {
                                $log.error(err);
                                ConfirmDialogService.display({
                                    prompt: 'There was a problem deleting the Group. ' + err + '.',
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

        .service('GroupsService', ['$http','$q','$timeout','c6UrlMaker',
        function                  ( $http , $q , $timeout , c6UrlMaker ) {
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

            this.getGroup = function(id) {
                return httpWrapper({
                    method: 'GET',
                    url: c6UrlMaker('minireelGroup/' + id, 'api')
                });
            };

            this.getGroups = function() {
                return httpWrapper({
                    method: 'GET',
                    url: c6UrlMaker('minireelGroups', 'api')
                });
            };

            this.postGroup = function(group) {
                return httpWrapper({
                    method: 'POST',
                    url: c6UrlMaker('minireelGroup', 'api'),
                    data: group
                });
            };

            this.putGroup = function(id, group) {
                return httpWrapper({
                    method: 'PUT',
                    url: c6UrlMaker('minireelGroup/' + id, 'api'),
                    data: group
                });
            };

            this.deleteGroup = function(id) {
                return httpWrapper({
                    method: 'DELETE',
                    url: c6UrlMaker('minireelGroup/' + id, 'api')
                });
            };
        }]);
});