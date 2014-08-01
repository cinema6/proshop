define(['account'],function(account) {
    'use strict';

    return angular.module('c6.proshop.orgs',[account.name])
        .controller('OrgsController', ['$scope', '$log', 'account',
        function                      ( $scope ,  $log,   account ) {
            var self = this,
                data = $scope.data;

            $log = $log.context('OrgsCtrl');
            $log.info('instantiated');

            self.showWaterfallSettings = true;
            self.action = 'all';

            function updateOrgs(orgs) {
                data.appData.orgs = orgs;
                data.orgs = orgs;
            }

            self.formIsValid = function() {
                var videoWaterfall = data.org._data.videoWaterfalls.filter(function(option) {
                        return option.enabled;
                    }),
                    displayWaterfall = data.org._data.displayWaterfalls.filter(function(option) {
                        return option.enabled;
                    }),
                    embedType = data.org._data.config.embedTypes.filter(function(option) {
                        return option.enabled;
                    });

                return !!(videoWaterfall.length && displayWaterfall.length && embedType.length);
            };

            self.editOrg = function(org){
                $scope.message = null;
                self.action = 'edit';
                data.users = null;
                data.org = null;
                data.org = account.convertOrgForEditing(angular.copy(org));

                account.getUsers(org)
                    .then(function(users) {
                        data.users = users;
                    });
            };

            self.addNewOrg = function() {
                $scope.message = null;
                self.action = 'new';
                data.users = null;
                data.org = account.convertOrgForEditing();
            };

            self.deleteOrg = function() {
                $log.info('deleting user: ', data.org);

                if (data.users) {
                    $scope.message = 'You must delete or move the Users belonging to this Org before deleting it.';
                    return;
                }

                account.deleteOrg(data.org)
                    .then(function() {
                        $scope.message = 'Successfully deleted org: ' + data.org.name;
                        account.getOrgs().then(updateOrgs);
                        self.action = 'all';
                    }, function(err) {
                        $log.error(err);
                        $scope.message = 'There was a problem deleting this org.';
                    });
            };

            self.sortOrgs = function(/*field*/) {
                // There will be something in the UI to allow sorting the list
                // return account.getOrgs(field).then(updateOrgs);
            };

            self.filterData = function() {
                var query = data.query.toLowerCase();

                data.orgs = data.appData.orgs.filter(function(org) {
                    return org.name.toLowerCase().indexOf(query) >= 0;
                });
            };

            self.saveOrg = function() {
                function handleError(err) {
                    $log.error(err);
                    $scope.message = 'There was a problem saving the org.';
                }

                function handleSuccess(org) {
                    $log.info('saved org: ', org);
                    $scope.message = 'Successfully saved org: ' + org.name;
                    account.getOrgs().then(updateOrgs);
                    self.action = 'all';
                }

                if (data.org.id) {
                    account.putOrg(data.org)
                        .then(handleSuccess, handleError);
                } else {
                    account.postOrg(data.org)
                        .then(handleSuccess, handleError);
                }
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
