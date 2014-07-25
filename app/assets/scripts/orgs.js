define(['account'],function(account) {
    'use strict';

    return angular.module('c6.proshop.orgs',[account.name])
        .controller('OrgsController', ['$scope', '$log', 'account',
        function                      ( $scope , $log,  account ) {
            var self = this,
                data = $scope.data,
                _data = angular.copy(data);

            self.displayWaterfalls = angular.copy(account.waterfallOptions);
            self.videoWaterfalls = angular.copy(account.waterfallOptions);
            self.showWaterfallSettings = false;
            self.action = 'all';

            function updateOrgs(orgs) {
                data.orgs = orgs;
                _data.orgs = orgs;
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

                data.orgs = _data.orgs.filter(function(org) {
                    return org.name.toLowerCase().indexOf(query) >= 0;
                });
            };

            self.saveOrg = function() {
                $log.info([
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

        .directive('allOrgs', [ function ( ) {
            return {
                restrict: 'E',
                templateUrl: 'views/all_orgs.html',
                link: function(/*scope, element, attrs, ctrl*/) {
                    // can move any DOM stuff from Ctrl into here...
                }
            };
        }])

        .directive('newOrg', [ function ( ) {
            return {
                restrict: 'E',
                templateUrl: 'views/edit_org.html',
                link: function(/*scope, element, attrs, ctrl*/) {
                    // can move any DOM stuff from Ctrl into here...
                }
            };
        }])

        .directive('editOrg', [ function ( ) {
            return {
                restrict: 'E',
                templateUrl: 'views/edit_org.html',
                link: function(/*scope, element, attrs, ctrl*/) {
                    // can move any DOM stuff from Ctrl into here...
                }
            };
        }]);
});
