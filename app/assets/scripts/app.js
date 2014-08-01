define( [   'angular','ngAnimate','ngRoute','c6ui','c6log', 'c6defines',
            'auth', 'login','users', 'orgs', 'mockHttp','mockHttpDefs','templates'],
function(   angular , ngAnimate , ngRoute , c6ui , c6log,  c6Defines,
            auth, login, users, orgs, mockHttp, mockHttpDefs, templates ) {
    /* jshint -W106 */
    'use strict';

    return angular.module('c6.proshop', [
            ngAnimate.name,
            ngRoute.name,
            c6ui.name,
            c6log.name,
            auth.name,
            login.name,
            users.name,
            orgs.name,
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
                    templateUrl: 'views/orgs.html'
                })
                .when('/users', {
                    controller: 'UsersController',
                    controllerAs: 'UsersCtrl',
                    templateUrl: 'views/users.html'
                })
                .otherwise({redirectTo: '/users'});
        }])
        .value('appData', {appUser: null, user: null, users: null, org: null, orgs: null})
        .controller('AppController', ['$scope', '$log', '$location', '$timeout', '$q',
                                      'c6Defines','c6LocalStorage', 'auth', 'appData', 'account',
            function(                  $scope ,  $log ,  $location ,  $timeout ,  $q ,
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

                $location.path(path);
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

        .filter('titlecase', function() {
            return function(input) {
                return input.charAt(0).toUpperCase() + input.slice(1);
            };
        });

});
