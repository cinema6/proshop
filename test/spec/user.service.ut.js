(function() {
    'use strict';

    define(['app'], function(proshop) {
        var copy = angular.copy;

        describe('UserService', function() {
            var $rootScope,
                $httpBackend,
                $q,
                OrgService,
                UserService,
                c6UrlMaker,
                successSpy,
                failureSpy;

            var mockUser,
                mockUsers,
                mockOrg;

            beforeEach(function() {
                /* jsHint quotmark:false */
                mockUser = {
                    "id": "u-115",
                    "email": "saxguy@reelcontent.com",
                    "status": "active",
                    "org": "o-115",
                    "config": {
                        "minireelinator": {
                            "minireelDefaults": {
                                "splash": {
                                    "ratio": "3-2",
                                    "theme": "img-text-overlay"
                                }
                            }
                        }
                    },
                    "policies": [],
                    "roles": [],
                    "lastName": "sdfsdf",
                    "firstName": "sfdsf",
                    "branding": "khaki",
                    "lastUpdated": "2014-09-03T20:27:41.370Z"
                };

                mockUsers = [
                    {
                        "email": "saxguy@reelcontent.com",
                        "status": "active",
                        "org": "o-115",
                        "config": {
                            "minireelinator": {
                                "minireelDefaults": {
                                    "splash": {
                                        "ratio": "3-2",
                                        "theme": "img-text-overlay"
                                    }
                                }
                            }
                        },
                        "policies": [],
                        "roles": [],
                        "lastName": "sdfsdf",
                        "firstName": "sfdsf",
                        "branding": "khaki",
                        "lastUpdated": "2014-09-03T20:27:41.370Z"
                    },
                    {
                        "email": "test1@example.com",
                        "firstName": "Johnny",
                        "lastName": "Testmonkey",
                        "branding": "elitedaily",
                        "created": "2014-06-13T19:28:39.408Z",
                        "lastUpdated": "2015-01-20T19:30:41.961Z",
                        "org": "o-111",
                        "status": "active",
                        "config": {
                            "minireelinator": {
                                "minireelDefaults": {
                                    "splash": {
                                        "ratio": "3-2",
                                        "theme": "img-text-overlay"
                                    }
                                }
                            }
                        },
                        "type": "Publisher"
                    },
                    {
                        "email": "email2@sample.com",
                        "firstName": "Emailio",
                        "lastName": "Addresstevez",
                        "branding": "specialtheme",
                        "created": "2014-06-13T19:28:39.408Z",
                        "lastUpdated": "2014-06-13T19:28:39.408Z",
                        "org": "o-112",
                        "status": "active",
                        "config": {}
                    }
                ];

                mockOrg = {
                    "name": "Organization 1",
                    "minAdCount": 0,
                    "created": "2014-06-13T19:28:39.408Z",
                    "lastUpdated": "2014-06-13T19:28:39.408Z",
                    "status": "active",
                    "tag": "foo",
                    "config": {
                        "embedTypes": ["shortcode"]
                    },
                    "waterfalls": {
                        "video": ["cinema6"],
                        "display": ["cinema6"]
                    }
                };
                /* jshint quotmark:single */

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

                    OrgService = $injector.get('OrgService');
                    OrgService.get.deferred = $q.defer();
                    spyOn(OrgService, 'get').and.returnValue(OrgService.get.deferred.promise);

                    c6UrlMaker = $injector.get('c6UrlMaker');
                    c6UrlMaker.and.callFake(function(path, base) {
                        return '/' + base + '/' + path;
                    });

                    UserService = $injector.get('UserService');
                });
            });

            describe('initialization', function() {
                it('should exist', function() {
                    expect(UserService).toEqual(jasmine.any(Object));
                });

                it('should set the apiBase', function() {
                    expect(c6UrlMaker).toHaveBeenCalledWith('account/user','api');
                });
            });

            describe('methods', function() {
                describe('get(id)', function() {
                    beforeEach(function(){
                        successSpy = jasmine.createSpy('get().success');
                        failureSpy = jasmine.createSpy('get().failure');
                    });

                    it('will decorate the customer with advertiser objects and resolve promise if successfull',function(){
                        var decoratedUser = copy(mockUser);
                        decoratedUser.org = copy(mockOrg);

                        $httpBackend.expectGET('/api/account/user/u-111')
                            .respond(200,mockUser);
                        UserService.get('u-111').then(successSpy,failureSpy);
                        OrgService.get.deferred.resolve(mockOrg)
                        $httpBackend.flush();

                        expect(OrgService.get).toHaveBeenCalledWith('o-115');
                        expect(successSpy).toHaveBeenCalledWith(decoratedUser);
                        expect(failureSpy).not.toHaveBeenCalled();
                    });

                    it('will handle a user with no Org', function() {
                        var user = copy(mockUser);
                        delete user.org;

                        $httpBackend.expectGET('/api/account/user/u-111')
                            .respond(200,user);
                        UserService.get('u-111').then(successSpy,failureSpy);
                        $httpBackend.flush();

                        expect(OrgService.get).not.toHaveBeenCalled();
                        expect(successSpy).toHaveBeenCalledWith(user);
                        expect(failureSpy).not.toHaveBeenCalled();
                    });

                    it('will reject promise if not successful',function(){
                        $httpBackend.expectGET('/api/account/user/u-115')
                            .respond(404,'Unable to find users.');
                        UserService.get('u-115').then(successSpy,failureSpy);
                        $httpBackend.flush();
                        expect(successSpy).not.toHaveBeenCalled();
                        expect(failureSpy).toHaveBeenCalledWith('Unable to find users.');
                    });

                    it('will reject promise if decoration call is not successful',function(){
                        $httpBackend.expectGET('/api/account/user/u-115')
                            .respond(200,mockUser);
                        UserService.get('u-115').then(successSpy,failureSpy);
                        OrgService.get.deferred.reject();
                        $httpBackend.flush();
                        expect(successSpy).not.toHaveBeenCalled();
                        expect(failureSpy).toHaveBeenCalledWith('Unable to complete request');
                    });
                });

                describe('getAll(params)', function() {
                    beforeEach(function(){
                        successSpy = jasmine.createSpy('getAll().success');
                        failureSpy = jasmine.createSpy('getAll.failure');
                    });

                    it('will accept empty params and will decorate each customer with org objects', function() {
                        var decoratedUsers = copy(mockUsers);

                        decoratedUsers[0].org = copy(mockOrg);
                        decoratedUsers[1].org = copy(mockOrg);
                        decoratedUsers[2].org = copy(mockOrg);

                        $httpBackend.expectGET('/api/account/users')
                            .respond(200,mockUsers,{'Content-Range': 'items 1-19/19'});
                        UserService.getAll().then(successSpy,failureSpy);
                        OrgService.get.deferred.resolve(mockOrg);
                        $httpBackend.flush();

                        expect(OrgService.get).toHaveBeenCalledWith('o-115');
                        expect(successSpy).toHaveBeenCalledWith(jasmine.objectContaining({
                            data: decoratedUsers,
                            meta: {
                                items: {
                                    start: 1,
                                    end: 19,
                                    total: 19
                                }
                            }
                        }));

                        expect(failureSpy).not.toHaveBeenCalled();
                    });

                    it('will handle users with no Org', function() {
                        var users = copy(mockUsers),
                            decoratedUsers;

                        delete users[1].org;

                        decoratedUsers = copy(users);
                        decoratedUsers[0].org = copy(mockOrg);
                        decoratedUsers[2].org = copy(mockOrg);

                        $httpBackend.expectGET('/api/account/users')
                            .respond(200,users,{'Content-Range': 'items 1-19/19'});
                        UserService.getAll().then(successSpy,failureSpy);
                        OrgService.get.deferred.resolve(mockOrg);
                        $httpBackend.flush();

                        expect(OrgService.get).toHaveBeenCalledWith('o-115');
                        expect(successSpy).toHaveBeenCalledWith(jasmine.objectContaining({
                            data: decoratedUsers,
                            meta: {
                                items: {
                                    start: 1,
                                    end: 19,
                                    total: 19
                                }
                            }
                        }));

                        expect(successSpy.calls.mostRecent().args[0].data[1].org).toBe(undefined);

                        expect(failureSpy).not.toHaveBeenCalled();
                    });

                    it('will decorate the customers with org and resolve promise if successfull',function(){
                        var decoratedUsers = copy(mockUsers);

                        decoratedUsers[0].org = copy(mockOrg);
                        decoratedUsers[1].org = copy(mockOrg);
                        decoratedUsers[2].org = copy(mockOrg);

                        $httpBackend.expectGET('/api/account/users?ids=u-1,u-2,u-3&limit=3')
                            .respond(200,mockUsers,{'Content-Range': 'items 1-19/19'});
                        UserService.getAll({ids: 'u-1,u-2,u-3', limit: 3}).then(successSpy,failureSpy);
                        OrgService.get.deferred.resolve(mockOrg);
                        $httpBackend.flush();

                        expect(OrgService.get).toHaveBeenCalledWith('o-115');
                        expect(successSpy).toHaveBeenCalledWith(jasmine.objectContaining({
                            data: decoratedUsers,
                            meta: {
                                items: {
                                    start: 1,
                                    end: 19,
                                    total: 19
                                }
                            }
                        }));
                        expect(failureSpy).not.toHaveBeenCalled();
                    });

                    it('will reject promise if not successful',function(){
                        $httpBackend.expectGET('/api/account/users?ids=u-1,u-2,u-3&limit=3')
                            .respond(404,'Unable to find customers.');
                        UserService.getAll({ids: 'u-1,u-2,u-3', limit: 3}).then(successSpy,failureSpy);
                        $httpBackend.flush();
                        expect(successSpy).not.toHaveBeenCalled();
                        expect(failureSpy).toHaveBeenCalledWith('Unable to find customers.');
                    });

                    it('will reject promise if decoration call is not successful',function(){
                        $httpBackend.expectGET('/api/account/users?ids=u-1,u-2,u-3&limit=3')
                            .respond(200,mockUsers,{'Content-Range': 'items 1-19/19'});
                        UserService.getAll({ids: 'u-1,u-2,u-3', limit: 3}).then(successSpy,failureSpy);
                        OrgService.get.deferred.reject();
                        $httpBackend.flush();
                        expect(successSpy).not.toHaveBeenCalled();
                        expect(failureSpy).toHaveBeenCalledWith('Unable to complete request');
                    });
                });

                describe('put(id, model)', function() {
                    beforeEach(function(){
                        successSpy = jasmine.createSpy('put.success');
                        failureSpy = jasmine.createSpy('put.failure');
                    });

                    it('will resolve promise if successfull',function(){
                        $httpBackend.expectPUT('/api/account/user/u-115')
                            .respond(200,mockUser);
                        UserService.put(mockUser.id, mockUser).then(successSpy,failureSpy);
                        $httpBackend.flush();
                        expect(successSpy).toHaveBeenCalledWith(mockUser);
                        expect(failureSpy).not.toHaveBeenCalled();
                    });

                    it('will reject promise if not successful',function(){
                        $httpBackend.expectPUT('/api/account/user/u-115')
                            .respond(404,'Unable to update user.');
                        UserService.put(mockUser.id, mockUser).then(successSpy,failureSpy);
                        $httpBackend.flush();
                        expect(successSpy).not.toHaveBeenCalled();
                        expect(failureSpy).toHaveBeenCalledWith('Unable to update user.');
                    });
                });

                describe('post(model)', function() {
                    beforeEach(function(){
                        successSpy = jasmine.createSpy('post.success');
                        failureSpy = jasmine.createSpy('post.failure');
                    });

                    it('will resolve promise if successfull',function(){
                        $httpBackend.expectPOST('/api/account/user')
                            .respond(200,mockUser);
                        UserService.post(mockUser).then(successSpy,failureSpy);
                        $httpBackend.flush();
                        expect(successSpy).toHaveBeenCalledWith(mockUser);
                        expect(failureSpy).not.toHaveBeenCalled();
                    });

                    it('will reject promise if not successful',function(){
                        $httpBackend.expectPOST('/api/account/user')
                            .respond(404,'Unable to create user.');
                        UserService.post(mockUser).then(successSpy,failureSpy);
                        $httpBackend.flush();
                        expect(successSpy).not.toHaveBeenCalled();
                        expect(failureSpy).toHaveBeenCalledWith('Unable to create user.');
                    });
                });

                describe('delete(id)', function() {
                    beforeEach(function(){
                        successSpy = jasmine.createSpy('delete.success');
                        failureSpy = jasmine.createSpy('delete.failure');
                    });

                    it('will resolve promise if successfull',function(){
                        $httpBackend.expectDELETE('/api/account/user/u-115')
                            .respond(204,'');
                        UserService.delete(mockUser.id).then(successSpy,failureSpy);
                        $httpBackend.flush();
                        expect(successSpy).toHaveBeenCalled();
                        expect(failureSpy).not.toHaveBeenCalled();
                    });

                    it('will reject promise if not successful',function(){
                        $httpBackend.expectDELETE('/api/account/user/u-115')
                            .respond(401,'Unauthorized.');
                        UserService.delete(mockUser.id).then(successSpy,failureSpy);
                        $httpBackend.flush();
                        expect(successSpy).not.toHaveBeenCalled();
                        expect(failureSpy).toHaveBeenCalledWith('Unauthorized.');
                    });
                });

                describe('logout(id)', function() {
                    beforeEach(function(){
                        successSpy = jasmine.createSpy('delete.success');
                        failureSpy = jasmine.createSpy('delete.failure');
                    });

                    it('will resolve promise if successfull',function(){
                        $httpBackend.expectPOST('/api/account/user/logout/u-115')
                            .respond(204,'');
                        UserService.logout(mockUser.id).then(successSpy,failureSpy);
                        $httpBackend.flush();
                        expect(successSpy).toHaveBeenCalled();
                        expect(failureSpy).not.toHaveBeenCalled();
                    });

                    it('will reject promise if not successful',function(){
                        $httpBackend.expectPOST('/api/account/user/logout/u-115')
                            .respond(404,'Unauthorized.');
                        UserService.logout(mockUser.id).then(successSpy,failureSpy);
                        $httpBackend.flush();
                        expect(successSpy).not.toHaveBeenCalled();
                        expect(failureSpy).toHaveBeenCalledWith('Unauthorized.');
                    });
                });
            });
        });
    });
}());