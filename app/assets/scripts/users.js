(function() {
    'use strict';

    angular.module('c6.proshop')
        .controller('UsersController', ['$scope', '$log', 'account',
        function                       ( $scope ,  $log ,  account ) {
            var self = this,
                data = $scope.data;

            $log = $log.context('UsersCtrl');
            $log.info('instantiated');

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

            this.saveUser = function() {
                function handleError(err) {
                    // print to page
                    $log.info(err);
                }

                function handleSuccess(user) {
                    data.user = user;
                    self.action = 'all';
                }

                if (data.user.id) {
                    $log.info('PUT', data.user.id, data.user.email, data.user.firstName, data.user.lastName, data.org.id);

                    account.putUser({
                        id: data.user.id,
                        email: data.user.email,
                        firstName: data.user.firstName,
                        lastName: data.user.lastName,
                        org: data.org.id
                    }).then(handleSuccess, handleError);
                } else {
                    // account.postUser(email,password,org,lastName,firstName);
                    $log.info('POST', data.user.id, data.user.email, data.user.firstName, data.user.lastName, data.org.id);

                    account.postUser({
                        email: data.user.email,
                        password: data.user.password,
                        firstName: data.user.firstName,
                        lastName: data.user.lastName,
                        org: data.org.id
                    }).then(handleSuccess, handleError);
                }
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