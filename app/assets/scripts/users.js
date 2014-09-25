define(['account'],function(account) {
    'use strict';

    var extend = angular.extend;

    return angular.module('c6.proshop.users',[account.name])
        .controller('UsersController', ['$scope', '$log', 'account', 'ConfirmDialogService', '$q',
        function                       ( $scope ,  $log,   account ,  ConfirmDialogService ,  $q ) {
            var self = this,
                data = $scope.data;

            $log = $log.context('UsersCtrl');
            $log.info('instantiated');

            function initView() {
                self.loading = true;

                $q.all([account.getOrgs(), account.getUsers()])
                    .then(function(promises) {
                        var orgs = promises[0],
                            users = promises[1],
                            userOrgPromiseArray = [];

                        data.appData.orgs = orgs;
                        data.orgs = orgs;

                        data.appData.users = users;
                        data.users = users;

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

            function deleteUser() {
                $log.info('deleting user: ', data.user);

                account.deleteUser(data.user)
                    .then(function() {
                        $scope.message = 'Successfully deleted user: ' + data.user.email;
                        initView();
                        self.action = 'all';
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

            function setPermissions() {
                var permissions = self.role === 'Admin' ?
                    {
                        elections: {
                            read    : 'all',
                            create  : 'all',
                            edit    : 'all',
                            delete  : 'all'
                        },
                        experiences: {
                            read    : 'all',
                            create  : 'all',
                            edit    : 'all',
                            delete  : 'all',
                            editAdConfig: 'all'
                        },
                        users: {
                            read    : 'all',
                            create  : 'all',
                            edit    : 'all',
                            delete  : 'all'
                        },
                        orgs: {
                            read    : 'all',
                            create  : 'all',
                            edit    : 'all',
                            delete  : 'all',
                            editAdConfig: 'all'
                        },
                        sites: {
                            read    : 'all',
                            create  : 'all',
                            edit    : 'all',
                            delete  : 'all',
                        }
                    } :
                    {
                        elections: {
                            read    : 'org',
                            create  : 'org',
                            edit    : 'org',
                            delete  : 'org'
                        },
                        experiences: {
                            read    : 'org',
                            create  : 'org',
                            edit    : 'org',
                            delete  : 'org'
                        },
                        users: {
                            read    : 'org',
                            edit    : 'own'
                        },
                        orgs: {
                            read    : 'own',
                            edit    : 'own'
                        },
                        sites: {
                            read    : 'org'
                        }
                    };

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

            Object.defineProperty($scope, 'passwordMessage', {
                get: function() {
                    return this.showPassword ? 'Hide Password' : 'Show Password';
                }
            });

            $scope.doSort = function(column) {
                var sort = $scope.sort;
                if (sort.column === column) {
                    sort.descending = !sort.descending;
                } else {
                    sort.column = column;
                    sort.descending = false;
                }
            };

            self.action = 'all';
            self.page = 1;
            self.limit = 50;
            self.limits = [5,10,50,100];
            Object.defineProperties(self, {
                total: {
                    get: function() {
                        return data.users && Math.ceil(data.users.length / self.limit);
                    }
                }
            });
            self.showUserSettings = false;
            self.userPermissionOptions = angular.copy(account.userPermissionOptions);
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

            self.editUser = function(user){
                $scope.message = null;
                self.action = 'edit';
                data.org = data.appData.orgs.filter(function(org) {
                    return user.org.id === org.id;
                })[0];
                data.user = convertUserForEditing(user, data.org);
            };

            self.addNewUser = function() {
                $scope.message = null;
                self.action = 'new';
                self.role = null;
                data.user = {};
                data.org = null;
            };

            self.filterData = function() {
                var query = data.query.toLowerCase(),
                    orgs = data.appData.orgs.filter(function(org) {
                        return org.name.toLowerCase().indexOf(query) >= 0;
                    });

                self.page = 1;

                data.users = data.appData.users.filter(function(user) {
                    var bool = false;

                    orgs.forEach(function(org) {
                        bool = (user.org.id.indexOf(org.id) >= 0) || bool;
                    });

                    [user.email, user.firstName, user.lastName].forEach(function(field) {
                        bool = (field && field.toLowerCase().indexOf(query) >= 0) || bool;
                    });

                    return bool;
                });
            };

            self.sortUsers = function(/*field*/) {
                // I imagine there will be something in the UI to allow sorting the list
                // return account.getOrgs(field).then(updateOrgs);
            };

            self.backToList = function() {
                self.action = 'all';
                initView();
            };

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
                    firstName: data.user.firstName,
                    lastName: data.user.lastName,
                    org: data.org.id,
                    config: data.user.config,
                    type: (self.role === 'Admin' ? 'Publisher' : self.role),
                    permissions: setPermissions()
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
                    $scope.message = 'Successfully saved user: ' + data.user.email;
                    initView();
                    self.action = 'all';
                    data.user = user;
                }

                if (data.user.id) {
                    $log.info('PUT', data.user.id, data.user.email, data.user.firstName, data.user.lastName, data.org.id);

                    user = extend(user, {
                        id: data.user.id,
                    });

                    account.putUser(user)
                        .then(handleSuccess, handleError);

                } else {
                    $log.info('POST', data.user.email, data.user.firstName, data.user.lastName, data.org.id);

                    user = extend(user, {
                        email: data.user.email,
                        password: data.user.password,
                    });

                    account.postUser(user)
                        .then(handleSuccess, handleError);
                }
            };

            self.cancelOrgChange = function() {
                $scope.changingOrgWarning = false;
                data.org = data.orgs.filter(function(org) {
                    return org.id === data.user.org.id;
                })[0];
            };

            self.confirmOrgChange = function() {
                $scope.changingOrgWarning = false;
                data.user.config = null;
                data.user = convertUserForEditing(data.user, data.org);
            };

            $scope.$watch('data.org', function(newOrg) {
                if (newOrg) {
                    if (self.action === 'edit' && data.user.org.id !== data.org.id) {
                        $scope.changingOrgWarning = true;
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

                    if (self.action === 'new') {
                        data.user.config = null;
                        data.user.branding = null;
                        data.user = convertUserForEditing(data.user, newOrg);
                    }
                }
            });

            $scope.$watch(function() {
                return self.action;
            }, function(action) {
                if (action === 'new') {
                    self.editAdConfigOptions.forEach(function(option) {
                        option.enabled = false;
                    });
                }
            });

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

        .directive('newUser', [ function ( ) {
            return {
                restrict: 'E',
                templateUrl: 'views/users/user_edit.html',
                link: function(/*scope, element, attrs, ctrl*/) {
                    // can move any DOM stuff from Ctrl into here...
                }
            };
        }])

        .directive('editUser', [ function ( ) {
            return {
                restrict: 'E',
                templateUrl: 'views/users/user_edit.html',
                link: function(/*scope, element, attrs, ctrl*/) {
                    // can move any DOM stuff from Ctrl into here...
                }
            };
        }])

        .directive('allUsers', [ function ( ) {
            return {
                restrict: 'E',
                templateUrl: 'views/users/users_all.html',
                link: function(/*scope, element, attrs, ctrl*/) {
                    // can move any DOM stuff from Ctrl into here...
                }
            };
        }]);
});
