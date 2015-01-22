define(['account'],function(account) {
    'use strict';

    var extend = angular.extend,
        copy = angular.copy;

    return angular.module('c6.proshop.users',[account.name])
        .controller('UsersController', ['$scope','$log','account','$q','$location',
        function                       ( $scope , $log,  account , $q , $location ) {
            var self = this,
                _data = {};

            $log = $log.context('UsersCtrl');
            $log.info('instantiated');

            function initView() {
                self.loading = true;

                $q.all([account.getOrgs(), account.getUsers()])
                    .then(function(promises) {
                        var orgs = promises[0],
                            users = promises[1],
                            userOrgPromiseArray = [];

                        self.users = users;
                        _data.users = users;

                        self.orgs = orgs;
                        _data.orgs = orgs;

                        users.forEach(function(user) {
                            userOrgPromiseArray.push(account.getOrg(user.org)
                                .then(function(org) {
                                    user.org = org;
                                }));
                        });

                        return $q.all(userOrgPromiseArray);
                    })
                    .finally(function() {
                        self.loading = false;
                    });
            }

            $scope.tableHeaders = [
                {label:'Email',value:'email'},
                {label:'Name',value:'lastName'},
                {label:'Org',value:'org.name'},
                {label:'Status',value:'status'}
            ];

            $scope.sort = {
                column: 'email',
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

            self.page = 1;
            self.limit = 50;
            self.limits = [5,10,50,100];
            Object.defineProperties(self, {
                total: {
                    get: function() {
                        return self.users && Math.ceil(self.users.length / self.limit);
                    }
                }
            });

            self.filterData = function(query) {
                var _query = query.toLowerCase(),
                    orgs = _data.orgs.filter(function(org) {
                        return org.name.toLowerCase().indexOf(_query) >= 0;
                    });

                self.page = 1;

                self.users = _data.users.filter(function(user) {
                    var bool = false;

                    orgs.forEach(function(org) {
                        bool = (user.org.id.indexOf(org.id) >= 0) || bool;
                    });

                    [user.email, user.firstName, user.lastName].forEach(function(field) {
                        bool = (field && field.toLowerCase().indexOf(_query) >= 0) || bool;
                    });

                    return bool;
                });
            };

            self.sortUsers = function(/*field*/) {
                // I imagine there will be something in the UI to allow sorting the list
                // return account.getOrgs(field).then(updateOrgs);
            };

            self.addNewUser = function() {
                $location.path('/user/new');
            };

            $scope.$watch(function() {
                return self.page + ':' + self.limit;
            }, function(newVal, oldVal) {
                var samePage;

                if (newVal === oldVal) { return; }

                newVal = newVal.split(':');
                oldVal = oldVal.split(':');

                samePage = newVal[0] === oldVal[0];

                if (self.page !== 1 && samePage) {
                    /* jshint boss:true */
                    return self.page = 1;
                    /* jshint boss:false */
                }
            });

            initView();

        }])

        .controller('UserController', ['$scope','$log','account','ConfirmDialogService','$q','appData','$routeParams','$location',
        function                      ( $scope , $log,  account , ConfirmDialogService , $q , appData , $routeParams , $location ) {
            var self = this,
                userRoles = appData.proshop.data.userRoles;

            $log = $log.context('UserCtrl');
            $log.info('instantiated');

            function initView() {
                var promiseArray = [account.getOrgs()];

                self.loading = true;

                if ($routeParams.id) {
                    promiseArray.push(account.getUser($routeParams.id));
                }

                $q.all(promiseArray)
                    .then(function(promises) {
                        var orgs = promises[0],
                            user = promises[1] || {
                                status: 'active',
                                type: 'Publisher'
                            };

                        self.orgs = orgs;
                        self.org = orgs.filter(function(org) {
                            return user.org === org.id;
                        })[0];
                        self.user = convertUserForEditing(user, self.org || {});
                    })
                    .finally(function() {
                        self.loading = false;
                    });
            }

            function deleteUser() {
                $log.info('deleting user: ', self.user);

                account.deleteUser(self.user)
                    .then(function() {
                        $scope.message = 'Successfully deleted user: ' + self.user.email;
                        $location.path('/users');
                    }, function(err) {
                        $log.error(err);
                        ConfirmDialogService.display({
                            prompt: 'There was a problem deleting the user. ' + err + '.',
                            affirm: 'Close',
                            onAffirm: function() {
                                ConfirmDialogService.close();
                            }
                        });
                    });
            }

            function getPermissions() {
                var permissions = self.role === 'Admin' ?
                    copy(userRoles.admin) :
                    copy(userRoles.publisher);

                if (self.role === 'Publisher') {
                    self.editAdConfigOptions.forEach(function(option) {
                        if (option.enabled) {
                            permissions[option.name].editAdConfig = option.value;
                        }
                    });
                }

                return permissions;
            }

            function isAdmin(user) {
                return !!user.permissions && Object.keys(user.permissions).every(function(type) {
                    return Object.keys(user.permissions[type]).every(function(verb) {
                        return user.permissions[type][verb] === 'all';
                    });
                });
            }

            function convertUserForEditing(user, org) {
                if (user.permissions) {
                    self.editAdConfigOptions[0].enabled = !!user.permissions.orgs.editAdConfig;
                    self.editAdConfigOptions[1].enabled = !!user.permissions.experiences.editAdConfig;
                    user.type = user.type || 'Publisher';
                }

                self.role = isAdmin(user) ? 'Admin' : user.type;

                user.config = (user.config &&
                    user.config.minireelinator &&
                    user.config.minireelinator.minireelDefaults) ?
                    (user.config) : (org.config &&
                    org.config.minireelinator &&
                    org.config.minireelinator.minireelDefaults) ? {
                        minireelinator: {
                            minireelDefaults: {
                                splash: org.config.minireelinator.minireelDefaults.splash
                            }
                        }
                    } : {
                        minireelinator: {
                            minireelDefaults: {
                                splash: {
                                    ratio: '3-2',
                                    theme: 'img-text-overlay'
                                }
                            }
                        }
                    };

                return user;
            }

            self.appData = appData;
            self.emailPattern = /^\w+.*\w@\w.*\.\w{2,}$/;
            self.editAdConfigOptions = [
                {
                    name: 'orgs',
                    enabled: false,
                    value: 'own'
                },
                {
                    name: 'experiences',
                    enabled: false,
                    value: 'org'
                }
            ];

            self.confirmDelete = function() {
                ConfirmDialogService.display({
                    prompt: 'Are you sure you want to delete this User?',
                    affirm: 'Yes',
                    cancel: 'Cancel',
                    onAffirm: function() {
                        ConfirmDialogService.close();
                        deleteUser();
                    },
                    onCancel: function() {
                        ConfirmDialogService.close();
                    }
                });
            };

            self.saveUser = function() {
                var user = {
                    firstName: self.user.firstName,
                    lastName: self.user.lastName,
                    org: self.org.id,
                    config: self.user.config,
                    type: (self.role === 'Admin' ? 'Publisher' : self.role),
                    status: self.user.status,
                    permissions: getPermissions()
                };

                function handleError(err) {
                    $log.error(err);
                    ConfirmDialogService.display({
                        prompt: 'There was a problem saving the user. ' + err + '.',
                        affirm: 'Close',
                        onAffirm: function() {
                            ConfirmDialogService.close();
                        }
                    });
                }

                function handleSuccess(user) {
                    $log.info('saved user: ', user);
                    $scope.message = 'Successfully saved user: ' + self.user.email;
                    $location.path('/users');
                }

                if (self.user.id) {
                    $log.info('PUT', self.user.id, self.user.email, self.user.firstName, self.user.lastName, self.org.id);

                    account.putUser(self.user.id, user)
                        .then(handleSuccess, handleError);

                } else {
                    $log.info('POST', self.user.email, self.user.firstName, self.user.lastName, self.org.id);

                    user = extend(user, {
                        email: self.user.email,
                        password: self.user.password,
                    });

                    account.postUser(user)
                        .then(handleSuccess, handleError);
                }
            };

            self.cancelOrgChange = function() {
                self.org = self.orgs.filter(function(org) {
                    return org.id === self.user.org;
                })[0];
            };

            self.confirmOrgChange = function() {
                self.user.org = self.org.id;
                self.user.config = null;
                self.user = convertUserForEditing(self.user, self.org);
            };

            self.confirmFreeze = function() {
                ConfirmDialogService.display({
                    prompt: 'Freezing a User will log them out and make them inactive, ' +
                        'are you sure you want to proceed?',
                    affirm: 'Yes',
                    cancel: 'Cancel',
                    onAffirm: function() {
                        $log.info('freezing user: ', self.user);
                        ConfirmDialogService.close();

                        $q.all([
                            account.putUser(self.user.id, { status: 'inactive' }),
                            account.logoutUser(self.user.id)
                        ])
                        .then(function() {
                            $scope.message = 'Successfully froze user: ' + self.user.email + '.';
                        }, function(err) {
                            $log.error(err);
                            ConfirmDialogService.display({
                                prompt: 'There was a problem freezing the user. ' + err + '.',
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

            $scope.message = null;
            Object.defineProperty($scope, 'passwordMessage', {
                get: function() {
                    return this.showPassword ? 'Hide Password' : 'Show Password';
                }
            });

            $scope.$watch(function() { return self.org; }, function(newOrg) {
                if (newOrg) {
                    if (self.user.id && self.user.org !== self.org.id) {
                        ConfirmDialogService.display({
                            prompt: 'Warning: All of this User\'s Minireels will remain with the original Org.',
                            affirm: 'OK, move User without Minireels',
                            cancel: 'No, leave the User on current Org',
                            onAffirm: function() {
                                ConfirmDialogService.close();
                                self.confirmOrgChange();
                            },
                            onCancel: function() {
                                ConfirmDialogService.close();
                                self.cancelOrgChange();
                            }
                        });
                    }

                    if (!self.user.id) {
                        self.user.config = null;
                        self.user.branding = null;
                        self.user = convertUserForEditing(self.user, newOrg);
                    }
                }
            });

            initView();

        }]);
});
