define( [   'angular','ngAnimate','ngRoute','c6ui','c6log', 'c6defines',
            'auth', 'login','users', 'orgs', 'minireels', 'sites', 'categories', 'templates'],
function(   angular , ngAnimate , ngRoute , c6ui , c6log,  c6Defines,
            auth  ,  login , users ,  orgs ,  minireels ,  sites ,  categories ,  templates ) {
    /* jshint -W106 */
    'use strict';

    var jqLite = angular.element,
        isArray = angular.isArray;

    return angular.module('c6.proshop', [
            ngAnimate.name,
            ngRoute.name,
            c6ui.name,
            c6log.name,
            auth.name,
            login.name,
            users.name,
            orgs.name,
            minireels.name,
            sites.name,
            categories.name,
            templates.name
        ])
        .constant('c6Defines',c6Defines)
        .config(['c6UrlMakerProvider', function( c6UrlMakerProvider ) {
            c6UrlMakerProvider.location(c6Defines.kApiUrl, 'api');
        }])
        .config(['$routeProvider', function( $routeProvider  ){
            $routeProvider
                .when('/login', {
                    controller: 'LoginCtrl',
                    controllerAs: 'LoginCtrl',
                    templateUrl: 'views/login.html'
                })
                // .when('/', {
                //     templateUrl  : c6UrlMakerProvider.makeUrl('views/dashboard.html')
                // })
                .when('/account', {
                    templateUrl  : 'views/account.html'
                })
                .when('/orgs', {
                    controller: 'OrgsController',
                    controllerAs: 'OrgsCtrl',
                    templateUrl: 'views/orgs/orgs.html'
                })
                .when('/users', {
                    controller: 'UsersController',
                    controllerAs: 'UsersCtrl',
                    templateUrl: 'views/users/users.html'
                })
                .when('/user/new', {
                    controller: 'UserController',
                    controllerAs: 'UserCtrl',
                    templateUrl: 'views/users/user.html'
                })
                .when('/user/:id', {
                    controller: 'UserController',
                    controllerAs: 'UserCtrl',
                    templateUrl: 'views/users/user.html'
                })
                .when('/minireels', {
                    controller: 'MinireelsController',
                    controllerAs: 'MinireelsCtrl',
                    templateUrl: 'views/minireels/minireels.html'
                })
                .when('/sites', {
                    controller: 'SitesController',
                    controllerAs: 'SitesCtrl',
                    templateUrl: 'views/sites/sites.html'
                })
                .when('/sites/new', {
                    controller: 'SiteController',
                    controllerAs: 'SiteCtrl',
                    templateUrl: 'views/sites/site.html'
                })
                .when('/sites/:id', {
                    controller: 'SiteController',
                    controllerAs: 'SiteCtrl',
                    templateUrl: 'views/sites/site.html'
                })
                .when('/categories', {
                    controller: 'CategoriesController',
                    controllerAs: 'CategoriesCtrl',
                    templateUrl: 'views/categories/categories.html'
                })
                .when('/category/new', {
                    controller: 'CategoryController',
                    controllerAs: 'CategoryCtrl',
                    templateUrl: 'views/categories/category.html'
                })
                .when('/category/:id', {
                    controller: 'CategoryController',
                    controllerAs: 'CategoryCtrl',
                    templateUrl: 'views/categories/category.html'
                })
                .otherwise({redirectTo: '/users'});
        }])
        .value('appData', {appUser: null, user: null, users: null, org: null, orgs: null})
        .controller('AppController', ['$scope', '$log', '$location', '$timeout', '$q', '$route',
                                      'c6Defines','c6LocalStorage', 'auth', 'appData', 'account',
                                      'content',
            function(                  $scope ,  $log ,  $location ,  $timeout ,  $q , $route,
                                       c6Defines , c6LocalStorage ,  auth ,  appData ,  account ,
                                       content ) {

            var self = this,
                _user;

            function checkApplications(applications) {
                var deferred = $q.defer();

                function handleError(err) {
                    deferred.reject(err);
                }

                if (!applications || !applications.length) {
                    return handleError('You do not have any applications');
                }

                content.getExperiences({ ids: applications.join() })
                    .then(function(experiences) {
                        experiences.forEach(function(experience) {
                            appData[experience.appUri] = experience;
                        });

                        if (appData.proshop && appData['mini-reel-maker']) {
                            deferred.resolve();
                        } else {
                            handleError('You do not have the required applications');
                        }
                    })
                    .catch(handleError);

                return deferred.promise;
            }

            $scope.data = {
                appData: appData
            };

            appData.waterfallData = account.waterfallData;
            appData.adConfig = account.adConfig;
            appData.defaultSplashOptions = account.defaultSplashOptions;

            self.entryPath = $location.path();

            $log = $log.context('AppCtrl');
            $log.info('instantiated, scope=%1, entry=%2', $scope.$id, self.entryPath);

            self.ready = false;
            self.expStart = false;
            self.expDone = false;

            self.goTo = function(path){
                $log.info('goto request:', path);

                if ($location.path() === path) {
                    $route.reload();
                } else {
                    $location.path(path);
                }
            };

            self.updateUser = function(record, skipStore) {
                if (record){
                    if (!skipStore) {
                        c6LocalStorage.set('user', record);
                    }
                } else {
                    c6LocalStorage.remove('user');
                }

                appData.appUser = self.user = (record || null);

                return record;
            };

            self.logout = function() {
                $log.info('logging out');

                auth.logout()
                    ['finally'](function(result) {
                        $log.info('log out returns:', result);
                        $log.info('Logout user:', self.user);

                        self.updateUser(null);
                        self.goTo('/login');
                    });
            };

            self.updateUser(c6LocalStorage.get('user'), true);

            if (self.user) {
                $log.info('checking authStatus');

                auth.checkStatus()
                    .then(function(user) {
                        $log.info('auth check passed: ', user);
                        _user = user;
                        return account.getOrg(user.org);
                    })
                    .then(function(org){
                        $log.info('found user org: ',org);
                        _user.org = org;
                        return checkApplications(_user.applications);
                    })
                    .then(function() {
                        self.updateUser(_user);
                        self.ready = true;
                        self.goTo(self.entryPath || '/');
                    })
                    .catch(function(err) {
                        $log.info('auth check failed: ', err);
                        self.updateUser(null);
                        self.goTo('/login');
                    });
            }

            $scope.$on('$locationChangeStart',function(evt, newUrl, oldUrl) {
                $log.info('locationChange: %1 ===> %2', oldUrl, newUrl);

                var isLogin = !!newUrl.match(/\/login/);

                if (!isLogin && !self.user) {
                    evt.preventDefault();

                    $timeout(function() {
                        self.goTo('/login');
                    });

                    return;
                }

                if (isLogin && self.user) {
                    evt.preventDefault();

                    $timeout(function() {
                        self.goTo('/');
                    });

                    return;
                }

                if (!isLogin && oldUrl === newUrl) {
                    // this only happens when the page is refreshed
                    // at which point the auth check will handle the location change
                    // so prevent this one from instantiating a route controller twice
                    evt.preventDefault();
                    return;
                }
            });

            $scope.$on('loginSuccess',function(evt, user) {
                $log.info('Login succeeded, new user:', user);

                checkApplications(user.applications)
                    .then(function() {
                        self.updateUser(user);
                        self.goTo('/');
                    })
                    .catch(function(err) {
                        $log.info('application check failed: ', err);
                        self.updateUser(null);
                        self.goTo('/login');
                    });
            });

        }])

        .service('ConfirmDialogService', ['$window',
        function                         ( $window ) {
            var model = {},
                dialog = null;

            Object.defineProperty(this, 'model', {
                get: function() {
                    return model;
                }
            });

            Object.defineProperty(model, 'dialog', {
                get: function() {
                    return dialog;
                }
            });

            this.display = function(dialogModel) {
                $window.scrollTo(0,0);
                dialog = dialogModel;
                dialog.onDismiss = dialog.onDismiss || this.close;
            };

            this.close = function() {
                dialog = null;
            };
        }])

        .directive('confirmDialog', ['ConfirmDialogService',
        function                    ( ConfirmDialogService ) {
            return {
                restrict: 'E',
                templateUrl: 'views/directives/confirm_dialog.html',
                scope: {},
                link: function(scope) {
                    scope.model = ConfirmDialogService.model;
                }
            };
        }])

        .directive('ignoreSpaces', [function() {
            return {
                restrict: 'A',
                link: function(scope, element) {
                    element.bind('keydown keypress', function (event) {
                        var value = element[0].value,
                            start = event.target.selectionStart;

                        if(event.which === 32 &&
                            (start === 0 || value.charAt(value.length - 1) === ' ')) {
                            event.preventDefault();
                        }
                    });
                }
            };
        }])

        .directive('paginatorControls', [function() {
            return {
                scope: {
                    limit: '=',
                    page: '=',
                    total: '=',
                    limits: '='
                },
                restrict: 'E',
                templateUrl: 'views/directives/paginator_controls.html',
                controller: 'PaginatorControlsController',
                controllerAs: 'Ctrl'
            };
        }])

        .controller('PaginatorControlsController', ['$scope','c6Computed',
        function                                   ( $scope , c6Computed ) {
            var self = this,
                c = c6Computed($scope),
                state = {
                    page: $scope.page
                };

            function limitTo(num, min, max) {
                return Math.max(Math.min(num, max), min);
            }

            this.showDropDown = false;
            Object.defineProperties(this, {
                page: {
                    get: function() {
                        return state.page;
                    },
                    set: function(page) {
                        /* jshint boss:true */
                        if (!(/^(\d+|)$/).test(page)) {
                            return state.page;
                        }

                        return state.page = page;
                    }
                }
            });
            c(this, 'limitsObject', function() {
                return ($scope.limits || [])
                    .reduce(function(object, limit) {
                        object[limit + ' per page'] = limit;
                        return object;
                    }, {});
            }, ['limits']);

            this.goTo = function(page) {
                /* jshint boss:true */
                return $scope.page = limitTo(page, 1, $scope.total);
            };

            this.setLimit = function(limit) {
                /* jshint boss:true */
                return $scope.limit = limit;
            };

            $scope.$watch('page', function(page) {
                self.page = page;
            });
        }])

        .directive('c6Autoselect', [function() {
            function link(scope, $element) {
                $element.on('focus', function() {
                    this.select();

                    jqLite(this).one('mouseup', function($event) {
                        $event.preventDefault();
                    });
                });
            }

            return {
                link: link
            };
        }])

        .directive('c6ClickOutside', ['$document','$timeout',
        function                     ( $document , $timeout ) {
            function isInElement(child, container) {
                return !!child && (child === container || isInElement(child.parentNode, container));
            }

            return {
                restrict: 'A',
                link: function(scope, $element, attrs) {
                    function handleClick(event) {
                        if (isInElement(event.target, $element[0])) {
                            return;
                        }

                        scope.$apply(function() {
                            scope.$eval(attrs.c6ClickOutside);
                        });
                    }

                    $timeout(function() {
                        $document.on('click', handleClick);
                    }, 0, false);

                    $element.on('$destroy', function() {
                        $document.off('click', handleClick);
                    });
                }
            };
        }])

        .directive('c6Dropdown', ['c6Computed','$compile',
        function                 ( c6Computed , $compile ) {
            function link(scope, $element, attrs, Controller, transclude) {
                var c = c6Computed(scope),
                    $transcludeTarget = $element.find('c6-transclude');

                scope.showDropDown = false;
                c(scope, 'list', function() {
                    return this.options ? ((isArray(this.options) ?
                        this.options.map(function(option) {
                            return [option, option];
                        }) :
                        Object.keys(scope.options).map(function(label) {
                            return [label, this[label]];
                        }, scope.options))) : [];
                }, ['options']);
                Object.defineProperty(scope, 'label', {
                    get: function() {
                        var value = this.value;

                        return this.list.reduce(function(label, option) {
                            return option[1] === value ? option[0] : label;
                        }, null);
                    }
                });

                scope.setValue = function(value) {
                    scope.value = value;
                };

                transclude(scope, function($clone) {
                    var $label = $clone.text() ?
                        $clone : $compile('<span>{{label}}</span>')(scope);

                    $transcludeTarget.append($label);
                });
            }

            return {
                scope: {
                    value: '=',
                    options: '='
                },
                restrict: 'E',
                templateUrl: 'views/directives/c6_dropdown.html',
                link: link,
                transclude: true
            };
        }])

        .filter('paginatorlimits', function() {
            return function(input, params) {
                return input && input.slice(params[0],params[1]);
            };
        })

        .filter('titlecase', function() {
            return function(input) {
                return input.charAt(0).toUpperCase() + input.slice(1);
            };
        });

});
