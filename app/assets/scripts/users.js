(function() {
    'use strict';

    angular.module('c6.proshop')
        .controller('UsersController', ['$scope', 'account',
        function                       ( $scope ,  account ) {
            var self = this,
                data = $scope.data;
                // _data = angular.copy(data);

            console.log('UsersCtrl init');

            self.action = 'all';
            self.showUserSettings = false;
            self.userPermissionOptions = angular.copy(account.userPermissionOptions);

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
                self.action = 'edit';
                data.user = user;
                data.org = data.appData.orgs.filter(function(org) {
                    return user.org.id === org.id;
                })[0];
            };

            self.addNewUser = function() {
                self.action = 'edit';
                data.user = null;
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

                    [user.email, user.firstName, user.lastname].forEach(function(field) {
                        bool = (field && field.toLowerCase().indexOf(query) >= 0) || bool;
                    });

                    return bool;
                });
            };

            this.sortOrgs = function(field) {
                // I imagine there will be something in the UI to allow sorting the list
                // return account.getOrgs(field).then(updateOrgs);
            };

            this.saveUser = function() {
                if (data.user.id) {
                    // account.putUser(id,email,password,org,lastName,firstName);
                    console.log('PUT', data.user.id, data.user.email, data.user.firstName, data.user.lastName, data.org.id);
                } else {
                    // account.postUser(email,password,org,lastName,firstName);
                    console.log('POST', data.user.id, data.user.email, data.user.firstName, data.user.lastName, data.org.id);
                }

                self.action = 'all';
            };

            account.getOrgs().then(updateOrgs);
            account.getUsers().then(updateUsers);
        }])

        .directive('newUser', ['c6UrlMaker',
        function              ( c6UrlMaker ) {
            return {
                restrict: 'E',
                templateUrl: c6UrlMaker('views/edit_user.html')
            };
        }])

        .directive('editUser', ['c6UrlMaker',
        function               ( c6UrlMaker ) {
            return {
                restrict: 'E',
                templateUrl: c6UrlMaker('views/edit_user.html'),
            };
        }])

        .directive('allUsers', ['c6UrlMaker',
        function               ( c6UrlMaker ) {
            return {
                restrict: 'E',
                templateUrl: c6UrlMaker('views/all_users.html'),
            };
        }]);
}());