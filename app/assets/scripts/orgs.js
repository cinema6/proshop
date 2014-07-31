define(['account'],function(account) {
    'use strict';

    return angular.module('c6.proshop.orgs',[account.name])
        .controller('OrgsController', ['$scope', '$log', 'account',
        function                      ( $scope ,  $log,   account ) {
            var self = this,
                data = $scope.data;

            $log = $log.context('OrgsCtrl');
            $log.info('instantiated');

            // copy the same set of options from account service
            // these values will be manipulated and converted
            self.displayWaterfalls = angular.copy(account.waterfallData.options);
            self.videoWaterfalls = angular.copy(account.waterfallData.options);

            // these are options that should come form the proshop experience
            // and should be added to appData when the app loads load time
            self.waterfallData = account.waterfallData;
            self.adConfig = account.adConfig;

            // unnecessary flag for hiding a section of the UI
            self.showWaterfallSettings = true;

            // when org controller loads we want to show
            // the all orgs view
            self.action = 'all';

            function updateOrgs(orgs) {
                data.appData.orgs = orgs;
                data.orgs = orgs;
            }

            function setWaterfalls() {
                // match the org's waterfall setting to the UI
                // this manipulates the waterfall data on the controller

                angular.forEach(self.videoWaterfalls, function(option) {
                    option.enabled = data.org.waterfalls.video.indexOf(option.value) > -1;
                });

                angular.forEach(self.displayWaterfalls, function(option) {
                    option.enabled = data.org.waterfalls.display.indexOf(option.value) > -1;
                });
            }

            function convertWaterfall(data) {
                return data.map(function(item) {
                    if (item.enabled) { return item.value; }
                }).filter(function(item) { return !!item; });
            }

            function setAdConfig() {
                self.adConfig.types.forEach(function(setting) {
                    var convertedProp = setting.options.filter(function(option) {
                        return data.org.adConfig.video[setting.label] === option.value;
                    })[0];

                    data.org.adConfig.video[setting.label] = convertedProp;
                });
            }

            function convertAdConfig(config) {
                return {
                    video: {
                        firstPlacement: config.video.firstPlacement.value,
                        frequency: config.video.frequency.value,
                        skip: config.video.skip.value,
                        waterfall: config.video.waterfall
                    },
                    display: {
                        waterfall: config.display.waterfall
                    }
                };
            }

            self.formIsValid = function() {
                var videoWaterfall = self.videoWaterfalls.filter(function(option) {
                        return option.enabled;
                    }),
                    displayWaterfall = self.displayWaterfalls.filter(function(option) {
                        return option.enabled;
                    });

                return videoWaterfall.length && displayWaterfall.length;
            };

            self.editOrg = function(org){
                // clear any message
                $scope.message = null;

                // change view
                self.action = 'edit';

                // put org on the scope
                data.org = org;
                // data.org = account.convertOrgForEditing(org);

                // null out any users from past orgs
                // that had been viewed
                data.users = null;

                // only add default adConfig if one doesn't exist
                data.org.adConfig = org.adConfig || {
                    video: {
                        firstPlacement: 2,
                        frequency: 0,
                        waterfall: 'cinema6',
                        skip: 6
                    },
                    display: {
                        waterfall: 'cinema6'
                    }
                };

                // set waterfalls and convert ad config data for UI binding
                setWaterfalls();
                setAdConfig();

                // get users to display in UI, just to look at
                account.getUsers(org)
                    .then(function(users) {
                        data.users = users;
                    });
            };

            self.addNewOrg = function() {
                // null out an existing message
                $scope.message = null;

                // change view, this is the same as edit...do we need new vs. edit?
                self.action = 'new';

                // null out any users from previously viewed orgs
                data.users = null;

                // this defines a default org in proshop!
                data.org = {
                    name: null,
                    status: 'active',
                    waterfalls: {
                        video: ['cinema6'],
                        display: ['cinema6']
                    },
                    adConfig: {
                        video: {
                            firstPlacement: 2,
                            frequency: 0,
                            waterfall: 'cinema6',
                            skip: 6
                        },
                        display: {
                            waterfall: 'cinema6'
                        }
                    }
                };

                // set waterfalls and convert ad config data for UI binding
                setWaterfalls();
                setAdConfig();
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

                // one idea:
                // move everything into the account service
                // all conversion would happen in the service

                if (data.org.id) {
                    account.putOrg({
                        id: data.org.id,
                        name: data.org.name,
                        status: data.org.status,
                        adConfig: convertAdConfig(data.org.adConfig),
                        waterfalls: {
                            video: convertWaterfall(self.videoWaterfalls),
                            display: convertWaterfall(self.displayWaterfalls)
                        }
                    }).then(handleSuccess, handleError);
                } else {
                    account.postOrg({
                        name: data.org.name,
                        status: data.org.status,
                        adConfig: convertAdConfig(data.org.adConfig),
                        waterfalls: {
                            video: convertWaterfall(self.videoWaterfalls),
                            display: convertWaterfall(self.displayWaterfalls)
                        }
                    }).then(handleSuccess, handleError);
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
