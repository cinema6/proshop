define(['account','content','splash'],function(account,content,splash) {
    'use strict';

    return angular.module('c6.proshop.minireels',[account.name,content.name,splash.name])
        .controller('MinireelsController', ['$scope','$log','account','content','CollateralService', 'FileService',
        function                           ( $scope , $log , account , content , CollateralService ,  FileService ) {
            var self = this,
                data = $scope.data;

            data.org = null;

            function updateOrgs(orgs) {
                data.appData.orgs = orgs;
                data.orgs = orgs;
            }

            function setUserExperienceData(user) {
                data.experience._data.user = user;
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
                {label:'Created By',value:'user.email'},
                {label:'Branding',value:'branding'},
                {label:'# of Cards',value:'data.deck.length'},
                {label:'Status',value:'status'},
                {label:'Last Updated',value:'lastUpdated'}
            ];

            $scope.sort = {
                column: 'title',
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

            self.filterOrgs = function() {
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
                data.user = null;
                data.orgs = angular.copy(data.appData.orgs);
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
                    }
                };
            }

            self.isGenerating = false;
            self.splash = null;
            self.currentUpload = null;

            function generateSplash(minireel) {
                $log.info('generating splash');
                self.isGenerating = true;

                return CollateralService.generateCollage({
                    minireel: minireel,
                    width: 600,
                    name: 'splash',
                    cache: false
                }).then(function setSplashSrc(splash) {
                    $log.info('generated splash: ', splash);

                    minireel.data.collateral.splash = splash[minireel.data.splash.ratio];

                    content.putExperience(minireel)
                        .then(function(reel) {
                            $log.info('re-saved experience with generated splash: ', reel);
                        }, function(err) {
                            $log.error('error putting the experience back: ', err);
                        });

                    return splash;
                })
                .finally(function setFlag() {
                    self.isGenerating = false;
                });
            }

            function getSpecifiedSplash(minireel) {
                FileService.openBlob(data.experience.data.collateral.splash)
                    .then(function(splash) {
                        var upload;

                        $log.info('Upload started: ', splash);

                        self.currentUpload = upload =
                            CollateralService.setSplash(splash, minireel);

                        return upload
                            .then(function(resp) {
                                minireel.data.collateral.splash = '/' + resp.data[0].path;

                                content.putExperience(minireel).then(function(mr) {
                                    $log.info('re-saved experience with specified splash', mr);
                                }, function() {
                                    //error re-saving experience
                                });
                            })
                            .finally(function cleanup() {
                                $log.info('Uploaded completed!');
                                self.currentUpload = null;
                            });
                    }, function(err) {
                        $log.error('there was an error getting original splash image', err);
                        // there was an error getting original splash image
                    });
            }

            self.saveCopy = function() {
                var _data = data.experience._data,
                    exp = angular.copy(data.experience);

                exp.data.title = data.experience.title;
                exp.data.branding = _data.branding;
                exp.data.mode = _data.config.minireelinator.minireelDefaults.mode;
                exp.data.splash.ratio = _data.config.minireelinator.minireelDefaults.splash.ratio;
                exp.data.splash.theme = _data.config.minireelinator.minireelDefaults.splash.theme;
                exp.data.collateral.splash = null;
                exp.user = _data.user.id;
                exp.org = _data.org;

                delete exp.id;
                delete exp.created;
                delete exp.title;
                delete exp.lastUpdated;
                delete exp.versionId;
                delete exp.adConfig;
                delete exp._data; // should only delete _data if successful POST/PUT

                // after POSTing experience take the exp.id and do splash/collateral stuff
                content.postExperience(exp)
                    .then(function(minireel) {
                        $log.info('saved experience: ', minireel);
                        switch (minireel.data.splash.source) {
                        case 'generated':
                            generateSplash(minireel);
                            break;
                        case 'specified':
                            getSpecifiedSplash(minireel);
                            break;
                        }
                    }, function(err) {
                        $log.error('error posting experience', err);
                        // use a ConfirmDialog here
                    });

                $log.info('save copy:', exp);
            };

            $scope.$watch('data.org',function(newOrg) {
                if ((self.action === 'orgs' || self.action === 'experiences') && newOrg) {
                    self.getExperiences(newOrg);
                }

                if (self.action === 'copy' && newOrg) {
                    setOrgExperienceData(newOrg);
                    account.getUsers(newOrg)
                        .then(function(users) {
                            data.users = users;
                        });
                }
            });

            $scope.$watch('data.user',function(newUser) {
                if (self.action === 'copy' && newUser) {
                    setUserExperienceData(newUser);
                }
            });

            $scope.$watch(function() { return self.action; }, function(newAction) {
                if (newAction === 'orgs') {
                    data.org = null;
                }
            });

            account.getOrgs().then(updateOrgs);
        }])

        .directive('minireelsOrgs', [ function ( ) {
            return {
                restrict: 'E',
                templateUrl: 'views/minireels/minireels_orgs.html',
                link: function(/*scope, element, attrs, ctrl*/) {
                    // can move any DOM stuff from Ctrl into here...
                }
            };
        }])

        .directive('minireelsExperiences', [ function ( ) {
            return {
                restrict: 'E',
                templateUrl: 'views/minireels/minireels_experiences.html',
                link: function(/*scope, element, attrs, ctrl*/) {
                    // can move any DOM stuff from Ctrl into here...
                }
            };
        }])

        .directive('minireelsCopy', [ function ( ) {
            return {
                restrict: 'E',
                templateUrl: 'views/minireels/minireels_copy.html',
                link: function(/*scope, element, attrs, ctrl*/) {
                    // can move any DOM stuff from Ctrl into here...
                }
            };
        }]);
});