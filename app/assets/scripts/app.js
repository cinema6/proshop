define( [   'angular','ngAnimate','ngRoute','c6ui','c6log', 'c6defines',
            'auth', 'login','users', 'orgs', 'minireels', 'mockHttp','mockHttpDefs','templates'],
function(   angular , ngAnimate , ngRoute , c6ui , c6log,  c6Defines,
            auth, login, users, orgs, minireels, mockHttp, mockHttpDefs, templates ) {
    /* jshint -W106 */
    'use strict';

    var jqLite = angular.element;

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
            templates.name
        ])
        .constant('c6Defines',c6Defines)
        .config(['$provide', function($provide) {
            if (mockHttp.httpDecorator){
                $provide.decorator('$http', ['$delegate', mockHttp.httpDecorator]);
            }
        }])
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
                .when('/minireels', {
                    controller: 'MinireelsController',
                    controllerAs: 'MinireelsCtrl',
                    templateUrl: 'views/minireels/minireels.html'
                })
                .otherwise({redirectTo: '/users'});
        }])
        .value('appData', {appUser: null, user: null, users: null, org: null, orgs: null})
        .controller('AppController', ['$scope', '$log', '$location', '$timeout', '$q', '$route',
                                      'c6Defines','c6LocalStorage', 'auth', 'appData', 'account',
            function(                  $scope ,  $log ,  $location ,  $timeout ,  $q , $route,
                                       c6Defines , c6LocalStorage ,  auth ,  appData ,  account ) {

            var self = this,
                _user;

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
            });

            $scope.$on('loginSuccess',function(evt, user) {
                $log.info('Login succeeded, new user:', user);

                self.updateUser(user);
                self.goTo('/');
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

        .controller('PaginatorControlsController', ['$scope',
        function                                   ( $scope ) {
            var self = this,
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
            return {
                restrict: 'A',
                link: function(scope, $element, attrs) {
                    function handleClick(event) {
                        if (event.target === $element[0] || event.target.parentElement === $element[0]) {
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

        .filter('paginatorlimits', function() {
            return function(input, params) {
                // console.log(input);
                return input && input.slice(params[0],params[1]);
            };
        })

        .filter('titlecase', function() {
            return function(input) {
                return input.charAt(0).toUpperCase() + input.slice(1);
            };
        });

});
