define(['angular','c6ui'], function(angular,c6ui){
    /* jshint -W106 */
    'use strict';

    var copy = angular.copy,
        forEach = angular.forEach;

    return angular.module('c6.proshop.account',[c6ui.name])
    .controller('AcctChangeCtrl', ['$log', '$scope', 'account',
    function                      ( $log ,  $scope ,  account ){
        var self = this;

        $log = $log.context('AcctChangeCtrl');
        $log.info('instantiated, scope=%1',$scope.$id);

        self.changeEmail = function(origEmail,password,newEmail){
            $log.info('changeEmail:',origEmail,newEmail);

            return account.changeEmail(origEmail,password,newEmail);
        };

        self.changePassword = function(email,origPassword,newPassword){
            $log.info('changePassword:',email);

            return account.changePassword(email,origPassword,newPassword);
        };
    }])

    .directive('changeEmail', ['$log', function ( $log  ){
        return {
            controller: 'AcctChangeCtrl',
            scope: {},
            restrict: 'E',
            templateUrl: 'views/change_email.html',
            link: function fnLink(scope,element,attrs,ctrl) {
                scope.origEmail     = attrs.email;
                scope.email         = null;
                scope.password      = '';
                scope.lastStatus    = null;
                scope.lastCode      = 0;
                scope.emailPattern  = /^\w+.*\w@\w.*\.\w{2,}$/;

                attrs.$observe('email',function(newVal){
                    scope.origEmail = newVal;
                });

                scope.submit = function(){
                    scope.lastStatus = null;
                    scope.lastCode   = 0;
                    scope.email = scope.email.replace(/\s+$/,'');

                    ctrl.changeEmail(scope.origEmail,scope.password,scope.email)
                        .then(function(){
                            $log.info('changed email for:',scope.email);

                            scope.lastStatus = 'User name has been changed.';
                            scope.$emit('emailChange',scope.email,scope.origEmail);
                        })
                        .catch(function(err){
                            $log.warn('failed changed email for:',scope.email,err);

                            scope.lastStatusCode = 1;
                            scope.lastStatus = 'User name change failed: ' + err;
                        });
                };
            }
        };
    }])

    .directive('changePassword', ['$log', function ( $log  ){
        return {
            controller : 'AcctChangeCtrl',
            scope : {
                email : '@'
            },
            restrict : 'E',
            templateUrl : 'views/change_password.html',
            link : function fnLink(scope,element,attrs,ctrl){
                scope.lastStatus    = null;
                scope.lastCode      = 0;
                scope.password = [null,null,null];
                scope.passwordPattern  = /(^\S+$)()/;

                scope.submit = function(){
                    scope.lastStatus = null;
                    scope.lastCode = 0;
                    ctrl.changePassword(scope.email,scope.password[0],scope.password[1])
                        .then(function(){
                            $log.info('changed password for:',scope.email);
                            scope.lastStatus = 'Password has been changed.';
                            scope.password = [null,null,null];
                        })
                        .catch(function(err){
                            $log.warn('failed changed password for:',scope.email,err);
                            scope.lastStatus = 'Password change failed: ' + err;
                            scope.lastCode = 1;
                            scope.password = [null,null,null];
                        });
                };
            }
        };
    }])

    .service('account', ['c6UrlMaker', '$http', '$q', '$timeout',
    function            ( c6UrlMaker ,  $http ,  $q ,  $timeout ){
        function httpWrapper(request) {
            var deferred = $q.defer(),
                deferredTimeout = $q.defer(),
                cancelTimeout;

            request.timeout = deferredTimeout.promise;

            $http(request)
            .success(function(data) {
                $timeout.cancel(cancelTimeout);
                deferred.resolve(data);
            })
            .error(function(data) {
                if (!data) {
                    data = 'Unable to locate failed';
                }
                $timeout.cancel(cancelTimeout);
                deferred.reject(data);
            });

            cancelTimeout = $timeout(function() {
                deferredTimeout.resolve();
                deferred.reject('Request timed out.');
            },10000);

            return deferred.promise;
        }

        function getEnabledOptions(data) {
            return data.map(function(item) {
                if (item.enabled) { return item.value; }
            }).filter(function(item) { return !!item; });
        }

        function convertOrgForSaving(org) {
            // we need to convert the embed size because size === null
            // or an object with width and height set
            var size = org.config.minireelinator.embedDefaults.size;

            // might as well just reset the entire config
            org.config = {
                minireelinator: {
                    embedTypes: getEnabledOptions(org._data.config.minireelinator.embedTypes),
                    minireelDefaults: org.config.minireelinator.minireelDefaults,
                    embedDefaults: {
                        size: (size && !size.width && !size.height) ? null : size
                    }
                }
            };

            org.waterfalls.video = getEnabledOptions(org._data.videoWaterfalls);
            org.waterfalls.display = getEnabledOptions(org._data.displayWaterfalls);

            // loop through the temp adConfig settings and put
            // the actual value on the org
            forEach(org._data.adConfig, function(conf, key) {
                org.adConfig.video[key] = conf.value;
            });

            return org;
        }

        this.waterfallData = {
            settings: [
                {
                    title: 'Video Waterfall Options',
                    description: 'These are options available to the publisher for ad cards in MiniReels',
                    category: 'video',
                    type: 'options'
                },
                {
                    title: 'Video Waterfall Default',
                    description: 'This will be the default waterfall for MiniReels that do not explicitly set a waterfall option',
                    category: 'video',
                    type: 'default'
                },
                {
                    title: 'Display Waterfall Options',
                    description: 'These are options available to the publisher for the display ad module in Companion Ad MiniReels',
                    category: 'display',
                    type: 'options'
                },
                {
                    title: 'Display Waterfall Default',
                    description: 'This will be the default waterfall for Companion Ad MiniReels that do not explicitly set a waterfall option',
                    category: 'display',
                    type: 'default'
                }
            ],
            options: [
                {
                    name: 'Cinema6',
                    value: 'cinema6',
                    enabled: true,
                },
                {
                    name: 'Cinema6 - Publisher',
                    value: 'cinema6-publisher',
                    enabled: false,
                },
                {
                    name: 'Publisher',
                    value: 'publisher',
                    enabled: false,
                },
                {
                    name: 'Publisher - Cinema6',
                    value: 'publisher-cinema6',
                    enabled: false,
                }
            ]
        };

        this.adConfig = {
            types: [
                {
                    title: 'First Placement',
                    description: 'Number of videos before the first ad is shown',
                    label: 'firstPlacement',
                    options: [
                        {
                            label:'No ads',
                            value: -1
                        },
                        {
                            label: 0,
                            value: 0
                        },
                        {
                            label: 1,
                            value: 1
                        },
                        {
                            label: 2,
                            value: 2
                        },
                        {
                            label: 3,
                            value: 3
                        },
                        {
                            label: 4,
                            value: 4
                        },
                        {
                            label: 5,
                            value: 5
                        },
                        {
                            label: 6,
                            value: 6
                        }
                    ],
                },
                {
                    title: 'Ad Frequency',
                    description: 'Number of videos between ads',
                    label: 'frequency',
                    options: [
                        {
                            label: 'Only show first ad',
                            value: 0
                        },
                        {
                            label: 1,
                            value: 1
                        },
                        {
                            label: 2,
                            value: 2
                        },
                        {
                            label: 3,
                            value: 3
                        },
                        {
                            label: 4,
                            value: 4
                        },
                        {
                            label: 5,
                            value: 5
                        },
                        {
                            label: 6,
                            value: 6
                        },
                        {
                            label: 7,
                            value: 7
                        },
                        {
                            label: 8,
                            value: 8
                        },
                        {
                            label: 9,
                            value: 9
                        }
                    ]
                },
                {
                    title: 'Skip Settings',
                    description: 'Controls the users ability to skip the ad, and an optional countdown',
                    label: 'skip',
                    options: [
                        {
                            label: 'No skipping allowed',
                            value: false
                        },
                        {
                            label: 'Skip anytime',
                            value: true
                        },
                        {
                            label: 'After 6 sec.',
                            value: 6
                        },
                        {
                            label: 'After 15 sec.',
                            value: 15
                        },
                        {
                            label: 'After 30 sec.',
                            value: 30
                        },
                        {
                            label: 'After 45 sec.',
                            value: 45
                        },
                        {
                            label: 'After 1 min.',
                            value: 60
                        }
                    ]
                }
            ]
        };

        this.defaultSplashOptions = [
            {
                title: 'Default Splash Ratio',
                description: 'Sets the default aspect ratio for users in the MR Studio',
                options: ['1-1','3-2','6-5','16-9'],
                label: 'ratio'
            },
            {
                title: 'Default Splash Theme',
                description: 'Sets the default embed theme for users in the MR Studio',
                options: ['text-only','img-only','img-text-overlay','vertical-stack','horizontal-stack'],
                label: 'theme'
            }
        ];

        this.userPermissionOptions = {
            experiences: {
                name:   'Experience',
                actions: {
                    read:   {
                        name: 'read',
                        options: ['own','org','all']
                    },
                    create: {
                        name: 'create',
                        options: ['own','org','all']
                    },
                    edit:   {
                        name: 'edit',
                        options: ['own','org','all']
                    },
                    delete: {
                        name: 'delete',
                        options: ['own','org','all']
                    }
                }
            },
            elections: {
                name:   'Election',
                actions: {
                    read:   {
                        name: 'read',
                        options: ['own','org','all']
                    },
                    create: {
                        name: 'create',
                        options: ['own','org','all']
                    },
                    edit:   {
                        name: 'edit',
                        options: ['own','org','all']
                    },
                    delete: {
                        name: 'delete',
                        options: ['own','org','all']
                    }
                }
            },
            users: {
                name: 'User',
                actions: {
                    read:   {
                        name: 'read',
                        options: ['own','org','all']
                    },
                    edit:   {
                        name: 'edit',
                        options: ['own','org','all']
                    }
                }
            },
            orgs: {
                name: 'Org',
                actions: {
                    read:   {
                        name: 'read',
                        options: ['own']
                    },
                    edit:   {
                        name: 'edit',
                        options: ['own']
                    }
                }
            }
        };

        this.changeEmail = function(email,password,newEmail) {
            return httpWrapper({
                method: 'POST',
                url: c6UrlMaker('account/user/email','api'),
                data: {
                    email: email,
                    password: password,
                    newEmail: newEmail
                }
            });
        };

        this.changePassword = function(email,password,newPassword) {
            return httpWrapper({
                method: 'POST',
                url: c6UrlMaker('account/user/password','api'),
                data: {
                    email: email,
                    password: password,
                    newPassword: newPassword
                }
            });
        };

        /*
        ********************
        USERS
        ********************
        */

        this.getUser = function(id) {
            return httpWrapper({
                method: 'GET',
                url: c6UrlMaker('account/user/' + id,'api')
            });
        };

        this.getUsers = function(org) {
            return httpWrapper({
                method: 'GET',
                url: c6UrlMaker('account/users' + (org ? '?org=' + org.id : ''),'api')
            });
        };

        this.putUser = function(id, user) {
            // id,email,password,org,lastName,firstName
            return httpWrapper({
                method: 'PUT',
                url: c6UrlMaker('account/user/' + id,'api'),
                data: user
            });
        };

        this.postUser = function(user) {
            return httpWrapper({
                method: 'POST',
                url: c6UrlMaker('account/user','api'),
                data: user
            });
        };

        this.deleteUser = function(user) {
            return httpWrapper({
                method: 'DELETE',
                url: c6UrlMaker('account/user/' + user.id,'api')
            });
        };

        this.logoutUser = function(id) {
            return httpWrapper({
                method: 'POST',
                url: c6UrlMaker('account/user/logout/' + id, 'api')
            });
        };

        /*
        *****************
        ORGS
        *****************
        */

        this.convertOrgForEditing = function(org) {
            if (!org) {
                // we're creating a new org, here are the defaults
                org = {
                    name: null,
                    status: 'active',
                    waterfalls: {
                        video: ['cinema6'],
                        display: ['cinema6']
                    },
                    config: {
                        minireelinator: {
                            embedTypes: ['script'],
                            minireelDefaults: {
                                mode: 'light',
                                autoplay: true,
                                splash: {
                                    ratio: '3-2',
                                    theme: 'img-text-overlay'
                                }
                            },
                            embedDefaults: {
                                size: null
                            }
                        }
                    },
                    adConfig: {
                        video: {
                            firstPlacement: -1,
                            frequency: 0,
                            waterfall: 'cinema6',
                            skip: 6
                        },
                        display: {
                            waterfall: 'cinema6'
                        }
                    }
                };
            }

            // now we need to make sure that any existing orgs
            // have all the necessary default properties defined

            // not all existing orgs have an adConfig block
            // so if there's no adConfig then set the defaults
            org.adConfig = org.adConfig || {
                video: {
                    firstPlacement: -1,
                    frequency: 0,
                    waterfall: 'cinema6',
                    skip: 6
                },
                display: {
                    waterfall: 'cinema6'
                }
            };

            // every existing org has a config block defined
            // but most are empty, so we don't have to check for
            // the existence of org.config, but we need to check
            // for anything within it.
            // right now we just need a minireelinator block
            // and we're gonna check for every prop within it.
            // if every prop is defined we'll go with it
            org.config.minireelinator = org.config.minireelinator &&
                org.config.minireelinator.embedTypes &&
                org.config.minireelinator.minireelDefaults &&
                org.config.minireelinator.embedDefaults ?
                org.config.minireelinator : {
                    embedTypes: ['script'],
                    minireelDefaults: {
                        mode: 'light',
                        autoplay: true,
                        splash: {
                            ratio: '3-2',
                            theme: 'img-text-overlay'
                        }
                    },
                    embedDefaults: {
                        size: null
                    }
                };

            // now we need to set up the temp data that's
            // used for binding in the UI
            org._data = {
                videoWaterfalls: null,
                displayWaterfalls: null,
                adConfig: {},
                config: {
                    minireelinator: {
                        embedTypes: null,
                    }
                }
            };

            // loop through the waterfall options, check if the org has the option
            // enabled, and if so, set the enabled prop to true for binding in the UI
            org._data.videoWaterfalls = this.waterfallData.options.map(function(option) {
                var copied = copy(option);
                // all existing orgs have waterfall.video defined
                // so no need to protect against undefined
                copied.enabled = org.waterfalls.video.indexOf(option.value) > -1;
                return copied;
            });

            // loop through the waterfall options, check if the org has the option
            // enabled, and if so, set the enabled prop to true for binding in the UI
            org._data.displayWaterfalls = this.waterfallData.options.map(function(option) {
                var copied = copy(option);
                // all existing orgs have waterfall.display defined
                // so no need to protect against undefined
                copied.enabled = org.waterfalls.display.indexOf(option.value) > -1;
                return copied;
            });

            // loop through the adConfig types...
            this.adConfig.types.forEach(function(setting) {
                var convertedProp = setting.options.filter(function(option) {
                    return org.adConfig.video[setting.label] === option.value;
                })[0];

                org._data.adConfig[setting.label] = convertedProp;
            });

            // this should be stored somewhere else...
            org._data.config.minireelinator.embedTypes = [
                {
                    title: 'Script Tag',
                    value: 'script',
                    enabled: false
                },
                {
                    title: 'Wordpress Shortcode',
                    value: 'shortcode',
                    enabled: false
                },
                {
                    title: 'IFrame',
                    value: 'iframe',
                    enabled: false
                }
            ];

            // loop through the embed types and enable appropriately
            org._data.config.minireelinator.embedTypes.forEach(function(setting) {
                setting.enabled = org.config.minireelinator.embedTypes.indexOf(setting.value) > -1;
            });

            return org;
        };

        this.getOrg = function(orgId) {
            return httpWrapper({
                method: 'GET',
                url: c6UrlMaker('account/org/' + orgId,'api')
            });
        };

        this.getOrgs = function(field) {
            return httpWrapper({
                method: 'GET',
                url: c6UrlMaker('account/orgs' + (field ? '?sort=' + field : ''),'api')
            });
        };

        this.putOrg = function(org) {
            org = convertOrgForSaving(org);

            return httpWrapper({
                method: 'PUT',
                url: c6UrlMaker('account/org/' + org.id,'api'),
                data: {
                    name: org.name,
                    status: org.status,
                    adConfig: org.adConfig,
                    waterfalls: org.waterfalls,
                    config: org.config,
                    branding: org.branding
                }
            });
        };

        this.postOrg = function(org) {
            org = convertOrgForSaving(org);

            return httpWrapper({
                method: 'POST',
                url: c6UrlMaker('account/org','api'),
                data: {
                    name: org.name,
                    status: org.status,
                    adConfig: org.adConfig,
                    waterfalls: org.waterfalls,
                    config: org.config,
                    branding: org.branding
                }
            });
        };

        this.deleteOrg = function(org) {
            return httpWrapper({
                method: 'DELETE',
                url: c6UrlMaker('account/org/' + org.id,'api')
            });
        };
    }]);
});
