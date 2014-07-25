(function(){
    'use strict';

    define(['login'], function() {
        describe('LoginCtrl', function() {
            var $rootScope,
                $scope,
                $controller,
                $log,
                $q,
                auth,
                account,
                LoginCtrl;

            beforeEach(function() {
                module('c6.proshop');

                account = {
                    getOrg: jasmine.createSpy('account.getOrg')
                };

                inject(function($injector){
                    $controller = $injector.get('$controller');
                    $log = $injector.get('$log');
                    $q = $injector.get('$q');
                    auth = $injector.get('auth');
                    $rootScope = $injector.get('$rootScope');
                    $scope = $rootScope.$new();

                    account.getOrg.deferred = $q.defer();
                    account.getOrg.and.returnValue(account.getOrg.deferred.promise);

                    $log.context = function(){ return $log; }

                    LoginCtrl = $controller('LoginCtrl', { $scope: $scope, account: account });
                });
            });

            it('should exist', function() {
                expect(LoginCtrl).toBeDefined();
            });

            describe('methods', function() {
                describe('login()', function() {
                    beforeEach(function() {
                        spyOn(auth, 'login');
                        spyOn($scope, '$emit');
                    });

                    it('should emit success when successful', function() {
                        var user = { id : 'user', org: 'org' };

                        auth.login.and.returnValue($q.when(user));

                        $scope.$apply(function() {
                            LoginCtrl.email = 'test';
                            LoginCtrl.password = 'password';
                            LoginCtrl.login();
                            account.getOrg.deferred.resolve({name: 'Org1', id: 'org'});
                        });

                        expect($scope.$emit).toHaveBeenCalledWith('loginSuccess', user);
                    });

                    it('should put an error message on the controller on error', function() {
                        auth.login.and.returnValue($q.reject('Failed to work'));

                        $scope.$apply(function() {
                            LoginCtrl.email = 'test';
                            LoginCtrl.password = 'password';
                            LoginCtrl.login();
                        });

                        expect(LoginCtrl.loginError).toBe('Failed to work');
                    });

                    it('should do nothing if missing email and/or password', function() {
                        auth.login.and.returnValue($q.when({}));

                        $scope.$apply(function() {
                            LoginCtrl.login();
                        });

                        expect(auth.login).not.toHaveBeenCalled();
                        expect(LoginCtrl.loginError).toBe('Email and password required.');

                        $scope.$apply(function() {
                            LoginCtrl.email = 'test';
                            LoginCtrl.password = null;
                            LoginCtrl.login();
                        });

                        expect(auth.login).not.toHaveBeenCalled();
                        expect(LoginCtrl.loginError).toBe('Email and password required.');

                        $scope.$apply(function() {
                            LoginCtrl.email = null;
                            LoginCtrl.password = 'password';
                            LoginCtrl.login();
                        });

                        expect(auth.login).not.toHaveBeenCalled();
                        expect(LoginCtrl.loginError).toBe('Email and password required.');

                        $scope.$apply(function() {
                            LoginCtrl.email = 'test';
                            LoginCtrl.password = '   ';
                            LoginCtrl.login();
                        });

                        expect(auth.login).not.toHaveBeenCalled();
                        expect(LoginCtrl.loginError).toBe('Email and password required.');

                        $scope.$apply(function() {
                            LoginCtrl.email = '  ';
                            LoginCtrl.password = 'password';
                            LoginCtrl.login();
                        });

                        expect(auth.login).not.toHaveBeenCalled();
                        expect(LoginCtrl.loginError).toBe('Email and password required.');
                    });
                });
            });
        });
    });

}());

