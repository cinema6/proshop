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
                })
                .when('/account', {
                    templateUrl  : c6UrlMakerProvider.makeUrl('views/account.html')
                })
                .when('/orgs', {
                    controller: 'OrgsController',
                    controllerAs: 'OrgsCtrl',
                    templateUrl: c6UrlMakerProvider.makeUrl('views/orgs.html')
                })
                .when('/users', {
                    controller: 'UsersController',
                    controllerAs: 'UsersCtrl',
                    templateUrl: c6UrlMakerProvider.makeUrl('views/users.html')
                })
                .when('/org/new', {
                    controller: 'NewOrgController',
                    controllerAs: 'NewOrgCtrl',
                    templateUrl: c6UrlMakerProvider.makeUrl('views/new_org.html')
                })
                .when('/user/new', {
                    controller: 'NewUserController',
                    controllerAs: 'NewUserCtrl',
                    templateUrl: c6UrlMakerProvider.makeUrl('views/new_user.html')
                });
        }])
        .value('appData', {user: null, app: null, orgs: null, org: null, users: null})
        .controller('AppController', ['$scope', '$log', '$location', '$timeout',
                                      'c6Defines','c6LocalStorage', 'auth', 'appData', 'account',
            function(                  $scope ,  $log ,  $location ,  $timeout,
                                       c6Defines , c6LocalStorage ,  auth ,  appData ,  account ) {

            var self = this;

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

            self.updateUser = function(record, skipStore){
                if (record){
                    if (!skipStore){
                        c6LocalStorage.set('user', record);
                    }
                } else {
                    c6LocalStorage.remove('user');
                }

                appData.user = self.user = (record || null);
                appData.app  = (record) ? record.currentApp : null;

                return record;
            };

            self.logout = function(){
                $log.info('logging out');

                auth.logout()
                    ['finally'](function(result){
                        $log.info('log out returns:', result);
                        $log.info('Logout user:', self.user);

                        self.updateUser(null);
                        self.goTo('/login');
                    });
            };

            self.updateUser(c6LocalStorage.get('user'), true);

            if (self.user){
                $log.info('checking authStatus');

                auth.checkStatus()
                    .then(function(user){
                        $log.info('auth check passed: ', user);

                        return account.getOrg(user.org)
                            .then(function(org){
                                $log.info('found user org: ',org);
                                user.org = org;
                                self.ready = true;
                                self.updateUser(user);
                                self.goTo(self.entryPath || '/');
                            });
                    })
                    .then(null, function(err){
                        $log.info('auth check failed: ', err);

                        self.updateUser(null);
                        self.goTo('/login');
                    });
            }

            // $scope.app = {
            //     data: appData
            // };

            $scope.$on('$locationChangeStart',function(evt, newUrl, oldUrl){
                $log.info('locationChange: %1 ===> %2', oldUrl, newUrl);

                var isLogin = !!newUrl.match(/\/login/);

                if (!isLogin && !self.user){
                    evt.preventDefault();

                    $timeout(function(){
                        self.goTo('/login');
                    });

                    return;
                }

                if (isLogin && self.user){
                    evt.preventDefault();

                    $timeout(function(){
                        self.goTo('/');
                    });

                    return;
                }
            });

            $scope.$on('loginSuccess',function(evt, user){
                $log.info('Login succeeded, new user:', user);

                self.updateUser(user);
                self.goTo('/');
            });

        }]);

}(window));
