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

            function getObjectByProp(prop, value, array) {
                return array.filter(function(obj) {
                    return obj[prop] === value;
                })[0];
            }

            function getBy(prop) {
                return function(obj) {
                    return obj[prop];
                };
            }

            function activeMiniReels(experience) {
                return !self.group.miniReels.filter(function(mr) {
                    return mr.id === experience.id;
                }).length;
            }

            function filterDuplicates(prop, experiences) {
                return experiences.reduce(function(result, exp) {
                    var value = exp[prop];

                    return result.indexOf(value) < 0 ?
                        result.concat(value) :
                        result;
                },[]);
            }

            function handleError(err) {
                $log.error(err);
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

                        if (self.group.miniReels.length) {
                            content.getExperiences({ids: self.group.miniReels.join()})
                                .then(decorateExperiences)
                                .then(function(experiences) {
                                    self.group.miniReels = experiences;
                                })
                                .catch(function(err) {
                                    $scope.message = 'There was an error loading the Group\'s MiniReels. ' + err;
                                });
                        }
                    })
                    .finally(function() {
                        self.loading = false;
                    });
            }

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
                        deferred.reject(err);
                    });

                return deferred.promise;
            }

            function removeCategory(category) {
                var categories = self.group.categories,
                    index = categories.indexOf(category);

                if (category && index > -1) {
                    categories.splice(index,1);
                }
            }

            function miniReelsWithout(category) {
                return self.group.miniReels.filter(function(mr) {
                    var hasMatch = mr.categories.indexOf(category.name) > -1,
                        hasOthers = !!self.group.categories.filter(function(cat) {
                            return mr.categories.indexOf(cat.name) > -1 &&
                                cat.name !== category.name;
                        })[0];

                    return !hasMatch || hasOthers;
                });
            }

            self.showMiniReels = false;
            self.allAreSelected = false;
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
                        miniReel.user.email.toLowerCase().indexOf(_query) > -1 ||
                        miniReel.user.firstName.toLowerCase().indexOf(_query) > -1 ||
                        miniReel.user.lastName.toLowerCase().indexOf(_query) > -1 ||
                        miniReel.org.name.toLowerCase().indexOf(_query) > -1;
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
                ConfirmDialogService.display({
                    prompt: 'Would you like to remove all MiniReels in this category?',
                    message: 'NOTE: MiniReels in other Group categories will not be removed.',
                    affirm: 'Yes, remove MiniReels',
                    cancel: 'No, keep all MiniReels',
                    onAffirm: function() {
                        ConfirmDialogService.close();
                        self.group.miniReels = miniReelsWithout(category);
                        removeCategory(category);

                    },
                    onCancel: function() {
                        removeCategory(category);
                        ConfirmDialogService.close();
                    }
                });
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
                        return decorateExperiences(experiences.filter(activeMiniReels));
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
                }

                self.showMiniReels = false;
            };

            self.save = function(group) {
                var _group = {
                    name: group.name,
                    categories: group.categories.map(getBy('name')),
                    miniReels: group.miniReels.map(getBy('id'))
                };

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
                    $location.path('/groups');
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
                {label:'Categories',value:'categories'},
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

            $scope.$watch(function() { return self.allAreSelected; }, function(allSelected) {
                if (!self.miniReels || !self.miniReels.length) { return; }

                self.miniReels.forEach(function(mr) {
                    mr.chosen = allSelected;
                });
            });

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