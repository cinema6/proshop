(function() {
    'use strict';

    angular.module('c6.proshop')
        .controller('OrgsController', ['account',
        function                      ( account ) {
            var self = this;

            function updateOrgs(data) {
                self.orgs = data;
            }

            // this.addNew = false;

            this.sortOrgs = function(field) {
                // I imagine there will be something in the UI to allow sorting the list
                return account.getOrgs(field).then(updateOrgs);
            };

            account.getOrgs().then(updateOrgs);
        }])

        .controller('NewOrgController', ['account',
        function                        ( account ) {
            var self = this;

            this.displayWaterfalls = angular.copy(account.waterfallOptions);
            this.videoWaterfalls = angular.copy(account.waterfallOptions);
            this.status = 'pending';

            function convertWaterfall(data) {
                return data.map(function(item) {
                    if (item.checked) { return item.value; }
                }).filter(function(item) { return !!item; });
            }

            this.submit = function() {
                console.log([
                    self.name,
                    self.status,
                    self.tag,
                    convertWaterfall(self.videoWaterfalls),
                    convertWaterfall(self.displayWaterfalls),
                    self.minAdCount
                ]);

                // uncomment when body is ready
                // return account.createOrg(body)
            };
        }])

        .directive('newOrg', ['c6UrlMaker',
        function             ( c6UrlMaker ) {
            return {
                controller: 'NewOrgController',
                controllerAs: 'NewOrgCtrl',
                restrict: 'E',
                templateUrl: c6UrlMaker('views/new_org.html'),
                link: function(/*scope, element, attrs, ctrl*/) {
                    // can move any DOM stuff from Ctrl into here...
                }
            };
        }]);
}());