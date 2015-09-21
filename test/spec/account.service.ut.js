(function() {
    'use strict';

    define(['app'], function(proshop) {
        describe('AccountService', function() {
            var $rootScope,
                $httpBackend,
                $q,
                $timeout,
                UserService,
                AccountService,
                c6UrlMaker;

            var successSpy,
                failureSpy;

            beforeEach(function() {
                module('c6.ui', function($provide) {
                    $provide.provider('c6UrlMaker', function(){
                        this.location = jasmine.createSpy('urlMaker.location');
                        this.makeUrl = jasmine.createSpy('urlMaker.makeUrl');
                        this.$get = function(){
                            return jasmine.createSpy('urlMaker.get');
                        };
                    });
                });

                module(proshop.name);

                inject(function($injector) {
                    $rootScope = $injector.get('$rootScope');
                    $httpBackend = $injector.get('$httpBackend');
                    $q = $injector.get('$q');
                    $timeout = $injector.get('$timeout');

                    UserService = $injector.get('UserService');
                    spyOn(UserService, 'put');
                    spyOn(UserService, 'logout');
                    UserService.put.deferred = $q.defer();
                    UserService.put.and.returnValue(UserService.put.deferred.promise);
                    UserService.logout.deferred = $q.defer();
                    UserService.logout.and.returnValue(UserService.logout.deferred.promise);

                    c6UrlMaker = $injector.get('c6UrlMaker');
                    c6UrlMaker.and.callFake(function(path, base) {
                        return '/' + base + '/' + path;
                    });

                    AccountService = $injector.get('AccountService');
                });
            });

            it('should exist', function() {
                expect(AccountService).toEqual(jasmine.any(Object));
            });

            describe('methods', function() {
                describe('freezeUser(id)', function() {
                    beforeEach(function(){
                        successSpy = jasmine.createSpy('get().success');
                        failureSpy = jasmine.createSpy('get().failure');

                        AccountService.freezeUser('u-1').then(successSpy, failureSpy);
                    });

                    it('should PUT the user with "inactive" status and logout the user', function() {
                        expect(UserService.put).toHaveBeenCalledWith('u-1', { status: 'inactive' });
                        expect(UserService.logout).toHaveBeenCalledWith('u-1');
                    });

                    it('should resolve the promise if both callas are successful', function() {
                        $rootScope.$apply(function() {
                            UserService.put.deferred.resolve();
                            UserService.logout.deferred.resolve();
                        });

                        expect(successSpy).toHaveBeenCalled();
                        expect(failureSpy).not.toHaveBeenCalled();
                    });

                    it('should reject the promise if either call fails', function() {
                        $rootScope.$apply(function() {
                            UserService.put.deferred.reject();
                            UserService.logout.deferred.resolve();
                        });

                        expect(successSpy).not.toHaveBeenCalled();
                        expect(failureSpy).toHaveBeenCalled();
                    });
                });

                describe('changeEmail(email,password,newEmail)', function() {
                    beforeEach(function(){
                        successSpy = jasmine.createSpy('changeEmail.success');
                        failureSpy = jasmine.createSpy('changeEmail.failure');
                    });

                    it('will resolve promise if successfull',function(){
                        $httpBackend.expectPOST('/api/account/user/email')
                            .respond(200,'Successfully changed email');
                        AccountService.changeEmail('userX','foobar','usery')
                            .then(successSpy,failureSpy);
                        $httpBackend.flush();
                        expect(successSpy).toHaveBeenCalledWith('Successfully changed email');
                        expect(failureSpy).not.toHaveBeenCalled();
                    });

                    it('will reject promise if not successful',function(){
                        $httpBackend.expectPOST('/api/account/user/email')
                            .respond(400,'Unable to find user.');
                        AccountService.changeEmail('userX','foobar','xx')
                            .then(successSpy,failureSpy);
                        $httpBackend.flush();
                        expect(successSpy).not.toHaveBeenCalled();
                        expect(failureSpy).toHaveBeenCalledWith('Unable to find user.');
                    });

                    it('will reject promise if times out',function(){
                        $httpBackend.expectPOST('/api/account/user/email')
                            .respond(200,{});
                        AccountService.changeEmail('userX','foobar','x')
                            .then(successSpy,failureSpy);
                        $timeout.flush(60000);
                        expect(successSpy).not.toHaveBeenCalled();
                        expect(failureSpy).toHaveBeenCalledWith('Unable to complete request');
                    });
                });

                describe('changePassword()', function() {
                    beforeEach(function(){
                        successSpy = jasmine.createSpy('changePassword.success');
                        failureSpy = jasmine.createSpy('changePassword.failure');
                    });

                    it('will resolve promise if successfull',function(){
                        $httpBackend.expectPOST('/api/account/user/password')
                            .respond(200,"Success");
                        AccountService.changePassword('a','b','c')
                            .then(successSpy,failureSpy);
                        $httpBackend.flush();
                        expect(successSpy).toHaveBeenCalledWith("Success");
                        expect(failureSpy).not.toHaveBeenCalled();
                    });

                    it('will reject promise if not successfull',function(){
                        $httpBackend.expectPOST('/api/account/user/password')
                            .respond(500,'There was an error.');
                        AccountService.changePassword('a','b','c')
                            .then(successSpy,failureSpy);
                        $httpBackend.flush();
                        expect(successSpy).not.toHaveBeenCalled();
                        expect(failureSpy).toHaveBeenCalledWith('There was an error.');
                    });

                    it('will reject promise if times out',function(){
                        $httpBackend.expectPOST('/api/account/user/password').respond(200,{});
                        AccountService.changePassword('a','b','c')
                            .then(successSpy,failureSpy);
                        $timeout.flush(60000);
                        expect(successSpy).not.toHaveBeenCalled();
                        expect(failureSpy).toHaveBeenCalledWith('Unable to complete request');
                    });
                });
            });
        });
    });
}());