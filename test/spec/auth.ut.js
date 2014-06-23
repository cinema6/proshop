(function(){
    'use strict';

    define(['auth'], function() {
        describe('auth', function() {
            var $httpBackend, $timeout, auth, successSpy, failureSpy,
                c6UrlMaker;

            beforeEach(function(){
                module('c6.ui', ['$provide', function($provide) {
                    $provide.provider('c6UrlMaker', function(){
                        this.location = jasmine.createSpy('urlMaker.location');
                        this.makeUrl = jasmine.createSpy('urlMaker.makeUrl');
                        this.$get = function(){
                            return jasmine.createSpy('urlMaker.get');
                        };
                    });
                }]);

                module('c6.proshop');

                inject(['$injector',function($injector){
                    auth = $injector.get('auth');
                    $timeout = $injector.get('$timeout');
                    $httpBackend = $injector.get('$httpBackend');
                    c6UrlMaker = $injector.get('c6UrlMaker');
                }]);
            });

            describe('login method', function(){
                beforeEach(function(){
                    successSpy = jasmine.createSpy('login.success');
                    failureSpy = jasmine.createSpy('login.failure');

                    spyOn($timeout, 'cancel');

                    c6UrlMaker.and.returnValue('/api/auth/login');
                });

                it('will resolve promise if successfull',function(){
                    var mockUser = { id: 'userX' };

                    $httpBackend.expectPOST('/api/auth/login').respond(200,mockUser);

                    auth.login('userX','foobar').then(successSpy,failureSpy);

                    $httpBackend.flush();

                    expect(successSpy).toHaveBeenCalledWith(mockUser);
                    expect(failureSpy).not.toHaveBeenCalled();
                    expect($timeout.cancel).toHaveBeenCalled();
                });

                it('will reject promise if not successful',function(){
                    $httpBackend.expectPOST('/api/auth/login')
                        .respond(404,'Unable to find user.');

                    auth.login('userX','foobar').then(successSpy,failureSpy);

                    $httpBackend.flush();

                    expect(successSpy).not.toHaveBeenCalled();
                    expect(failureSpy).toHaveBeenCalledWith('Unable to find user.');
                    expect($timeout.cancel).toHaveBeenCalled();
                });

                it('will reject promise if times out',function(){
                    $httpBackend.expectPOST('/api/auth/login').respond(200,{});

                    auth.login('userX','foobar').then(successSpy,failureSpy);

                    $timeout.flush(60000);

                    expect(successSpy).not.toHaveBeenCalled();
                    expect(failureSpy).toHaveBeenCalledWith('Request timed out.');
                });
            });

            describe('checkStatus method', function(){
                beforeEach(function(){
                    successSpy = jasmine.createSpy('checkStatus.success');
                    failureSpy = jasmine.createSpy('checkStatus.failure');

                    spyOn($timeout,'cancel');

                    c6UrlMaker.and.returnValue('/api/auth/status');
                });

                it('will resolve promise if successfull',function(){
                    var mockUser = { id: 'userX' };

                    $httpBackend.expectGET('/api/auth/status').respond(200,mockUser);

                    auth.checkStatus().then(successSpy,failureSpy);

                    $httpBackend.flush();

                    expect(successSpy).toHaveBeenCalledWith(mockUser);
                    expect(failureSpy).not.toHaveBeenCalled();
                    expect($timeout.cancel).toHaveBeenCalled();
                });

                it('will reject promise if not successful',function(){
                    $httpBackend.expectGET('/api/auth/status')
                        .respond(404,'Unable to find user.');

                    auth.checkStatus().then(successSpy,failureSpy);

                    $httpBackend.flush();

                    expect(successSpy).not.toHaveBeenCalled();
                    expect(failureSpy).toHaveBeenCalledWith('Unable to find user.');
                    expect($timeout.cancel).toHaveBeenCalled();
                });

                it('will reject promise if times out',function(){
                    $httpBackend.expectGET('/api/auth/status').respond(200,{});

                    auth.checkStatus().then(successSpy,failureSpy);

                    $timeout.flush(60000);

                    expect(successSpy).not.toHaveBeenCalled();
                    expect(failureSpy).toHaveBeenCalledWith('Request timed out.');
                });

            });

            describe('logout', function(){
                beforeEach(function(){
                    successSpy = jasmine.createSpy('logout.success');
                    failureSpy = jasmine.createSpy('logout.failure');

                    spyOn($timeout,'cancel');

                    c6UrlMaker.and.returnValue('/api/auth/logout');
                });

                it('will resolve promise if successfull',function(){
                    $httpBackend.expectPOST('/api/auth/logout').respond(200,"Success");

                    auth.logout().then(successSpy,failureSpy);

                    $httpBackend.flush();

                    expect(successSpy).toHaveBeenCalledWith("Success");
                    expect(failureSpy).not.toHaveBeenCalled();
                    expect($timeout.cancel).toHaveBeenCalled();
                });

                it('will reject promise if not successfull',function(){
                    var mockErr = { error : 'Error processing logout' };

                    $httpBackend.expectPOST('/api/auth/logout').respond(500,mockErr);

                    auth.logout().then(successSpy,failureSpy);

                    $httpBackend.flush();

                    expect(successSpy).not.toHaveBeenCalled();
                    expect(failureSpy).toHaveBeenCalledWith(mockErr.error);
                    expect($timeout.cancel).toHaveBeenCalled();
                });

                it('will reject promise if times out',function(){
                    $httpBackend.expectPOST('/api/auth/logout').respond(200,{});

                    auth.logout().then(successSpy,failureSpy);

                    $timeout.flush(60000);

                    expect(successSpy).not.toHaveBeenCalled();
                    expect(failureSpy).toHaveBeenCalledWith('Request timed out.');
                });
            });
        });

    });
}());