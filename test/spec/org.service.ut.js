(function() {
    'use strict';

    define(['app'], function(proshop) {
        describe('OrgService', function() {
            var $rootScope,
                $httpBackend,
                OrgService,
                c6UrlMaker,
                successSpy,
                failureSpy;

            var mockOrg,
                mockOrgs;

            beforeEach(function() {
                /* jsHint quotmark:false */
                mockOrg = {
                    "id": "o-111",
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

                mockOrgs = [
                    {
                        "id": "o-111",
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
                    },
                    {
                        "id": "o-112",
                        "name": "Test Org 2",
                        "minAdCount": 1,
                        "created": "2014-06-13T19:28:39.408Z",
                        "lastUpdated": "2014-06-13T19:28:39.408Z",
                        "status": "active",
                        "tag": "foo",
                        "config":{},
                        "adConfig": {
                            "video" : {
                                "firstPlacement" : 1,
                                "frequency" : 3,
                                "waterfall" : "cinema6",
                                "skip": 6
                            },
                            "display" : {
                                "waterfall" : "cinema6"
                            }
                        },
                        "waterfalls": {
                            "video": [
                                "cinema6",
                                "cinema6-publisher",
                                "publisher",
                                "publisher-cinema6"
                            ],
                            "display": [
                                "cinema6",
                                "cinema6-publisher",
                                "publisher",
                                "publisher-cinema6"
                            ]
                        }
                    },
                    {
                        "id": "o-112",
                        "name": "Example Org 3",
                        "minAdCount": 2,
                        "created": "2014-06-13T19:28:39.408Z",
                        "lastUpdated": "2014-09-03T20:32:02.211Z",
                        "status": "active",
                        "tag": "baz",
                        "config": {
                            "minireelinator": {
                                "embedTypes": [
                                    "script"
                                ],
                                "minireelDefaults": {
                                    "mode": "light",
                                    "autoplay": true,
                                    "splash": {
                                        "ratio": "3-2",
                                        "theme": "img-text-overlay"
                                    }
                                },
                                "embedDefaults": {
                                    "size": null
                                }
                            }
                        },
                        "waterfalls": {
                            "video": [
                                "cinema6",
                                "cinema6-publisher"
                            ],
                            "display": [
                                "cinema6",
                                "cinema6-publisher"
                            ]
                        },
                        "adConfig": {
                            "video": {
                                "firstPlacement": 2,
                                "frequency": 0,
                                "waterfall": "cinema6",
                                "skip": 6
                            },
                            "display": {
                                "waterfall": "cinema6"
                            }
                        },
                        "branding": "sdfdf"
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

                    OrgService = $injector.get('OrgService');
                });
            });

            describe('initialization', function() {
                it('should exist', function() {
                    expect(OrgService).toEqual(jasmine.any(Object));
                });

                it('should set the apiBase', function() {
                    expect(c6UrlMaker).toHaveBeenCalledWith('account/org','api');
                });
            });

            describe('methods', function() {
                describe('get(id)', function() {
                    beforeEach(function(){
                        successSpy = jasmine.createSpy('get().success');
                        failureSpy = jasmine.createSpy('get().failure');
                    });

                    it('will resolve promise if successfull',function(){
                        $httpBackend.expectGET('/api/account/org/o-111')
                            .respond(200,mockOrg);
                        OrgService.get('o-111').then(successSpy,failureSpy);
                        $httpBackend.flush();
                        expect(successSpy).toHaveBeenCalledWith(mockOrg);
                        expect(failureSpy).not.toHaveBeenCalled();
                    });

                    it('will reject promise if not successful',function(){
                        $httpBackend.expectGET('/api/account/org/o-111')
                            .respond(404,'Unable to find org.');
                        OrgService.get('o-111').then(successSpy,failureSpy);
                        $httpBackend.flush();
                        expect(successSpy).not.toHaveBeenCalled();
                        expect(failureSpy).toHaveBeenCalledWith('Unable to find org.');
                    });
                });

                describe('getAll(params)', function() {
                    beforeEach(function(){
                        successSpy = jasmine.createSpy('getAll().success');
                        failureSpy = jasmine.createSpy('getAll.failure');
                    });

                    it('will accept empty params', function() {
                        $httpBackend.expectGET('/api/account/orgs')
                            .respond(200,mockOrgs,{'Content-Range': 'items 1-19/19'});
                        OrgService.getAll().then(successSpy,failureSpy);
                        $httpBackend.flush();

                        expect(successSpy).toHaveBeenCalledWith(jasmine.objectContaining({
                            data: mockOrgs,
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
                        $httpBackend.expectGET('/api/account/orgs?ids=o-1,o-2,o-3&limit=3')
                            .respond(200,mockOrgs,{'Content-Range': 'items 1-19/19'});
                        OrgService.getAll({ids: 'o-1,o-2,o-3', limit: 3}).then(successSpy,failureSpy);
                        $httpBackend.flush();
                        expect(successSpy).toHaveBeenCalledWith(jasmine.objectContaining({
                            data: mockOrgs,
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
                        $httpBackend.expectGET('/api/account/orgs?ids=o-1,o-2,o-3')
                            .respond(404,'Unable to find orgs.');
                        OrgService.getAll({ids: 'o-1,o-2,o-3'}).then(successSpy,failureSpy);
                        $httpBackend.flush();
                        expect(successSpy).not.toHaveBeenCalled();
                        expect(failureSpy).toHaveBeenCalledWith('Unable to find orgs.');
                    });
                });

                describe('put(id, model)', function() {
                    beforeEach(function(){
                        successSpy = jasmine.createSpy('put.success');
                        failureSpy = jasmine.createSpy('put.failure');
                    });

                    it('will resolve promise if successfull',function(){
                        $httpBackend.expectPUT('/api/account/org/o-111')
                            .respond(200,mockOrg);
                        OrgService.put(mockOrg.id, mockOrg).then(successSpy,failureSpy);
                        $httpBackend.flush();
                        expect(successSpy).toHaveBeenCalledWith(mockOrg);
                        expect(failureSpy).not.toHaveBeenCalled();
                    });

                    it('will reject promise if not successful',function(){
                        $httpBackend.expectPUT('/api/account/org/o-111')
                            .respond(404,'Unable to update org.');
                        OrgService.put(mockOrg.id, mockOrg).then(successSpy,failureSpy);
                        $httpBackend.flush();
                        expect(successSpy).not.toHaveBeenCalled();
                        expect(failureSpy).toHaveBeenCalledWith('Unable to update org.');
                    });
                });

                describe('post(model)', function() {
                    beforeEach(function(){
                        successSpy = jasmine.createSpy('post.success');
                        failureSpy = jasmine.createSpy('post.failure');
                    });

                    it('will resolve promise if successfull',function(){
                        $httpBackend.expectPOST('/api/account/org')
                            .respond(200,mockOrg);
                        OrgService.post(mockOrg).then(successSpy,failureSpy);
                        $httpBackend.flush();
                        expect(successSpy).toHaveBeenCalledWith(mockOrg);
                        expect(failureSpy).not.toHaveBeenCalled();
                    });

                    it('will reject promise if not successful',function(){
                        $httpBackend.expectPOST('/api/account/org')
                            .respond(404,'Unable to create org.');
                        OrgService.post(mockOrg).then(successSpy,failureSpy);
                        $httpBackend.flush();
                        expect(successSpy).not.toHaveBeenCalled();
                        expect(failureSpy).toHaveBeenCalledWith('Unable to create org.');
                    });
                });

                describe('delete(id)', function() {
                    beforeEach(function(){
                        successSpy = jasmine.createSpy('delete.success');
                        failureSpy = jasmine.createSpy('delete.failure');
                    });

                    it('will resolve promise if successfull',function(){
                        $httpBackend.expectDELETE('/api/account/org/o-111')
                            .respond(204,'');
                        OrgService.delete(mockOrg.id).then(successSpy,failureSpy);
                        $httpBackend.flush();
                        expect(successSpy).toHaveBeenCalled();
                        expect(failureSpy).not.toHaveBeenCalled();
                    });

                    it('will reject promise if not successful',function(){
                        $httpBackend.expectDELETE('/api/account/org/o-111')
                            .respond(401,'Unauthorized.');
                        OrgService.delete(mockOrg.id).then(successSpy,failureSpy);
                        $httpBackend.flush();
                        expect(successSpy).not.toHaveBeenCalled();
                        expect(failureSpy).toHaveBeenCalledWith('Unauthorized.');
                    });
                });
            });
        });
    });
}());