(function() {
    'use strict';

    angular.module('c6.proshop')
        .controller('OrgsController', ['$scope', '$log', 'account',
        function                      ( $scope ,  $log ,  account ) {
            var self = this,
                data = $scope.data;

            $log = $log.context('OrgsCtrl');
            $log.info('instantiated');

            self.displayWaterfalls = angular.copy(account.waterfallOptions);
            self.videoWaterfalls = angular.copy(account.waterfallOptions);
            self.showWaterfallSettings = false;
            self.action = 'all';

            function updateOrgs(orgs) {
                data.appData.orgs = orgs;
                data.orgs = orgs;
            }

            function convertWaterfall(data) {
                return data.map(function(item) {
                    if (item.checked) { return item.value; }
                }).filter(function(item) { return !!item; });
            }

            self.editOrg = function(org){
                self.action = 'edit';
                data.org = org;
            };

            self.addNewOrg = function() {
                self.action = 'new';
                data.org = {
                    name: null,
                    status: 'active'
                };
            };

            self.sortOrgs = function(/*field*/) {
                // I imagine there will be something in the UI to allow sorting the list
                // return account.getOrgs(field).then(updateOrgs);
            };

            self.filterData = function() {
                var query = data.query.toLowerCase();

                data.orgs = data.appData.orgs.filter(function(org) {
                    return org.name.toLowerCase().indexOf(query) >= 0;
                });
            };

            self.saveOrg = function() {
                $log.info('save org: ', [
                    data.org.name,
                    data.org.status,
                    data.org.tag,
                    convertWaterfall(self.videoWaterfalls),
                    convertWaterfall(self.displayWaterfalls),
                    data.org.minAdCount
                ]);
                self.action = 'all';
                // uncomment when body is ready
                // return account.createOrg(body)
            };

            account.getOrgs().then(updateOrgs);

        }])

        .directive('allOrgs', ['c6UrlMaker',
        function              ( c6UrlMaker ) {
            return {
                restrict: 'E',
                templateUrl: c6UrlMaker('views/all_orgs.html'),
            };
        }])

        .directive('newOrg', ['c6UrlMaker',
        function             ( c6UrlMaker ) {
            return {
                restrict: 'E',
                templateUrl: c6UrlMaker('views/edit_org.html'),
            };
        }])

        .directive('editOrg', ['c6UrlMaker',
        function              ( c6UrlMaker ) {
            return {
                restrict: 'E',
                templateUrl: c6UrlMaker('views/edit_org.html'),
            };
        }]);
}());