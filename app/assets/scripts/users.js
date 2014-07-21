(function() {
    'use strict';

    angular.module('c6.proshop')
        .controller('UsersController', ['$scope', 'account',
        function                       ( $scope ,  account ) {
            var self = this,
                data = $scope.data,
                _data = {};

            console.log('UsersCtrl init');

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

            account.getOrgs().then(updateOrgs);
            account.getUsers().then(updateUsers);

            self.editUser = function(user){
                self.action = 'edit';
                data.user = user;
                data.org = _data.orgs.filter(function(org) {
                    return user.org === org.id;
                })[0];
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

            this.sortOrgs = function(field) {
                // I imagine there will be something in the UI to allow sorting the list
                return account.getOrgs(field).then(updateOrgs);
            };

            this.saveUser = function() {
                if (self.id) {
                    console.log('UPDATE THIS USER');
                    //account.putUser(id,email,password,org,lastName,firstName);
                } else {
                    console.log('CREATE THIS USER');
                    // account.postUser(email,password,org,lastName,firstName);
                }
            };
        }])

        .directive('newUser', ['c6UrlMaker',
        function             ( c6UrlMaker ) {
            return {
                restrict: 'E',
                templateUrl: c6UrlMaker('views/edit_user.html'),
                link: function(/*scope, element, attrs, ctrl*/) {
                    // can move any DOM stuff from Ctrl into here...
                }
            };
        }])

        .directive('editUser', ['c6UrlMaker',
        function             ( c6UrlMaker ) {
            return {
                restrict: 'E',
                templateUrl: c6UrlMaker('views/edit_user.html'),
                link: function(/*scope, element, attrs, ctrl*/) {
                    // can move any DOM stuff from Ctrl into here...
                }
            };
        }])

        .directive('allUsers', ['c6UrlMaker',
        function             ( c6UrlMaker ) {
            return {
                restrict: 'E',
                templateUrl: c6UrlMaker('views/all_users.html'),
                link: function(/*scope, element, attrs, ctrl*/) {
                    // can move any DOM stuff from Ctrl into here...
                }
            };
        }]);
}());