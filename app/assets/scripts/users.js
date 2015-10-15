define(['angular','./mixins/paginatedListController'],function(angular, PaginatedListCtrl) {
    'use strict';

    var extend = angular.extend;

    return angular.module('c6.proshop.users',[])
        .controller('UsersController', ['$scope','$log','$location','Cinema6Service','scopePromise','$injector',
        function                       ( $scope , $log , $location , Cinema6Service , scopePromise , $injector ) {
            var self = this;

            $log = $log.context('UsersCtrl');
            $log.info('instantiated');

            self.addNew = function() {
                $location.path('/user/new');
            };

            $scope.endpoint = 'users';

            $scope.tableHeaders = [
                {label:'Email',value:'email',sortable:true},
                {label:'Name',value:'lastName',sortable:true},
                {label:'Org',value:'org.name',sortable:false},
                {label:'Status',value:'status',sortable:false}
            ];

            $scope.sort = {
                column: 'email',
                descending: false
            };

            $injector.invoke(PaginatedListCtrl, self, {
                $scope: $scope,
                scopePromise: scopePromise,
                Cinema6Service: Cinema6Service
            });

        }])

        .controller('UserController', ['$scope','$log','ConfirmDialogService','$q','appData','$routeParams','$location','Cinema6Service','AccountService',
        function                      ( $scope , $log , ConfirmDialogService , $q , appData , $routeParams , $location , Cinema6Service , AccountService ) {
            var self = this;

            $log = $log.context('UserCtrl');
            $log.info('instantiated');

            function addDefaults(user, org) {
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

                user.policies = user.policies || [];
                user.roles = user.roles || [];

                return user;
            }

            function initView() {
                var promiseObject = {
                    orgs: Cinema6Service.getAll('orgs',{}),
                    roles: Cinema6Service.getAll('roles',{}),
                    policies: Cinema6Service.getAll('policies',{})
                };

                self.loading = true;

                if ($routeParams.id) {
                    promiseObject.user = Cinema6Service.get('users',$routeParams.id);
                }

                $q.all(promiseObject)
                    .then(function(promises) {
                        var orgs = promises.orgs,
                            roles = promises.roles,
                            policies = promises.policies,
                            user = promises.user || {
                                status: 'active',
                                org: {}
                            };

                        self.orgs = orgs.data;
                        self.org = orgs.data.filter(function(org) {
                            return user.org && user.org.id === org.id;
                        })[0];
                        self.roles = roles.data;
                        self.policies = policies.data;
                        self.user = addDefaults(user, self.org || {});
                    })
                    .finally(function() {
                        self.loading = false;
                    });
            }
            initView();

            self.appData = appData;
            self.emailPattern = /^\w+.*\w@\w.*\.\w{2,}$/;

            self.add = function(prop, item) {
                var items = self.user[prop];

                if (items.indexOf(item) === -1) {
                    items.push(item);
                }
            };

            self.remove = function(prop, index) {
                self.user[prop].splice(index, 1);
            };

            self.save = function() {
                var user = {
                    firstName: self.user.firstName,
                    lastName: self.user.lastName,
                    org: self.org.id,
                    config: self.user.config,
                    status: self.user.status,
                    policies: self.user.policies,
                    roles: self.user.roles
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

                    Cinema6Service.put('users', self.user.id, user)
                        .then(handleSuccess, handleError);

                } else {
                    $log.info('POST', self.user.email, self.user.firstName, self.user.lastName, self.org.id);

                    user = extend(user, {
                        email: self.user.email,
                        password: self.user.password,
                    });

                    Cinema6Service.post('users', user)
                        .then(handleSuccess, handleError);
                }
            };

            self.freeze = function() {
                ConfirmDialogService.display({
                    prompt: 'Freezing a User will log them out and make them inactive, ' +
                        'are you sure you want to proceed?',
                    affirm: 'Yes',
                    cancel: 'Cancel',
                    onAffirm: function() {
                        $log.info('freezing user: ', self.user);
                        ConfirmDialogService.close();

                        AccountService.freezeUser(self.user.id)
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

            self.delete = function() {
                ConfirmDialogService.display({
                    prompt: 'Are you sure you want to delete this User?',
                    affirm: 'Yes',
                    cancel: 'Cancel',
                    onAffirm: function() {
                        ConfirmDialogService.close();
                        Cinema6Service.delete('users', self.user.id)
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

            $scope.$watch(function() {
                return self.org;
            }, function(newOrg) {
                if (newOrg) {
                    if (self.user.id && self.user.org.id !== self.org.id) {
                        ConfirmDialogService.display({
                            prompt: 'Warning: All of this User\'s Minireels will remain with the original Org.',
                            affirm: 'OK, move User without Minireels',
                            cancel: 'No, leave the User on current Org',
                            onAffirm: function() {
                                ConfirmDialogService.close();
                                // add the org to the user, remove the old config, add the new org's config
                                self.user.org = self.org;
                                self.user.config = null;
                                self.user = addDefaults(self.user, self.org);
                            },
                            onCancel: function() {
                                ConfirmDialogService.close();
                                // set the org back to the user's original org
                                self.org = self.orgs.filter(function(org) {
                                    return org.id === self.user.org.id;
                                })[0];
                            }
                        });
                    }

                    if (!self.user.id) {
                        self.user.config = null;
                        self.user.branding = null;
                        self.user = addDefaults(self.user, newOrg);
                    }
                }
            });
        }]);
});
