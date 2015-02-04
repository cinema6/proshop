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
                                        'content','account',
        function                       ( $scope , $log , $q , $location , $routeParams ,
                                         GroupsService , ConfirmDialogService , CategoriesService ,
                                         content , account ) {
            var self = this,
                _data = {};

            $log = $log.context('GroupCtrl');
            $log.info('instantiated');

            function decorateExperiences(experiences) {
                var deferred = $q.defer(),
                    orgIds = filterDuplicates('org', experiences).join(),
                    userIds = filterDuplicates('user', experiences).join();

                $q.all([
                        account.getOrgs({ids: orgIds}),
                        account.getUsers({ids: userIds})
                    ])
                    .then(function(promises) {
                        var orgs = promises[0],
                            users = promises[1];

                        experiences.forEach(function(mr) {
                            mr.user = getObjectByProp('id', mr.user, users);
                            mr.org = getObjectByProp('id', mr.org, orgs);
                        });

                        deferred.resolve(experiences);
                    })
                    .catch(function(err) {
                        deferred.reject();
                    });

                return deferred.promise;
            }

            function filterDuplicates(prop, experiences) {
                return experiences.reduce(function(result, exp) {
                    var value = exp[prop];

                    if (result.indexOf(value) < 0) {
                        return result.concat(value);
                    }
                },[]);
            }

            function handleError(err) {
                $log.error(err);
            }

            function getObjectByProp(prop, value, array) {
                return array.filter(function(obj) {
                    return obj[prop] === value;
                })[0];
            }

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
                        self.group.categories = categories.filter(function(cat) {
                            return group.categories.indexOf(cat.name) > -1;
                        });

                        content.getExperiences({ids: self.group.miniReels.join()})
                            .then(decorateExperiences)
                            .then(function(experiences) {
                                self.group.miniReels = experiences;
                            })
                            .catch(function(err) {
                                $scope.message = 'There was an error loading the Group\'s MiniReels. ' + err;
                            });
                    })
                    .finally(function() {
                        self.loading = false;
                    });
            }

            function activeMiniReels(experience) {
                return !self.group.miniReels.filter(function(mr) {
                    return mr.id === experience.id;
                }).length;
            }

            self.showMiniReels = false;
            self.query = null;
            self.page = 1;
            self.limit = 50;
            self.limits = [1,10,50,100];
            Object.defineProperties(self, {
                total: {
                    get: function() {
                        return self.miniReels && Math.ceil(self.miniReels.length / self.limit);
                    }
                }
            });

            self.filterData = function(query) {
                var _query = query.toLowerCase();

                self.miniReels = _data.miniReels.filter(function(miniReel) {
                    return miniReel.data.title.toLowerCase().indexOf(_query) > -1 ||
                        miniReel.user.name.indexOf(_query) > -1 ||
                        miniReel.org.name.indexOf(_query) > -1;
                });

                self.page = 1;
            };

            self.addCategory = function(category) {
                var categories = self.group.categories;

                if (category && categories.indexOf(category) === -1) {
                    categories.push(category);
                }
            };

            self.removeCategory = function(category) {
                var categories = self.group.categories,
                    index = categories.indexOf(category);

                if (category && index > -1) {
                    categories.splice(index,1);
                }
            };

            self.removeMiniReel = function(miniReel) {
                var miniReels = self.group.miniReels,
                    index = miniReels.indexOf(miniReel);

                if (miniReel && index > -1) {
                    miniReels.splice(index,1);
                }
            };

            self.loadMiniReels = function() {
                var categories = self.group.categories
                        .map(function(category) {
                            return category.name;
                        }).join();

                content.getExperiences({categories: categories})
                    .then(function(experiences) {
                        var filteredExperiences = experiences.filter(activeMiniReels);

                        return decorateExperiences(filteredExperiences);
                    })
                    .then(function(experiences) {
                        self.miniReels = experiences;
                        _data.miniReels = experiences;
                    })
                    .catch(handleError)
                    .finally(function() {
                        self.showMiniReels = true;
                    });
            };

            self.saveMiniReels = function() {
                var currentMiniReels = self.group.miniReels,
                    chosenMiniReels = self.miniReels.filter(function(mr) {
                        return mr.chosen;
                    });

                if (chosenMiniReels.length) {
                    self.group.miniReels = currentMiniReels.concat(chosenMiniReels);
                    self.showMiniReels = false;
                }
            };

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

            $scope.miniReelTableHeaders = [
                {label:'Title',value:'data.title'},
                {label:'Mode',value:'data.mode'},
                {label:'Org',value:'org'},
                {label:'User',value:'user'}
            ];

            $scope.sort = {
                column: 'data.title',
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