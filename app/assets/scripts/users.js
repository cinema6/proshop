(function() {
    'use strict';

    angular.module('c6.proshop')
        .controller('UsersController', ['$scope', 'account','appData',
        function                       ( $scope ,  account , appData ) {
            var self = this;

            this.data = appData;
            this.org = appData.org;

            function updateOrgs(data) {
                // self.orgs = data;
                // AppCtrl.orgs = data;
                appData.orgs = data;
            }

            function updateUsers(data) {
                // self.users = data;
                // AppCtrl.users = data;
                appData.users = data;
            }

            this.sortOrgs = function(field) {
                // I imagine there will be something in the UI to allow sorting the list
                return account.getOrgs(field).then(updateOrgs);
            };

            account.getOrgs().then(updateOrgs);

            $scope.$watch(function() { return self.org; }, function(newOrg, oldOrg) {
                if(newOrg === oldOrg) { return; }
                appData.org = newOrg;
                account.getUsers(newOrg).then(updateUsers);
            });
        }])

        .controller('NewUserController', ['$scope','account','appData',
        function                         ( $scope , account , appData ) {
            var self = this;

            this.data = appData;
            this.org = appData.org;
            this.status = 'pending';
            this.userPermissionOptions = angular.copy(account.userPermissionOptions);

            this.submit = function() {
                console.log([
                    self.name,
                    self.status,
                    self.org
                ]);

                // uncomment when body is ready
                // return account.createOrg(body)
            };
        }])

        .directive('newUser', ['c6UrlMaker',
        function             ( c6UrlMaker ) {
            return {
                controller: 'NewUserController',
                controllerAs: 'NewUserCtrl',
                restrict: 'E',
                templateUrl: c6UrlMaker('views/new_user.html'),
                link: function(/*scope, element, attrs, ctrl*/) {
                    // can move any DOM stuff from Ctrl into here...
                }
            };
        }]);
}());