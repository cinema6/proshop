(function() {
    'use strict';

    define(['app'], function(proshop) {
        describe('AdvertiserAdapter', function() {
            var $rootScope,
                $httpBackend,
                AdvertiserAdapter,
                adapter,
                c6UrlMaker,
                successSpy,
                failureSpy;

            var mockAdvertiser,
                mockAdvertisers;

            beforeEach(function() {
                /* jsHint quotmark:false */
                mockAdvertiser = {
                    "id": "a-111",
                    "adtechId": "12121212",
                    "name": "Ybrant",
                    "created": "2014-06-13T19:28:39.408Z",
                    "lastUpdated": "2015-01-12T18:06:52.877Z",
                    "defaultLinks": {
                        "Facebook": "http://facebook.com",
                        "Twitter": "http://twitter.com"
                    },
                    "defaultLogos": {
                        "Main": "http://example.com/logo.jpg"
                    },
                    "status": "active"
                };

                mockAdvertisers = [
                    {
                        "id": "a-111",
                        "adtechId": "12121212",
                        "name": "Ybrant",
                        "created": "2014-06-13T19:28:39.408Z",
                        "lastUpdated": "2015-01-12T18:06:52.877Z",
                        "defaultLinks": {
                            "Facebook": "http://facebook.com",
                            "Twitter": "http://twitter.com"
                        },
                        "defaultLogos": {
                            "Main": "http://example.com/logo.jpg"
                        },
                        "status": "active"
                    },
                    {
                        "id": "a-112",
                        "adtechId": "12121213",
                        "name": "DashBid",
                        "created": "2014-06-13T19:28:39.408Z",
                        "lastUpdated": "2014-06-13T19:28:39.408Z",
                        "defaultLinks": {
                            "Facebook": "http://facebook.com",
                            "Twitter": "http://twitter.com"
                        },
                        "defaultLogos": {
                            "logo1": "http://example.com/logo.jpg"
                        },
                        "status": "active"
                    },
                    {
                        "id": "a-113",
                        "adtechId": "12121233",
                        "name": "Adap.tv",
                        "created": "2014-06-13T19:28:39.408Z",
                        "lastUpdated": "2014-06-13T19:28:39.408Z",
                        "defaultLinks": {
                            "Facebook": "http://facebook.com",
                            "Twitter": "http://twitter.com"
                        },
                        "defaultLogos": {
                            "logo1": "http://example.com/logo.jpg"
                        },
                        "status": "active"
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

                    AdvertiserAdapter = $injector.get('AdvertiserAdapter');

                    adapter = $injector.instantiate(AdvertiserAdapter);
                });
            });

            describe('initialization', function() {
                it('should exist', function() {
                    expect(adapter).toEqual(jasmine.any(Object));
                });
            });

            describe('methods', function() {
                describe('get(id)', function() {
                    beforeEach(function(){
                        successSpy = jasmine.createSpy('get().success');
                        failureSpy = jasmine.createSpy('get().failure');
                    });

                    it('will resolve promise if successfull',function(){
                        $httpBackend.expectGET('/api/account/advertiser/a-111')
                            .respond(200,mockAdvertiser);
                        adapter.get('a-111').then(successSpy,failureSpy);
                        $httpBackend.flush();
                        expect(successSpy).toHaveBeenCalledWith(mockAdvertiser);
                        expect(failureSpy).not.toHaveBeenCalled();
                    });

                    it('will reject promise if not successful',function(){
                        $httpBackend.expectGET('/api/account/advertiser/a-111')
                            .respond(404,'Unable to find advertisers.');
                        adapter.get('a-111').then(successSpy,failureSpy);
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
                        $httpBackend.expectGET('/api/account/advertisers')
                            .respond(200,mockAdvertisers,{'Content-Range': 'items 1-19/19'});
                        adapter.getAll().then(successSpy,failureSpy);
                        $httpBackend.flush();

                        expect(successSpy).toHaveBeenCalledWith(jasmine.objectContaining({
                            data: mockAdvertisers,
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
                        $httpBackend.expectGET('/api/account/advertisers?ids=e-1,e-2,e-3&limit=3')
                            .respond(200,mockAdvertisers,{'Content-Range': 'items 1-19/19'});
                        adapter.getAll({ids: 'e-1,e-2,e-3', limit: 3}).then(successSpy,failureSpy);
                        $httpBackend.flush();
                        expect(successSpy).toHaveBeenCalledWith(jasmine.objectContaining({
                            data: mockAdvertisers,
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
                        $httpBackend.expectGET('/api/account/advertisers?ids=e-1,e-2,e-3')
                            .respond(404,'Unable to find advertisers.');
                        adapter.getAll({ids: 'e-1,e-2,e-3'}).then(successSpy,failureSpy);
                        $httpBackend.flush();
                        expect(successSpy).not.toHaveBeenCalled();
                        expect(failureSpy).toHaveBeenCalledWith('Unable to find advertisers.');
                    });
                });

                describe('put(id, model)', function() {
                    beforeEach(function(){
                        successSpy = jasmine.createSpy('put.success');
                        failureSpy = jasmine.createSpy('put.failure');
                    });

                    it('will resolve promise if successfull',function(){
                        $httpBackend.expectPUT('/api/account/advertiser/a-111')
                            .respond(200,mockAdvertiser);
                        adapter.put(mockAdvertiser.id, mockAdvertiser).then(successSpy,failureSpy);
                        $httpBackend.flush();
                        expect(successSpy).toHaveBeenCalledWith(mockAdvertiser);
                        expect(failureSpy).not.toHaveBeenCalled();
                    });

                    it('will reject promise if not successful',function(){
                        $httpBackend.expectPUT('/api/account/advertiser/a-111')
                            .respond(404,'Unable to update advertiser.');
                        adapter.put(mockAdvertiser.id, mockAdvertiser).then(successSpy,failureSpy);
                        $httpBackend.flush();
                        expect(successSpy).not.toHaveBeenCalled();
                        expect(failureSpy).toHaveBeenCalledWith('Unable to update advertiser.');
                    });
                });

                describe('post(model)', function() {
                    beforeEach(function(){
                        successSpy = jasmine.createSpy('post.success');
                        failureSpy = jasmine.createSpy('post.failure');
                    });

                    it('will resolve promise if successfull',function(){
                        $httpBackend.expectPOST('/api/account/advertiser')
                            .respond(200,mockAdvertiser);
                        adapter.post(mockAdvertiser).then(successSpy,failureSpy);
                        $httpBackend.flush();
                        expect(successSpy).toHaveBeenCalledWith(mockAdvertiser);
                        expect(failureSpy).not.toHaveBeenCalled();
                    });

                    it('will reject promise if not successful',function(){
                        $httpBackend.expectPOST('/api/account/advertiser')
                            .respond(404,'Unable to create advertiser.');
                        adapter.post(mockAdvertiser).then(successSpy,failureSpy);
                        $httpBackend.flush();
                        expect(successSpy).not.toHaveBeenCalled();
                        expect(failureSpy).toHaveBeenCalledWith('Unable to create advertiser.');
                    });
                });

                describe('delete(id)', function() {
                    beforeEach(function(){
                        successSpy = jasmine.createSpy('delete.success');
                        failureSpy = jasmine.createSpy('delete.failure');
                    });

                    it('will resolve promise if successfull',function(){
                        $httpBackend.expectDELETE('/api/account/advertiser/a-111')
                            .respond(204,'');
                        adapter.delete(mockAdvertiser.id).then(successSpy,failureSpy);
                        $httpBackend.flush();
                        expect(successSpy).toHaveBeenCalled();
                        expect(failureSpy).not.toHaveBeenCalled();
                    });

                    it('will reject promise if not successful',function(){
                        $httpBackend.expectDELETE('/api/account/advertiser/a-111')
                            .respond(401,'Unauthorized.');
                        adapter.delete(mockAdvertiser.id).then(successSpy,failureSpy);
                        $httpBackend.flush();
                        expect(successSpy).not.toHaveBeenCalled();
                        expect(failureSpy).toHaveBeenCalledWith('Unauthorized.');
                    });
                });
            });
        });
    });
}());