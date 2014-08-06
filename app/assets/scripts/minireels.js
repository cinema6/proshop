define(['account','content'],function(account,content) {
    'use strict';

    return angular.module('c6.proshop.minireels',[account.name,content.name])
        .controller('MinireelsController', ['$scope','$log','account','content',
        function                           ( $scope , $log , account , content ) {
            var self = this,
                data = $scope.data;

            function updateOrgs(orgs) {
                data.appData.orgs = orgs;
                data.orgs = orgs;
            }

            $scope.tableHeaders = [
                {label:'Choose an Org to view Minireels',value:'name'},
                {label:'Status',value:'status'},
                {label:'Tag',value:'tag'},
                {label:'Min Ad Count',value:'minAdCount'}
            ];

            $scope.experienceTableHeaders = [
                {label:'Title',value:'title'},
                {label:'Mode',value:'data.mode'},
                {label:'User',value:'user.email'},
                {label:'# of Cards',value:'data.deck.length'},
                {label:'Status',value:'status'}
            ];

            $scope.sort = {
                column: 'name',
                descending: false
            };

            $scope.doSort = function(column) {
                var sort = $scope.sort;
                if (sort.column === column) {
                    sort.descending = !sort.descending;
                } else {
                    sort.column = column;
                    sort.descending = false;
                }
            };

            self.action = 'orgs';

            self.defaultModes = [
                {label:'Embedded',value:'light'},
                {label:'Lightbox, with Companion',value:'lightbox-ads'},
                {label:'Lightbox, without Companion',value:'lightbox'}
            ];

            self.embedTypes = [
                {
                    title: 'Script Tag',
                    value: 'script',
                    enabled: false
                },
                {
                    title: 'Wordpress Shortcode',
                    value: 'shortcode',
                    enabled: false
                }
            ];

            self.formIsValid = function() {
                var embedType = self.embedTypes.filter(function(option) {
                        return option.enabled;
                    });

                return !!(embedType.length);
            };

            self.filterData = function() {
                var query = data.query.toLowerCase();

                data.orgs = data.appData.orgs.filter(function(org) {
                    return org.name.toLowerCase().indexOf(query) >= 0;
                });
            };

            self.filterExperiences = function() {
                var query = data.query.toLowerCase();

                data.experiences = data.appData.experiences.filter(function(exp) {
                    return exp.title.toLowerCase().indexOf(query) >= 0;
                });
            };

            self.getExperiences = function(org) {
                content.getExperiencesByOrg(org.id)
                    .then(function(experiences) {
                        self.action = 'experiences';
                        data.query = null;
                        data.appData.experiences = experiences;
                        data.experiences = experiences;

                        experiences.forEach(function(exp) {
                            account.getUser(exp.user)
                                .then(function(user) {
                                    exp.user = user;
                                });
                        });
                    });
            };

            self.startExperienceCopy = function(exp) {
                self.action = 'copy';
                data.org = null;
                data.experience = content.convertExperienceForCopy(angular.copy(exp));
            };

            function setOrgExperienceData(org) {
                // TO DO: functional style like MRinator copy() conversions

                function setMinireelDefaults() {
                    var mrDefaults = (org.config &&
                        org.config.minireelinator &&
                        org.config.minireelinator.minireelDefaults) ?
                        org.config.minireelinator.minireelDefaults :
                        null;

                    if (!mrDefaults) {
                        return {
                            mode: 'light',
                            autoplay: true,
                            splash: {
                                ratio: '3-2',
                                theme: 'img-text-overlay'
                            }
                        };
                    } else {
                        return {
                            mode: mrDefaults.mode || 'light',
                            autoplay: mrDefaults.autoplay === void 0 ? true : mrDefaults.autoplay,
                            splash: {
                                ratio: mrDefaults.splash && mrDefaults.splash.ratio ? mrDefaults.splash.ratio : '3-2',
                                theme: mrDefaults.splash && mrDefaults.splash.theme ? mrDefaults.splash.theme : 'img-text-overlay'
                            }
                        };
                    }
                }

                data.experience._data = {
                    org: org.id,
                    branding: org.branding,
                    config: {
                        minireelinator: {
                            minireelDefaults: setMinireelDefaults()
                        }
                    },
                    adConfig: org.adConfig
                };
            }

            $scope.$watch('data.org',function(newOrg) {
                if (newOrg) {
                    setOrgExperienceData(newOrg);
                    account.getUsers(newOrg)
                        .then(function(users) {
                            data.users = users;
                        });
                }
            });

            function setUserExperienceData(user) {
                data.experience._data.user = user;
            }

            self.saveCopy = function() {
                var _data = data.experience._data,
                    exp = data.experience;

                exp.data.title = data.experience.title; // do
                exp.data.branding = _data.branding;
                exp.data.mode = _data.config.minireelinator.minireelDefaults.mode;
                exp.data.splash = {
                    ratio: _data.config.minireelinator.minireelDefaults.splash.ratio,
                    theme: _data.config.minireelinator.minireelDefaults.splash.theme,
                    source: 'generated'
                };
                exp.user = _data.user;
                exp.org = _data.org;
                exp.adConfig = _data.adConfig;

                delete exp.id;
                delete exp.created;
                delete exp.title;
                delete exp.lastUpdated;
                delete exp.versionId;
                delete exp._data; // should only delete _data if successful POST/PUT

                // TODO: handle splash image and collateral property

                console.log(exp);
            }

            $scope.$watch('data.user',function(newUser) {
                if (newUser) {
                    setUserExperienceData(newUser);
                }
            });

            account.getOrgs().then(updateOrgs);
        }])

        .directive('minireelsOrgs', [ function ( ) {
            return {
                restrict: 'E',
                templateUrl: 'views/minireels_orgs.html',
                link: function(/*scope, element, attrs, ctrl*/) {
                    // can move any DOM stuff from Ctrl into here...
                }
            };
        }])

        .directive('minireelsExperiences', [ function ( ) {
            return {
                restrict: 'E',
                templateUrl: 'views/minireels_experiences.html',
                link: function(/*scope, element, attrs, ctrl*/) {
                    // can move any DOM stuff from Ctrl into here...
                }
            };
        }])

        .directive('minireelsCopy', [ function ( ) {
            return {
                restrict: 'E',
                templateUrl: 'views/minireels_copy.html',
                link: function(/*scope, element, attrs, ctrl*/) {
                    // can move any DOM stuff from Ctrl into here...
                }
            };
        }]);
});