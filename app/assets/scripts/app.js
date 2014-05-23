(function(window$){
    /* jshint -W106 */
    'use strict';

    var isUndefined = angular.isUndefined;

    angular.module('c6.proshop', window$.c6.kModDeps)
        .constant('c6Defines', window$.c6)
        .config(['$provide', function($provide) {
            if (window$.c6HttpDecorator){
                $provide.decorator('$http', ['$delegate', window$.c6HttpDecorator]);
            }
        }])
        .config(['c6UrlMakerProvider', 'c6Defines',
        function( c6UrlMakerProvider ,  c6Defines ) {
            c6UrlMakerProvider.location(c6Defines.kBaseUrl, 'default');
            c6UrlMakerProvider.location(c6Defines.kApiUrl, 'api');
        }])
        .config(['$routeProvider','c6UrlMakerProvider',
        function( $routeProvider , c6UrlMakerProvider ){
            $routeProvider
                .when('/login', {
                    controller: 'LoginCtrl',
                    controllerAs: 'LoginCtrl',
                    templateUrl: c6UrlMakerProvider.makeUrl('views/login.html')
                });
        }])
        .value('appData', {user: null, app: null})
        .controller('AppController', ['$scope', '$log', '$location', '$timeout',
                                      'c6Defines','c6LocalStorage', 'auth', 'appData',
            function(                  $scope ,  $log ,  $location ,  $timeout,
                                       c6Defines , c6LocalStorage ,  auth ,  appData ) {

            var self = this;

            self.entryPath = $location.path();

            $log = $log.context('AppCtrl');
            $log.info('instantiated, scope=%1, entry=%2', $scope.$id, self.entryPath);

            $scope.AppCtrl = this;

            self.ready = false;
            self.expStart = false;
            self.expDone = false;

            self.goto = function(path){
                $log.info('goto request:', path);

                $location.path(path);
            };

            self.updateUser = function(rec, skipStore){
                if (rec){
                    if (isUndefined(rec.applications)){
                        rec.applications = [];
                    }
                    if (rec.applications.length >= 1){
                        rec.currentApp = rec.applications[0];
                    } else {
                        // lastError.set('No applications for user: ' + rec.email,500);
                    }
                    if (!skipStore){
                        c6LocalStorage.set('user', rec);
                    }
                } else {
                    c6LocalStorage.remove('user');
                }

                appData.user = self.user = (rec || null);
                appData.app  = (rec) ? rec.currentApp : null;

                return rec;
            };

            self.logout = function(){
                $log.info('logging out');

                auth.logout()
                ['finally'](function(result){
                    $log.info('log out returns:', result);
                    $log.info('Logout user:', self.user);

                    self.updateUser(null);
                    self.goto('/login');
                });
            };

            self.updateUser(c6LocalStorage.get('user'), true);

            if (self.user){
                $log.info('checking authStatus');

                auth.checkStatus()
                .then(function(user){
                    $log.info('auth check passed: ', user);

                    self.ready = true;
                    self.updateUser(user);
                    self.goto(self.entryPath || '/');
                },
                function(err){
                    $log.info('auth check failed: ', err);

                    self.updateUser(null);
                    self.goto('/login');
                });
            }

            $scope.$on('$locationChangeStart',function(evt, newUrl, oldUrl){
                $log.info('locationChange: %1 ===> %2', oldUrl, newUrl);

                var isLogin = !!newUrl.match(/\/login/);

                if (!isLogin && !self.user){
                    evt.preventDefault();

                    $timeout(function(){
                        self.goto('/login');
                    });

                    return;
                }

                if (isLogin && self.user){
                    evt.preventDefault();

                    $timeout(function(){
                        self.goto('/');
                    });

                    return;
                }
            });

            $scope.$on('loginSuccess',function(evt, user){
                $log.info('Login succeeded, new user:', user);

                self.updateUser(user);
                self.goto('/');
            });

        }]);

}(window));
