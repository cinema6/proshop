(function(){
    'use strict';

    define(['app'], function() {
        describe('AppController', function() {
            var $location,
                $log,
                $q,
                $rootScope,
                $scope,
                $timeout,
                AppCtrl,
                appData,
                auth,
                account,
                content,
                c6Defines,
                localStorage,
                createAppCtrl,
                mockUser;

            beforeEach(function() {
                appData = {
                    appUser : null,
                    user: null, users: null, org: null, orgs: null
                };

                auth = {
                    login: jasmine.createSpy('auth.login'),
                    logout: jasmine.createSpy('auth.logout'),
                    checkStatus: jasmine.createSpy('auth.checkStatus')
                };

                account = {
                    getOrg: jasmine.createSpy('account.getOrg')
                };

                content = {
                    getExperiences: jasmine.createSpy('content.getExperience')
                };

                c6Defines = {
                    kTracker: {
                        accountId: 'account1',
                        config: 'auto'
                    }
                };

                localStorage = {
                    set: jasmine.createSpy('localStorage.set'),
                    get: jasmine.createSpy('localStorage.get'),
                    remove: jasmine.createSpy('localStorage.remove')
                };

                $location = {
                    path: jasmine.createSpy('$location.path')
                };

                module('c6.proshop');

                inject(function($injector, $controller) {
                    $log = $injector.get('$log');
                    $q = $injector.get('$q');
                    $rootScope = $injector.get('$rootScope');
                    $timeout = $injector.get('$timeout');

                    account.getOrg.deferred = $q.defer();
                    account.getOrg.and.returnValue(account.getOrg.deferred.promise);

                    content.getExperiences.deferred = $q.defer();
                    content.getExperiences.and.returnValue(content.getExperiences.deferred.promise);

                    auth.checkStatus.deferred = $q.defer();
                    auth.checkStatus.and.returnValue(auth.checkStatus.deferred.promise);

                    auth.logout.deferred = $q.defer();
                    auth.logout.and.returnValue(auth.logout.deferred.promise);

                    $log.context = function(){ return $log; }

                    $scope = $rootScope.$new();

                    spyOn($scope,'$on').and.callFake(function(e,h){
                        if (!$scope._on){
                            $scope._on = {};
                        }
                        $scope._on[e] = h;
                    });

                    createAppCtrl = function(){
                        AppCtrl = $controller('AppController', {
                            $location: $location,
                            $log: $log,
                            $scope: $scope,
                            appData: appData,
                            auth: auth,
                            c6Defines: c6Defines,
                            c6LocalStorage: localStorage,
                            account: account,
                            content: content
                        });
                    };
                });
            });

            describe('initialization',function(){

                it('should exist',function() {
                    createAppCtrl();
                    expect(AppCtrl).toBeDefined();
                });

                it('should put appData on the $scope', function() {
                    createAppCtrl();
                    expect($scope.data.appData).toEqual(appData);
                });

                it('should attempt to get a user from local storage',function(){
                    createAppCtrl();
                    expect(localStorage.get).toHaveBeenCalledWith('user');
                });

                describe('checkAuthStatus',function(){
                    beforeEach(function(){
                        mockUser = {
                            id: 'user1',
                            applications: ['app1','app2','app3']
                        };

                        localStorage.get.and.returnValue(mockUser);
                        createAppCtrl();
                    });

                    it('should be checked if a user is found in storage',function(){
                        expect(AppCtrl.user).toBe(mockUser);
                        expect(appData.appUser).toBe(mockUser);
                        expect(auth.checkStatus).toHaveBeenCalled();
                    });

                    it('success should update user and move to entryPath if set',function(){
                        var newUser = { id : 'new', applications: ['app1','app2']}, org = { id: 'o1' };

                        AppCtrl.entryPath = '/foo';

                        spyOn(AppCtrl, 'updateUser');

                        account.getOrg.deferred.resolve(org)
                        auth.checkStatus.deferred.resolve(newUser);
                        content.getExperiences.deferred.resolve([{appUri: 'proshop'}, {appUri: 'mini-reel-maker'}]);

                        $scope.$apply();

                        expect(AppCtrl.updateUser).toHaveBeenCalledWith(newUser);
                        expect($location.path).toHaveBeenCalledWith('/foo');
                    });

                    it('success should update user and move to / if no entryPath',function(){
                        var newUser = {id: 'new', applications: ['app1','app2']}, org = { id: 'o1' };

                        spyOn(AppCtrl, 'updateUser');

                        auth.checkStatus.deferred.resolve(newUser);
                        account.getOrg.deferred.resolve(org)
                        content.getExperiences.deferred.resolve([{appUri: 'proshop'}, {appUri: 'mini-reel-maker'}]);

                        $scope.$apply();

                        expect(AppCtrl.updateUser).toHaveBeenCalledWith(newUser);
                        expect($location.path).toHaveBeenCalledWith('/');
                    });

                    it('should remove user and go to /login if applications request fail', function() {
                        var newUser = {id: 'new', applications: ['app1','app2']}, org = { id: 'o1' };

                        spyOn(AppCtrl, 'updateUser');

                        auth.checkStatus.deferred.resolve(newUser);
                        account.getOrg.deferred.resolve(org)
                        content.getExperiences.deferred.reject();

                        $scope.$apply();

                        expect(AppCtrl.updateUser).toHaveBeenCalledWith(null);
                        expect($location.path).toHaveBeenCalledWith('/login');
                    });

                    it('should remove user and go to /login if applications do not include proshop and mini-reel-maker', function() {
                        var newUser = {id: 'new', applications: ['app1','app2']}, org = { id: 'o1' };

                        spyOn(AppCtrl, 'updateUser');

                        auth.checkStatus.deferred.resolve(newUser);
                        account.getOrg.deferred.resolve(org)
                        content.getExperiences.deferred.resolve([{appUri: 'proshop'}]);

                        $scope.$apply();

                        expect(AppCtrl.updateUser).toHaveBeenCalledWith(null);
                        expect($location.path).toHaveBeenCalledWith('/login');
                    });

                    it('failure should update user to null and move to login',function(){
                        spyOn(AppCtrl, 'updateUser');

                        auth.checkStatus.deferred.reject({});

                        $scope.$apply();

                        expect(AppCtrl.updateUser).toHaveBeenCalledWith(null);
                        expect($location.path).toHaveBeenCalledWith('/login');
                    });
                });
            });

            describe('goTo',function(){
                it('will call $location.path with path if no errors',function(){
                    createAppCtrl();
                    AppCtrl.goTo('/monkey');
                    expect($location.path).toHaveBeenCalledWith('/monkey');
                });
            });

            describe('updateUser',function(){
                beforeEach(function(){
                    createAppCtrl();
                });

                describe('with user === null',function(){
                    it('will remove user from localstorage',function(){
                        AppCtrl.updateUser(null);
                        expect(localStorage.remove).toHaveBeenCalledWith('user');
                    });

                    it('will set AppCtrl.user = null',function(){
                        AppCtrl.updateUser(null);
                        expect(AppCtrl.user).toBeNull();
                    });

                    it('will set appData.appUser = null',function(){
                        AppCtrl.updateUser(null);
                        expect(appData.appUser).toBeNull();
                    });
                });

                describe('with user === undefined',function(){
                    it('will remove user from localstorage',function(){
                        AppCtrl.updateUser(undefined);
                        expect(localStorage.remove).toHaveBeenCalledWith('user');
                    });

                    it('will set AppCtrl.user = null',function(){
                        AppCtrl.updateUser(undefined);
                        expect(AppCtrl.user).toBeNull();
                    });

                    it('will set appData.user = null, appData.app = null',function(){
                        AppCtrl.updateUser(undefined);
                        expect(appData.appUser).toBeNull();
                    });
                });

                describe('with user === user', function(){
                    beforeEach(function(){
                        mockUser = {
                            id: 'howard1',
                            applications: [ 'e1' ]
                        };
                    });

                    it('will add user to localstorage',function(){
                        AppCtrl.updateUser(mockUser);
                        expect(localStorage.set).toHaveBeenCalledWith('user',mockUser);
                    });

                    it('will set AppCtrl.user to new user',function(){
                        AppCtrl.appUser = null;
                        AppCtrl.updateUser(mockUser);
                        expect(AppCtrl.user).toBe(mockUser);
                    });

                    it('will set userData based on user settings',function(){
                        appData.appUser = null;
                        AppCtrl.updateUser(mockUser);
                        expect(appData.appUser).toBe(mockUser);
                    });
                });
            });

            describe('logout',function(){
                var mockEvent, logout;

                beforeEach(function(){
                    createAppCtrl();

                    spyOn(AppCtrl,'updateUser');
                });

                it('should trigger a user update and route to /login if resolves',function(){
                    AppCtrl.logout();

                    auth.logout.deferred.resolve();

                    $scope.$apply();

                    expect(AppCtrl.updateUser).toHaveBeenCalledWith(null);
                    expect($location.path).toHaveBeenCalledWith('/login');
                });

                it('should trigger a user update and route to /login if rejects',function(){
                    AppCtrl.logout();

                    auth.logout.deferred.reject();

                    $scope.$apply();

                    expect(AppCtrl.updateUser).toHaveBeenCalledWith(null);
                    expect($location.path).toHaveBeenCalledWith('/login');
                });
            });

            describe('$scope.$on($locationChangeStart)',function(){
                var mockEvent, $locationChangeStart;

                beforeEach(function(){
                    mockUser = {
                        id: 'user',
                        applications: [ 'app1' ]
                    };

                    mockEvent = {
                        preventDefault: jasmine.createSpy('event.preventDefault')
                    };

                    createAppCtrl();

                    $locationChangeStart = $scope._on['$locationChangeStart'];
                });

                it('should have a listener',function(){
                    expect($locationChangeStart).toBeDefined();
                });

                it('url === / with AppCtrl.users set',function(){
                    AppCtrl.user = mockUser;

                    $locationChangeStart(mockEvent, '/', null);

                    expect(mockEvent.preventDefault).not.toHaveBeenCalled();
                });

                it('url === / with $scope.users not set',function(){
                    AppCtrl.user = null;

                    $locationChangeStart(mockEvent, '/', null);

                    $timeout.flush();

                    expect(mockEvent.preventDefault).toHaveBeenCalled();
                    expect($location.path).toHaveBeenCalledWith('/login');
                });

                it('url === /login with AppCtrl.users set',function(){
                    AppCtrl.user = mockUser;

                    $locationChangeStart(mockEvent, '/login', null);

                    $timeout.flush();

                    expect(mockEvent.preventDefault).toHaveBeenCalled();
                    expect($location.path).toHaveBeenCalledWith('/');
                });

                it('url === /login with AppCtrl.users not set',function(){
                    AppCtrl.user = null;

                    $locationChangeStart(mockEvent, '/login', null);

                    expect(mockEvent.preventDefault).not.toHaveBeenCalled();
                });

                it('refreshing page when url === /users and user is set', function() {
                    AppCtrl.user = mockUser;

                    $locationChangeStart(mockEvent, '/users', '/users');

                    expect(mockEvent.preventDefault).toHaveBeenCalled();
                });

            });

            describe('$scope.$on(loginSuccess)',function(){
                var mockEvent, loginSuccess;

                beforeEach(function(){
                    mockUser = {
                        id: 'user',
                        org: 'org',
                        applications: ['app1','app2']
                    };

                    mockEvent = {
                        preventDefault: jasmine.createSpy('event.preventDefault')
                    };

                    createAppCtrl();

                    spyOn(AppCtrl, 'updateUser');

                    loginSuccess = $scope._on['loginSuccess'];
                });

                it('should have a listener',function(){
                    expect(loginSuccess).toBeDefined();
                });

                it('should trigger a user update if applications are retrieved',function(){
                    loginSuccess(mockEvent, mockUser);

                    content.getExperiences.deferred.resolve([{appUri: 'proshop'}, {appUri: 'mini-reel-maker'}]);

                    $scope.$apply();

                    expect(AppCtrl.updateUser).toHaveBeenCalledWith(mockUser);
                    expect($location.path).toHaveBeenCalledWith('/');
                });

                it('should remove user and go to /login if applications request fail', function() {
                    loginSuccess(mockEvent, mockUser);

                    content.getExperiences.deferred.reject();

                    $scope.$apply();

                    expect(AppCtrl.updateUser).toHaveBeenCalledWith(null);
                    expect($location.path).toHaveBeenCalledWith('/login');
                });

                it('should remove user and go to /login if applications do not include proshop and mini-reel-maker', function() {
                    loginSuccess(mockEvent, mockUser);

                    content.getExperiences.deferred.resolve([{appUri: 'proshop'}]);

                    $scope.$apply();

                    expect(AppCtrl.updateUser).toHaveBeenCalledWith(null);
                    expect($location.path).toHaveBeenCalledWith('/login');
                });
            });
        });
    });
}());
