define(['account'],function(account) {
    'use strict';

    return angular.module('c6.proshop.users',[account.name])
        .controller('UsersController', ['$scope', '$log', 'account',
        function                       ( $scope ,  $log,   account ) {
            var self = this,
                data = $scope.data;

            $log = $log.context('UsersCtrl');
            $log.info('instantiated');

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

            self.action = 'all';
            self.showUserSettings = false;
            self.userPermissionOptions = angular.copy(account.userPermissionOptions);

            self.userTypes = [
                {label:'Publisher',value:'publisher'},
                {label:'Content Provider',value:'contentProvider'}
            ];

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

            self.editUser = function(user){
                $scope.message = null;
                self.action = 'edit';
                data.user = user;
                data.user.config = data.user.config && data.user.config.defaultSplash ?
                    data.user.config : {
                    defaultSplash: {
                        ratio: '3-2',
                        theme: 'img-text-overlay'
                    }
                };
                data.user.type = data.user.type || 'publisher';
                data.org = data.appData.orgs.filter(function(org) {
                    return user.org.id === org.id;
                })[0];
            };

            self.addNewUser = function() {
                $scope.message = null;
                self.action = 'edit';
                data.user = {
                    config: {
                        defaultSplash: {
                            ratio: '3-2',
                            theme: 'img-text-overlay'
                        }
                    },
                    type: 'publisher'
                };
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

            this.sortOrgs = function(/*field*/) {
                // I imagine there will be something in the UI to allow sorting the list
                // return account.getOrgs(field).then(updateOrgs);
            };

            self.deleteUser = function() {
                $log.info('deleting user: ', data.user);

                account.deleteUser(data.user)
                    .then(function() {
                        $scope.message = 'Successfully deleted user: ' + data.user.email;
                        account.getOrgs().then(updateOrgs);
                        account.getUsers().then(updateUsers);
                        self.action = 'all';
                    }, function(err) {
                        $log.error(err);
                        $scope.message = 'There was a problem deleting this user.';
                    });
            };

            this.saveUser = function() {
                function handleError(err) {
                    // print to page
                    $log.error(err);
                    $scope.message = 'There was a problem creating this user.';
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

            account.getOrgs().then(updateOrgs);
            account.getUsers().then(updateUsers);

            // $scope.$watch(function() { return self.action; }, function(action, lastAction) {
            //     if (action === lastAction) { return; }
            //     if (action === 'all') {
            //         account.getOrgs().then(updateOrgs);
            //         account.getUsers().then(updateUsers);
            //     }
            // });
        }])

        .directive('newUser', [ function ( ) {
            return {
                restrict: 'E',
                templateUrl: 'views/edit_user.html',
                link: function(/*scope, element, attrs, ctrl*/) {
                    // can move any DOM stuff from Ctrl into here...
                }
            };
        }])

        .directive('editUser', [ function ( ) {
            return {
                restrict: 'E',
                templateUrl: 'views/edit_user.html',
                link: function(/*scope, element, attrs, ctrl*/) {
                    // can move any DOM stuff from Ctrl into here...
                }
            };
        }])

        .directive('allUsers', [ function ( ) {
            return {
                restrict: 'E',
                templateUrl: 'views/all_users.html',
                link: function(/*scope, element, attrs, ctrl*/) {
                    // can move any DOM stuff from Ctrl into here...
                }
            };
        }]);
});
