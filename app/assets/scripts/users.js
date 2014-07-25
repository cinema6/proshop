define(['account'],function(account) {
    'use strict';

    return angular.module('c6.proshop.users',[account.name])
        .controller('UsersController', ['$scope', '$log', 'account',
        function                       ( $scope , $log,  account ) {
            var self = this,
                data = $scope.data,
                _data = angular.copy(data);

            $log.info('UsersCtrl init');

            self.action = 'all';
            self.showUserSettings = false;
            self.userPermissionOptions = angular.copy(account.userPermissionOptions);

            function updateOrgs(orgs) {
                data.orgs = orgs;
                _data.orgs = orgs;
            }

            function updateUsers(users) {
                data.users = users;
                _data.users = users;
            }

            self.editUser = function(user){
                self.action = 'edit';
                data.user = user;
                data.org = _data.orgs.filter(function(org) {
                    return user.org === org.id;
                })[0];
            };

            self.addNewUser = function() {
                self.action = 'edit';
                data.user = null;
            };

            self.filterData = function() {
                var query = data.query.toLowerCase(),
                    orgs = _data.orgs.filter(function(org) {
                        return org.name.toLowerCase().indexOf(query) >= 0;
                    });

                data.users = _data.users.filter(function(user) {
                    var bool = false;

                    orgs.forEach(function(org) {
                        if (user.org.indexOf(org.id) >= 0) {
                            bool = true;
                        }
                    });

                    [user.email, user.firstName, user.lastname].forEach(function(field) {
                        if (field && field.toLowerCase().indexOf(query) >= 0) {
                            bool = true;
                        }
                    });

                    return bool;
                });
            };

            this.sortOrgs = function(/*field*/) {
                // I imagine there will be something in the UI to allow sorting the list
                // return account.getOrgs(field).then(updateOrgs);
            };

            this.saveUser = function() {
                if (data.user.id) {
                    // account.putUser(id,email,password,org,lastName,firstName);
                    $log.info('PUT', data.user.id, data.user.email, data.user.firstName, data.user.lastName, data.org.id);
                } else {
                    // account.postUser(email,password,org,lastName,firstName);
                    $log.info('POST', data.user.id, data.user.email, data.user.firstName, data.user.lastName, data.org.id);
                }

                self.action = 'all';
            };

            account.getOrgs().then(updateOrgs);
            account.getUsers().then(updateUsers);
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
