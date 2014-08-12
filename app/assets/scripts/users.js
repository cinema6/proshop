define(['account'],function(account) {
    'use strict';

    return angular.module('c6.proshop.users',[account.name])
        .controller('UsersController', ['$scope', '$log', 'account', 'ConfirmDialogService',
        function                       ( $scope ,  $log,   account ,  ConfirmDialogService ) {
            var self = this,
                data = $scope.data;

            $log = $log.context('UsersCtrl');
            $log.info('instantiated');

            function updateOrgs(orgs) {
                data.appData.orgs = orgs;
                data.orgs = orgs;
            }

            function updateUsers(users) {
                users.forEach(function(user) {
                    account.getOrg(user.org)
                        .then(function(org) {
                            user.org = org;
                        });
                });
                data.appData.users = users;
                data.users = users;
            }

            function deleteUser() {
                $log.info('deleting user: ', data.user);

                account.deleteUser(data.user)
                    .then(function() {
                        $scope.message = 'Successfully deleted user: ' + data.user.email;
                        account.getOrgs().then(updateOrgs);
                        account.getUsers().then(updateUsers);
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

            function convertUserForEditing(user, org) {
                user.branding = user.branding || org.branding;
                user.type = user.type || 'Publisher';
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
            self.showUserSettings = false;
            self.userPermissionOptions = angular.copy(account.userPermissionOptions);

            self.userTypes = [
                {label:'Publisher',value:'Publisher'},
                {label:'Content Provider',value:'ContentProvider'}
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
                data.user = {};
                data.org = null;
            };

            self.filterData = function() {
                var query = data.query.toLowerCase(),
                    orgs = data.appData.orgs.filter(function(org) {
                        return org.name.toLowerCase().indexOf(query) >= 0;
                    });

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

            this.sortUsers = function(/*field*/) {
                // I imagine there will be something in the UI to allow sorting the list
                // return account.getOrgs(field).then(updateOrgs);
            };

            self.backToList = function() {
                self.action = 'all';
                account.getOrgs().then(updateOrgs);
                account.getUsers().then(updateUsers);
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

            this.saveUser = function() {
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
                    account.getOrgs().then(updateOrgs);
                    account.getUsers().then(updateUsers);
                    self.action = 'all';
                    data.user = user;
                }

                if (data.user.id) {
                    $log.info('PUT', data.user.id, data.user.email, data.user.firstName, data.user.lastName, data.org.id, data.user.branding);

                    account.putUser({
                        id: data.user.id,
                        firstName: data.user.firstName,
                        lastName: data.user.lastName,
                        org: data.org.id,
                        branding: data.user.branding,
                        config: data.user.config,
                        type: data.user.type
                    }).then(handleSuccess, handleError);
                } else {
                    $log.info('POST', data.user.email, data.user.firstName, data.user.lastName, data.org.id, data.user.branding);

                    account.postUser({
                        email: data.user.email,
                        password: data.user.password,
                        firstName: data.user.firstName,
                        lastName: data.user.lastName,
                        org: data.org.id,
                        branding: data.user.branding,
                        config: data.user.config,
                        type: data.user.type
                    }).then(handleSuccess, handleError);
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
                data.user.branding = null;
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

            account.getOrgs().then(updateOrgs);
            account.getUsers().then(updateUsers);
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
