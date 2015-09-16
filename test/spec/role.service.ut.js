(function() {
    'use strict';

    define(['app'], function(proshop) {
        describe('RoleService', function() {
            var $rootScope,
                $httpBackend,
                RoleService,
                c6UrlMaker,
                successSpy,
                failureSpy;

            var mockRole,
                mockRoles;

            beforeEach(function() {
                /* jsHint quotmark:false */
                mockRole = {
                    "id": "r-111",
                    "name": "StudioRole",
                    "created": "2015-06-13T19:28:39.408Z",
                    "lastUpdated": "2015-06-13T19:28:39.408Z",
                    "status": "active",
                    "policies": ["MiniReelCreator"]
                };

                mockRoles = [
                    {
                        "id": "r-111",
                        "name": "StudioRole",
                        "created": "2015-06-13T19:28:39.408Z",
                        "lastUpdated": "2015-06-13T19:28:39.408Z",
                        "status": "active",
                        "policies": ["MiniReelCreator"]
                    },
                    {
                        "id": "r-112",
                        "name": "Creator",
                        "created": "2015-06-13T19:28:39.408Z",
                        "lastUpdated": "2015-06-13T19:28:39.408Z",
                        "status": "active",
                        "policies": ["MiniReelCreator","SelfieUser"]
                    },
                    {
                        "id": "r-113",
                        "name": "AdminRole",
                        "created": "2015-06-13T19:28:39.408Z",
                        "lastUpdated": "2015-06-13T19:28:39.408Z",
                        "status": "active",
                        "policies": ["MiniReelCreator","SelfieUser","CampaignManager"]
                    }
                ];
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
                    c6UrlMaker = $injector.get('c6UrlMaker');
                    c6UrlMaker.and.callFake(function(path, base) {
                        return '/' + base + '/' + path;
                    });

                    RoleService = $injector.get('RoleService');
                });
            });

            describe('initialization', function() {
                it('should exist', function() {
                    expect(RoleService).toEqual(jasmine.any(Object));
                });

                it('should set the apiBase', function() {
                    expect(c6UrlMaker).toHaveBeenCalledWith('account/roles','api');
                });
            });

            describe('methods', function() {
                describe('get(id)', function() {
                    beforeEach(function(){
                        successSpy = jasmine.createSpy('get().success');
                        failureSpy = jasmine.createSpy('get().failure');
                    });

                    it('will resolve promise if successfull',function(){
                        $httpBackend.expectGET('/api/account/roles/r-111')
                            .respond(200,mockRole);
                        RoleService.get('r-111').then(successSpy,failureSpy);
                        $httpBackend.flush();
                        expect(successSpy).toHaveBeenCalledWith(mockRole);
                        expect(failureSpy).not.toHaveBeenCalled();
                    });

                    it('will reject promise if not successful',function(){
                        $httpBackend.expectGET('/api/account/roles/r-111')
                            .respond(404,'Unable to find advertisers.');
                        RoleService.get('r-111').then(successSpy,failureSpy);
                        $httpBackend.flush();
                        expect(successSpy).not.toHaveBeenCalled();
                        expect(failureSpy).toHaveBeenCalledWith('Unable to find advertisers.');
                    });
                });

                describe('getAll(params)', function() {
                    beforeEach(function(){
                        successSpy = jasmine.createSpy('getAll().success');
                        failureSpy = jasmine.createSpy('getAll.failure');
                    });

                    it('will accept empty params', function() {
                        $httpBackend.expectGET('/api/account/roles')
                            .respond(200,mockRoles,{'Content-Range': 'items 1-19/19'});
                        RoleService.getAll().then(successSpy,failureSpy);
                        $httpBackend.flush();

                        expect(successSpy).toHaveBeenCalledWith(jasmine.objectContaining({
                            data: mockRoles,
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

                    it('will resolve promise if successfull',function(){
                        $httpBackend.expectGET('/api/account/roles?ids=r-111,r-112,r-113&limit=3')
                            .respond(200,mockRoles,{'Content-Range': 'items 1-19/19'});
                        RoleService.getAll({ids: 'r-111,r-112,r-113', limit: 3}).then(successSpy,failureSpy);
                        $httpBackend.flush();
                        expect(successSpy).toHaveBeenCalledWith(jasmine.objectContaining({
                            data: mockRoles,
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
                        $httpBackend.expectGET('/api/account/roles?ids=r-111,r-112,r-113')
                            .respond(404,'Unable to find roles.');
                        RoleService.getAll({ids: 'r-111,r-112,r-113'}).then(successSpy,failureSpy);
                        $httpBackend.flush();
                        expect(successSpy).not.toHaveBeenCalled();
                        expect(failureSpy).toHaveBeenCalledWith('Unable to find roles.');
                    });
                });

                describe('put(id, model)', function() {
                    beforeEach(function(){
                        successSpy = jasmine.createSpy('put.success');
                        failureSpy = jasmine.createSpy('put.failure');
                    });

                    it('will resolve promise if successfull',function(){
                        $httpBackend.expectPUT('/api/account/roles/r-111')
                            .respond(200,mockRole);
                        RoleService.put(mockRole.id, mockRole).then(successSpy,failureSpy);
                        $httpBackend.flush();
                        expect(successSpy).toHaveBeenCalledWith(mockRole);
                        expect(failureSpy).not.toHaveBeenCalled();
                    });

                    it('will reject promise if not successful',function(){
                        $httpBackend.expectPUT('/api/account/roles/r-111')
                            .respond(404,'Unable to update roles.');
                        RoleService.put(mockRole.id, mockRole).then(successSpy,failureSpy);
                        $httpBackend.flush();
                        expect(successSpy).not.toHaveBeenCalled();
                        expect(failureSpy).toHaveBeenCalledWith('Unable to update roles.');
                    });
                });

                describe('post(model)', function() {
                    beforeEach(function(){
                        successSpy = jasmine.createSpy('post.success');
                        failureSpy = jasmine.createSpy('post.failure');
                    });

                    it('will resolve promise if successfull',function(){
                        $httpBackend.expectPOST('/api/account/roles')
                            .respond(200,mockRole);
                        RoleService.post(mockRole).then(successSpy,failureSpy);
                        $httpBackend.flush();
                        expect(successSpy).toHaveBeenCalledWith(mockRole);
                        expect(failureSpy).not.toHaveBeenCalled();
                    });

                    it('will reject promise if not successful',function(){
                        $httpBackend.expectPOST('/api/account/roles')
                            .respond(404,'Unable to create roles.');
                        RoleService.post(mockRole).then(successSpy,failureSpy);
                        $httpBackend.flush();
                        expect(successSpy).not.toHaveBeenCalled();
                        expect(failureSpy).toHaveBeenCalledWith('Unable to create roles.');
                    });
                });

                describe('delete(id)', function() {
                    beforeEach(function(){
                        successSpy = jasmine.createSpy('delete.success');
                        failureSpy = jasmine.createSpy('delete.failure');
                    });

                    it('will resolve promise if successfull',function(){
                        $httpBackend.expectDELETE('/api/account/roles/r-111')
                            .respond(204,'');
                        RoleService.delete(mockRole.id).then(successSpy,failureSpy);
                        $httpBackend.flush();
                        expect(successSpy).toHaveBeenCalled();
                        expect(failureSpy).not.toHaveBeenCalled();
                    });

                    it('will reject promise if not successful',function(){
                        $httpBackend.expectDELETE('/api/account/roles/r-111')
                            .respond(401,'Unauthorized.');
                        RoleService.delete(mockRole.id).then(successSpy,failureSpy);
                        $httpBackend.flush();
                        expect(successSpy).not.toHaveBeenCalled();
                        expect(failureSpy).toHaveBeenCalledWith('Unauthorized.');
                    });
                });
            });
        });
    });
}());