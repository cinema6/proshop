define(['account','content','splash'],function(account,content,splash) {
    'use strict';

    var copy = angular.copy;

    return angular.module('c6.proshop.minireels',[account.name,content.name,splash.name])
        .controller('MinireelsController', ['$scope','$log','account','content','CollateralService','ConfirmDialogService','$q',
        function                           ( $scope , $log , account , content , CollateralService , ConfirmDialogService , $q ) {
            var self = this,
                data = $scope.data;

            data.org = null;

            function updateOrgs(orgs) {
                data.appData.orgs = orgs;
                data.orgs = orgs;
                return orgs;
            }

            function updateExperiences(exps) {
                data.appData.experiences = exps;
                data.experiences = exps;
                return exps;
            }

            function convertExpForCopying(exp) {
                return content.convertExperienceForCopy(copy(exp));
            }

            function getExperiencesByOrg(org) {
                return content.getExperiencesByOrg(org.id);
            }

            function getUserById(id) {
                return account.getUser(id);
            }

            function getAllOrgs() {
                return copy(data.appData.orgs);
            }

            // called when action === 'orgs' || 'experiences'
            // and the data.org changes (from dropdown)
            function loadExperiences(org) {
                self.loading = true;

                getExperiencesByOrg(org)
                    .then(updateExperiences)
                    .then(function(exps) {
                        var expUserPromiseArray = [];

                        exps.forEach(function(exp) {
                            expUserPromiseArray.push(getUserById(exp.user)
                                .then(function(user) {
                                    exp.user = user;
                                }));
                        });

                        $q.all(expUserPromiseArray)
                            .then(function() {
                                self.loading = false;
                            });
                    })
                    .then(resetQuery)
                    .finally(function() {
                        self.action = 'experiences';
                    });
            }

            // called when action === 'copy'
            // and user selects a target org
            function loadUsers(org) {
                return account.getUsers(org)
                    .then(function(users) {
                        data.users = users;
                    });
            }

            // called when action === 'copy'
            // and the target user has been selected
            function setUserExperienceData(user) {
                data.experience._data.user = user;
            }

            // called when action === 'copy' and the org changes,
            // meaning the user has selected a target org for the copy,
            // so we need to add the necessary data to the experience
            function setOrgExperienceData(org) {
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
                    branding: {
                        publisher: org.branding,
                        custom: ''
                    },
                    config: {
                        minireelinator: {
                            minireelDefaults: setMinireelDefaults()
                        }
                    }
                };
            }

            // called when we're actually
            // about to save the experience...
            // this could move to a service
            function convertFinalExperience() {
                var _data = data.experience._data,
                    exp = copy(data.experience);

                switch (self.brandingSource) {
                case 'none':
                    delete exp.data.branding;
                    break;
                case 'publisher':
                    exp.data.branding = _data.branding.publisher;
                    break;
                // case 'current':
                //     exp.data.branding = exp.data.branding;
                //     break;
                case 'custom':
                    exp.branding = _data.branding.custom;
                    break;
                }

                exp.data.title = data.experience.title;
                // exp.data.branding = _data.branding;
                exp.data.mode = _data.config.minireelinator.minireelDefaults.mode;
                exp.data.autoplay = _data.config.minireelinator.minireelDefaults.autoplay;
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
                delete exp.data.adConfig;
                delete exp._data;

                return exp;
            }

            // called after we've saved the copy
            // gotten the splash image, stored the src
            // and the final minireel is ready to be saved
            function putExperience(exp) {
                $log.info('re-saving experience with new splash: ', exp);

                return content.putExperience(exp)
                    .then(function(mr) {
                        $log.info('re-saved experience with specified splash', mr);
                    });
            }

            // called if minireel needs to generate a splash
            function getGeneratedSplash(minireel) {
                $log.info('generating splash for experience: ', minireel);

                function setSplashSrc(splash) {
                    var ratio = minireel.data.splash.ratio,
                        src = splash[ratio];

                    $log.info('setting splash source: ', src);

                    minireel.data.collateral.splash = src;

                    return minireel;
                }

                return CollateralService.generateCollage({
                    minireel: minireel,
                    width: 600,
                    name: 'splash',
                    cache: false
                }).then(setSplashSrc);
            }

            // called if minireel needs to copy a specified splash
            function getSpecifiedSplash(minireel) {
                var splashToCopy = data.experience.data.collateral.splash;

                function setSplashSrc(response) {
                    var path = '/' + response.data[0].path;

                    $log.info('setting splash source: ', response, path);

                    minireel.data.collateral.splash = path;

                    return minireel;
                }

                $log.info('setting specified splash for experience: ', minireel);

                return CollateralService.setSplash(splashToCopy, minireel)
                    .then(setSplashSrc);
            }

            // called once we've saved the copy
            function getSplash(minireel) {
                var source = minireel.data.splash.source;

                $log.info('getting splash for experience: ', minireel);

                switch (source) {
                case 'generated':
                    return getGeneratedSplash(minireel);
                case 'specified':
                    return getSpecifiedSplash(minireel);
                }
            }

            // called from confirm dialog
            function saveCopy() {
                var exp = convertFinalExperience();

                $log.info('save copy:', exp);

                return content.postExperience(exp)
                    .then(getSplash)
                    .then(putExperience);
                    // .catch(handleError);
            }

            // handles any error from the Save Copy chain
            function handleError(err) {
                $log.error(err);
                ConfirmDialogService.display({
                    prompt: 'Error: ' + err,
                    affirm: 'Close',
                    onAffirm: function() {
                        ConfirmDialogService.close();
                    }
                });
            }

            function resetQuery() {
                data.query = null;
            }

            self.action = 'orgs';
            self.page = 1;
            self.limit = 10;
            self.limits = [5,10,50,100];
            Object.defineProperties(self, {
                total: {
                    get: function() {
                        return data.experiences && Math.ceil(data.experiences.length / self.limit);
                    }
                }
            });
            self.brandingSource = 'none'; // or 'publisher', 'custom', 'current'

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

            // called from 'experience' template
            // when user click 'Copy' in the table
            self.startExperienceCopy = function(exp) {
                self.action = 'copy';
                data.org = null;
                data.user = null;
                data.orgs = getAllOrgs();
                data.experience = convertExpForCopying(exp);
            };

            self.confirmCopy = function() {
                ConfirmDialogService.display({
                    prompt: 'Are you sure you want to finish copying?',
                    affirm: 'Yes, copy this Minireel',
                    cancel: 'No, I\'m not ready',
                    onAffirm: function() {
                        ConfirmDialogService.close();
                        saveCopy().then(function() {
                            self.action = 'orgs';
                            $scope.message = 'Successfully copied.';
                            data.org = null;
                        }, handleError);
                    },
                    onCancel: function() {
                        ConfirmDialogService.close();
                    }
                });
            };

            $scope.$watch('data.org',function(newOrg) {
                if (!newOrg) { return; }

                $scope.message = null;

                // if we're choosing an org or looking at experiences
                // and the org changes, we need to get the experiences of the new org
                if (self.action === 'orgs' || self.action === 'experiences') {
                    loadExperiences(newOrg);
                    self.page = 1;
                }

                // if we're copying a minireel and we select a target org
                // to copy to, we need to add that org's data to the experience
                // and get a list of users in the org so that the minireel
                // can be assigned to someone
                if (self.action === 'copy') {
                    setOrgExperienceData(newOrg);
                    loadUsers(newOrg);
                }
            });

            $scope.$watch('data.user',function(newUser) {
                if (!newUser) { return; }

                // if we're copying a minireel and select a user
                // to assign the new minireel to, we need to copy
                // some of the user's data to the experience before copying
                if (self.action === 'copy') {
                    setUserExperienceData(newUser);
                }
            });

            $scope.$watch(function() {
                return self.page + ':' + self.limit;
            }, function(newVal, oldVal) {
                var samePage;

                if (newVal === oldVal) { return; }

                newVal = newVal.split(':');
                oldVal = oldVal.split(':');

                samePage = newVal[0] === oldVal[0];

                if (self.page !== 1 && samePage) {
                    /* jshint boss:true */
                    return self.page = 1;
                    /* jshint boss:false */
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