(function() {
    'use strict';

    define(['advertisers'], function(advertisersModule) {
        describe('AdvertisersService', function() {
            var $httpBackend,
                $timeout,
                AdvertisersService,
                successSpy,
                failureSpy,
                c6UrlMaker,
                mockAdvertiser,
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

                module(advertisersModule.name);

                inject(function($injector) {
                    $httpBackend = $injector.get('$httpBackend');
                    $timeout = $injector.get('$timeout');
                    AdvertisersService = $injector.get('AdvertisersService');
                    c6UrlMaker = $injector.get('c6UrlMaker');
                });

                c6UrlMaker.and.callFake(function(path, base) {
                    return '/' + base + '/' + path;
                });
            });

            describe('methods', function() {
                describe('getAdvertisers()', function() {
                    beforeEach(function(){
                        successSpy = jasmine.createSpy('getSites.success');
                        failureSpy = jasmine.createSpy('getSites.failure');
                        spyOn($timeout,'cancel');
                    });

                    it('will resolve promise if successfull',function(){
                        $httpBackend.expectGET('/api/account/advertisers')
                            .respond(200,mockAdvertisers);
                        AdvertisersService.getAdvertisers().then(successSpy,failureSpy);
                        $httpBackend.flush();
                        expect(successSpy).toHaveBeenCalledWith(mockAdvertisers);
                        expect(failureSpy).not.toHaveBeenCalled();
                        expect($timeout.cancel).toHaveBeenCalled();
                    });

                    it('will reject promise if not successful',function(){
                        $httpBackend.expectGET('/api/account/advertisers')
                            .respond(404,'Unable to find advertisers.');
                        AdvertisersService.getAdvertisers().then(successSpy,failureSpy);
                        $httpBackend.flush();
                        expect(successSpy).not.toHaveBeenCalled();
                        expect(failureSpy).toHaveBeenCalledWith('Unable to find advertisers.');
                        expect($timeout.cancel).toHaveBeenCalled();
                    });

                    it('will reject promise if times out',function(){
                        $httpBackend.expectGET('/api/account/advertisers')
                            .respond(200,'');
                        AdvertisersService.getAdvertisers().then(successSpy,failureSpy);
                        $timeout.flush(60000);
                        expect(successSpy).not.toHaveBeenCalled();
                        expect(failureSpy).toHaveBeenCalledWith('Request timed out.');
                    });
                });

                describe('getAdvertiser(id)', function() {
                    beforeEach(function(){
                        successSpy = jasmine.createSpy('getAdvertiser.success');
                        failureSpy = jasmine.createSpy('getAdvertiser.failure');
                        spyOn($timeout,'cancel');
                    });

                    it('will resolve promise if successfull',function(){
                        $httpBackend.expectGET('/api/account/advertiser/a-111')
                            .respond(200,mockAdvertiser);
                        AdvertisersService.getAdvertiser(mockAdvertiser.id).then(successSpy,failureSpy);
                        $httpBackend.flush();
                        expect(successSpy).toHaveBeenCalledWith(mockAdvertiser);
                        expect(failureSpy).not.toHaveBeenCalled();
                        expect($timeout.cancel).toHaveBeenCalled();
                    });

                    it('will reject promise if not successful',function(){
                        $httpBackend.expectGET('/api/account/advertiser/a-111')
                            .respond(404,'Unable to find advertiser.');
                        AdvertisersService.getAdvertiser(mockAdvertiser.id).then(successSpy,failureSpy);
                        $httpBackend.flush();
                        expect(successSpy).not.toHaveBeenCalled();
                        expect(failureSpy).toHaveBeenCalledWith('Unable to find advertiser.');
                        expect($timeout.cancel).toHaveBeenCalled();
                    });

                    it('will reject promise if times out',function(){
                        $httpBackend.expectGET('/api/account/advertiser/a-111')
                            .respond(200,'');
                        AdvertisersService.getAdvertiser(mockAdvertiser.id).then(successSpy,failureSpy);
                        $timeout.flush(60000);
                        expect(successSpy).not.toHaveBeenCalled();
                        expect(failureSpy).toHaveBeenCalledWith('Request timed out.');
                    });
                });

                describe('putAdvertiser(id, advertiser)', function() {
                    beforeEach(function(){
                        successSpy = jasmine.createSpy('putAdvertiser.success');
                        failureSpy = jasmine.createSpy('putAdvertiser.failure');
                        spyOn($timeout,'cancel');
                    });

                    it('will resolve promise if successfull',function(){
                        $httpBackend.expectPUT('/api/account/advertiser/a-111')
                            .respond(200,mockAdvertiser);
                        AdvertisersService.putAdvertiser(mockAdvertiser.id, mockAdvertiser).then(successSpy,failureSpy);
                        $httpBackend.flush();
                        expect(successSpy).toHaveBeenCalledWith(mockAdvertiser);
                        expect(failureSpy).not.toHaveBeenCalled();
                        expect($timeout.cancel).toHaveBeenCalled();
                    });

                    it('will reject promise if not successful',function(){
                        $httpBackend.expectPUT('/api/account/advertiser/a-111')
                            .respond(404,'Unable to update advertiser.');
                        AdvertisersService.putAdvertiser(mockAdvertiser.id, mockAdvertiser).then(successSpy,failureSpy);
                        $httpBackend.flush();
                        expect(successSpy).not.toHaveBeenCalled();
                        expect(failureSpy).toHaveBeenCalledWith('Unable to update advertiser.');
                        expect($timeout.cancel).toHaveBeenCalled();
                    });

                    it('will reject promise if times out',function(){
                        $httpBackend.expectPUT('/api/account/advertiser/a-111')
                            .respond(200,'');
                        AdvertisersService.putAdvertiser(mockAdvertiser.id, mockAdvertiser).then(successSpy,failureSpy);
                        $timeout.flush(60000);
                        expect(successSpy).not.toHaveBeenCalled();
                        expect(failureSpy).toHaveBeenCalledWith('Request timed out.');
                    });
                });

                describe('postAdvertiser(advertiser)', function() {
                    beforeEach(function(){
                        successSpy = jasmine.createSpy('postSite.success');
                        failureSpy = jasmine.createSpy('postSite.failure');
                        spyOn($timeout,'cancel');
                    });

                    it('will resolve promise if successfull',function(){
                        $httpBackend.expectPOST('/api/account/advertiser')
                            .respond(200,mockAdvertiser);
                        AdvertisersService.postAdvertiser(mockAdvertiser).then(successSpy,failureSpy);
                        $httpBackend.flush();
                        expect(successSpy).toHaveBeenCalledWith(mockAdvertiser);
                        expect(failureSpy).not.toHaveBeenCalled();
                        expect($timeout.cancel).toHaveBeenCalled();
                    });

                    it('will reject promise if not successful',function(){
                        $httpBackend.expectPOST('/api/account/advertiser')
                            .respond(404,'Unable to create advertiser.');
                        AdvertisersService.postAdvertiser(mockAdvertiser).then(successSpy,failureSpy);
                        $httpBackend.flush();
                        expect(successSpy).not.toHaveBeenCalled();
                        expect(failureSpy).toHaveBeenCalledWith('Unable to create advertiser.');
                        expect($timeout.cancel).toHaveBeenCalled();
                    });

                    it('will reject promise if times out',function(){
                        $httpBackend.expectPOST('/api/account/advertiser')
                            .respond(200,'');
                        AdvertisersService.postAdvertiser(mockAdvertiser).then(successSpy,failureSpy);
                        $timeout.flush(60000);
                        expect(successSpy).not.toHaveBeenCalled();
                        expect(failureSpy).toHaveBeenCalledWith('Request timed out.');
                    });
                });

                describe('deleteAdvertiser(id)', function() {
                    beforeEach(function(){
                        successSpy = jasmine.createSpy('deleteAdvertiser.success');
                        failureSpy = jasmine.createSpy('deleteAdvertiser.failure');
                        spyOn($timeout,'cancel');
                    });

                    it('will resolve promise if successfull',function(){
                        $httpBackend.expectDELETE('/api/account/advertiser/a-111')
                            .respond(204,'');
                        AdvertisersService.deleteAdvertiser(mockAdvertiser.id).then(successSpy,failureSpy);
                        $httpBackend.flush();
                        expect(successSpy).toHaveBeenCalled();
                        expect(failureSpy).not.toHaveBeenCalled();
                        expect($timeout.cancel).toHaveBeenCalled();
                    });

                    it('will reject promise if not successful',function(){
                        $httpBackend.expectDELETE('/api/account/advertiser/a-111')
                            .respond(401,'Unauthorized.');
                        AdvertisersService.deleteAdvertiser(mockAdvertiser.id).then(successSpy,failureSpy);
                        $httpBackend.flush();
                        expect(successSpy).not.toHaveBeenCalled();
                        expect(failureSpy).toHaveBeenCalledWith('Unauthorized.');
                        expect($timeout.cancel).toHaveBeenCalled();
                    });

                    it('will reject promise if times out',function(){
                        $httpBackend.expectDELETE('/api/account/advertiser/a-111')
                            .respond(200,'');
                        AdvertisersService.deleteAdvertiser(mockAdvertiser.id).then(successSpy,failureSpy);
                        $timeout.flush(60000);
                        expect(successSpy).not.toHaveBeenCalled();
                        expect(failureSpy).toHaveBeenCalledWith('Request timed out.');
                    });
                });
            });
        });
    })
}());