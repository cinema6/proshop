(function() {
    'use strict';

    define(['sites'], function(sitesModule) {
        describe('SitesService', function() {
            var $httpBackend,
                $timeout,
                SitesService,
                successSpy,
                failureSpy,
                c6UrlMaker,
                mockSite,
                mockSites;

            beforeEach(function() {
                /* jshint quotmark:false */
                mockSite = {
                    "id": "s-1",
                    "status": "active",
                    "created": "2014-06-13T19:28:39.408Z",
                    "lastUpdated": "2014-06-13T19:28:39.408Z",
                    "org": "o-112",
                    "branding": "site1_branding",
                    "placementId": "111111",
                    "name": "Best Website Ever",
                    "host": "bestever.com"
                };

                mockSites = [
                    {
                        "id": "s-1",
                        "status": "active",
                        "created": "2014-06-13T19:28:39.408Z",
                        "lastUpdated": "2014-06-13T19:28:39.408Z",
                        "org": "o-112",
                        "branding": "site1_branding",
                        "placementId": "111111",
                        "name": "Best Website Ever",
                        "host": "bestever.com"
                    },
                    {
                        "id": "s-2",
                        "status": "pending",
                        "created": "2014-05-13T19:28:39.408Z",
                        "lastUpdated": "2014-07-13T19:28:39.408Z",
                        "org": "o-111",
                        "branding": "site2_branding",
                        "placementId": "111112",
                        "name": "News Site",
                        "host": "thenews.com"
                    },
                    {
                        "id": "s-3",
                        "status": "inactive",
                        "created": "2014-06-17T19:28:39.408Z",
                        "lastUpdated": "2014-06-20T19:28:39.408Z",
                        "org": "o-114",
                        "branding": "site3_branding",
                        "placementId": "111113",
                        "name": "Sports Are Fun",
                        "host": "sportsarefun.com"
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

                module(sitesModule.name);

                inject(function($injector){
                    SitesService = $injector.get('SitesService');
                    $timeout = $injector.get('$timeout');
                    $httpBackend = $injector.get('$httpBackend');
                    c6UrlMaker = $injector.get('c6UrlMaker');
                });

                c6UrlMaker.and.callFake(function(path, base) {
                    return '/' + base + '/' + path;
                });
            });

            describe('methods', function() {
                describe('getSite(id)', function() {
                    beforeEach(function(){
                        successSpy = jasmine.createSpy('getSite.success');
                        failureSpy = jasmine.createSpy('getSite.failure');
                        spyOn($timeout,'cancel');
                    });

                    it('will resolve promise if successfull',function(){
                        $httpBackend.expectGET('/api/site/s-1')
                            .respond(200,mockSite);
                        SitesService.getSite(mockSite.id).then(successSpy,failureSpy);
                        $httpBackend.flush();
                        expect(successSpy).toHaveBeenCalledWith(mockSite);
                        expect(failureSpy).not.toHaveBeenCalled();
                        expect($timeout.cancel).toHaveBeenCalled();
                    });

                    it('will reject promise if not successful',function(){
                        $httpBackend.expectGET('/api/site/s-1')
                            .respond(404,'Unable to find org.');
                        SitesService.getSite(mockSite.id).then(successSpy,failureSpy);
                        $httpBackend.flush();
                        expect(successSpy).not.toHaveBeenCalled();
                        expect(failureSpy).toHaveBeenCalledWith('Unable to find org.');
                        expect($timeout.cancel).toHaveBeenCalled();
                    });

                    it('will reject promise if times out',function(){
                        $httpBackend.expectGET('/api/site/s-1')
                            .respond(200,'');
                        SitesService.getSite(mockSite.id).then(successSpy,failureSpy);
                        $timeout.flush(60000);
                        expect(successSpy).not.toHaveBeenCalled();
                        expect(failureSpy).toHaveBeenCalledWith('Request timed out.');
                    });
                });

                describe('getSites(param, value)', function() {
                    describe('when querying with parameter and value', function() {
                        var mockParam, mockValue;

                        beforeEach(function(){
                            successSpy = jasmine.createSpy('getOrgs.success');
                            failureSpy = jasmine.createSpy('getOrgs.failure');
                            spyOn($timeout,'cancel');
                            mockParam = 'org';
                            mockValue = 'o-111';
                        });

                        it('will resolve promise if successfull',function(){
                            $httpBackend.expectGET('/api/sites?org=o-111')
                                .respond(200,mockSites);
                            SitesService.getSites(mockParam, mockValue).then(successSpy,failureSpy);
                            $httpBackend.flush();
                            expect(successSpy).toHaveBeenCalledWith(mockSites);
                            expect(failureSpy).not.toHaveBeenCalled();
                            expect($timeout.cancel).toHaveBeenCalled();
                        });

                        it('will reject promise if not successful',function(){
                            $httpBackend.expectGET('/api/sites?org=o-111')
                                .respond(404,'Unable to find orgs.');
                            SitesService.getSites(mockParam, mockValue).then(successSpy,failureSpy);
                            $httpBackend.flush();
                            expect(successSpy).not.toHaveBeenCalled();
                            expect(failureSpy).toHaveBeenCalledWith('Unable to find orgs.');
                            expect($timeout.cancel).toHaveBeenCalled();
                        });

                        it('will reject promise if times out',function(){
                            $httpBackend.expectGET('/api/sites?org=o-111')
                                .respond(200,'');
                            SitesService.getSites(mockParam, mockValue).then(successSpy,failureSpy);
                            $timeout.flush(60000);
                            expect(successSpy).not.toHaveBeenCalled();
                            expect(failureSpy).toHaveBeenCalledWith('Request timed out.');
                        });
                    });

                    describe('when querying all orgs', function() {
                        beforeEach(function(){
                            successSpy = jasmine.createSpy('getSites.success');
                            failureSpy = jasmine.createSpy('getSites.failure');
                            spyOn($timeout,'cancel');
                        });

                        it('will resolve promise if successfull',function(){
                            $httpBackend.expectGET('/api/sites')
                                .respond(200,mockSites);
                            SitesService.getSites().then(successSpy,failureSpy);
                            $httpBackend.flush();
                            expect(successSpy).toHaveBeenCalledWith(mockSites);
                            expect(failureSpy).not.toHaveBeenCalled();
                            expect($timeout.cancel).toHaveBeenCalled();
                        });

                        it('will reject promise if not successful',function(){
                            $httpBackend.expectGET('/api/sites')
                                .respond(404,'Unable to find orgs.');
                            SitesService.getSites().then(successSpy,failureSpy);
                            $httpBackend.flush();
                            expect(successSpy).not.toHaveBeenCalled();
                            expect(failureSpy).toHaveBeenCalledWith('Unable to find orgs.');
                            expect($timeout.cancel).toHaveBeenCalled();
                        });

                        it('will reject promise if times out',function(){
                            $httpBackend.expectGET('/api/sites')
                                .respond(200,'');
                            SitesService.getSites().then(successSpy,failureSpy);
                            $timeout.flush(60000);
                            expect(successSpy).not.toHaveBeenCalled();
                            expect(failureSpy).toHaveBeenCalledWith('Request timed out.');
                        });
                    });
                });

                describe('putSite(id, site)', function() {
                    var editedSite;

                    beforeEach(function(){
                        successSpy = jasmine.createSpy('putSite.success');
                        failureSpy = jasmine.createSpy('putSite.failure');
                        spyOn($timeout,'cancel');

                        editedSite = {};
                        ['name','host','branding','status','placementId','org'].forEach(function(prop) {
                            editedSite[prop] = mockSite[prop];
                        });
                    });

                    it('will resolve promise if successfull',function(){
                        $httpBackend.expectPUT('/api/site/s-1')
                            .respond(200,mockSite);
                        SitesService.putSite(mockSite.id, editedSite).then(successSpy,failureSpy);
                        $httpBackend.flush();
                        expect(successSpy).toHaveBeenCalledWith(mockSite);
                        expect(failureSpy).not.toHaveBeenCalled();
                        expect($timeout.cancel).toHaveBeenCalled();
                    });

                    it('will reject promise if not successful',function(){
                        $httpBackend.expectPUT('/api/site/s-1')
                            .respond(404,'Unable to update org.');
                        SitesService.putSite(mockSite.id, editedSite).then(successSpy,failureSpy);
                        $httpBackend.flush();
                        expect(successSpy).not.toHaveBeenCalled();
                        expect(failureSpy).toHaveBeenCalledWith('Unable to update org.');
                        expect($timeout.cancel).toHaveBeenCalled();
                    });

                    it('will reject promise if times out',function(){
                        $httpBackend.expectPUT('/api/site/s-1')
                            .respond(200,'');
                        SitesService.putSite(mockSite.id, editedSite).then(successSpy,failureSpy);
                        $timeout.flush(60000);
                        expect(successSpy).not.toHaveBeenCalled();
                        expect(failureSpy).toHaveBeenCalledWith('Request timed out.');
                    });
                });

                describe('postSite(site)', function() {
                    var newSite;

                    beforeEach(function(){
                        successSpy = jasmine.createSpy('postSite.success');
                        failureSpy = jasmine.createSpy('postSite.failure');
                        spyOn($timeout,'cancel');

                        newSite = {};
                        ['name','host','branding','status','placementId','org'].forEach(function(prop) {
                            newSite[prop] = mockSite[prop];
                        });
                    });

                    it('will resolve promise if successfull',function(){
                        $httpBackend.expectPOST('/api/site')
                            .respond(200,mockSite);
                        SitesService.postSite(newSite).then(successSpy,failureSpy);
                        $httpBackend.flush();
                        expect(successSpy).toHaveBeenCalledWith(mockSite);
                        expect(failureSpy).not.toHaveBeenCalled();
                        expect($timeout.cancel).toHaveBeenCalled();
                    });

                    it('will reject promise if not successful',function(){
                        $httpBackend.expectPOST('/api/site')
                            .respond(404,'Unable to create org.');
                        SitesService.postSite(newSite).then(successSpy,failureSpy);
                        $httpBackend.flush();
                        expect(successSpy).not.toHaveBeenCalled();
                        expect(failureSpy).toHaveBeenCalledWith('Unable to create org.');
                        expect($timeout.cancel).toHaveBeenCalled();
                    });

                    it('will reject promise if times out',function(){
                        $httpBackend.expectPOST('/api/site')
                            .respond(200,'');
                        SitesService.postSite(newSite).then(successSpy,failureSpy);
                        $timeout.flush(60000);
                        expect(successSpy).not.toHaveBeenCalled();
                        expect(failureSpy).toHaveBeenCalledWith('Request timed out.');
                    });
                });

                describe('deleteSite(id)', function() {
                    beforeEach(function(){
                        successSpy = jasmine.createSpy('deleteSite.success');
                        failureSpy = jasmine.createSpy('deleteSite.failure');
                        spyOn($timeout,'cancel');
                    });

                    it('will resolve promise if successfull',function(){
                        $httpBackend.expectDELETE('/api/site/s-1')
                            .respond(204,'');
                        SitesService.deleteSite(mockSite.id).then(successSpy,failureSpy);
                        $httpBackend.flush();
                        expect(successSpy).toHaveBeenCalled();
                        expect(failureSpy).not.toHaveBeenCalled();
                        expect($timeout.cancel).toHaveBeenCalled();
                    });

                    it('will reject promise if not successful',function(){
                        $httpBackend.expectDELETE('/api/site/s-1')
                            .respond(401,'Unauthorized.');
                        SitesService.deleteSite(mockSite.id).then(successSpy,failureSpy);
                        $httpBackend.flush();
                        expect(successSpy).not.toHaveBeenCalled();
                        expect(failureSpy).toHaveBeenCalledWith('Unauthorized.');
                        expect($timeout.cancel).toHaveBeenCalled();
                    });

                    it('will reject promise if times out',function(){
                        $httpBackend.expectDELETE('/api/site/s-1')
                            .respond(200,'');
                        SitesService.deleteSite(mockSite.id).then(successSpy,failureSpy);
                        $timeout.flush(60000);
                        expect(successSpy).not.toHaveBeenCalled();
                        expect(failureSpy).toHaveBeenCalledWith('Request timed out.');
                    });
                });
            });
        });
    });
}());