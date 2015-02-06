(function() {
    'use strict';

    define(['groups'], function(groupsModule) {
        describe('GroupsService', function() {
            var $httpBackend,
                $timeout,
                GroupsService,
                successSpy,
                failureSpy,
                c6UrlMaker,
                mockGroup,
                mockGroups;

            beforeEach(function() {
                /* jsHint quotmark:false */
                mockGroup = {
                    "id": "g-111",
                    "name": "Group Number 1",
                    "categories": [
                        "sports",
                        "people_blogs"
                    ],
                    "miniReels": [
                        "e-111",
                        "e-112"
                    ],
                    "created": "2014-06-13T19:28:39.408Z",
                    "lastUpdated": "2014-06-13T19:28:39.408Z"
                };

                mockGroups = [
                    {
                        "id": "g-111",
                        "name": "Group Number 1",
                        "categories": [
                            "sports",
                            "people_blogs"
                        ],
                        "miniReels": [
                            "e-111",
                            "e-112"
                        ],
                        "created": "2014-06-13T19:28:39.408Z",
                        "lastUpdated": "2014-06-13T19:28:39.408Z"
                    },
                    {
                        "id": "g-112",
                        "name": "Tech Group",
                        "categories": [
                            "technology"
                        ],
                        "miniReels": [],
                        "created": "2014-06-13T19:28:39.408Z",
                        "lastUpdated": "2014-06-13T19:28:39.408Z"
                    },
                    {
                        "id": "g-113",
                        "name": "Another Group",
                        "categories": [
                            "music",
                            "people_blogs"
                        ],
                        "miniReels": [
                            "e-114",
                            "e-113",
                            "e-111"
                        ],
                        "created": "2014-06-13T19:28:39.408Z",
                        "lastUpdated": "2014-06-13T19:28:39.408Z"
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

                module(groupsModule.name);

                inject(function($injector) {
                    $httpBackend = $injector.get('$httpBackend');
                    $timeout = $injector.get('$timeout');
                    GroupsService = $injector.get('GroupsService');
                    c6UrlMaker = $injector.get('c6UrlMaker');
                });

                c6UrlMaker.and.callFake(function(path, base) {
                    return '/' + base + '/' + path;
                });
            });

            describe('methods', function() {
                describe('getGroups()', function() {
                    beforeEach(function(){
                        successSpy = jasmine.createSpy('getSites.success');
                        failureSpy = jasmine.createSpy('getSites.failure');
                        spyOn($timeout,'cancel');
                    });

                    it('will resolve promise if successfull',function(){
                        $httpBackend.expectGET('/api/minireelGroups')
                            .respond(200,mockGroups);
                        GroupsService.getGroups().then(successSpy,failureSpy);
                        $httpBackend.flush();
                        expect(successSpy).toHaveBeenCalledWith(mockGroups);
                        expect(failureSpy).not.toHaveBeenCalled();
                        expect($timeout.cancel).toHaveBeenCalled();
                    });

                    it('will reject promise if not successful',function(){
                        $httpBackend.expectGET('/api/minireelGroups')
                            .respond(404,'Unable to find groups.');
                        GroupsService.getGroups().then(successSpy,failureSpy);
                        $httpBackend.flush();
                        expect(successSpy).not.toHaveBeenCalled();
                        expect(failureSpy).toHaveBeenCalledWith('Unable to find groups.');
                        expect($timeout.cancel).toHaveBeenCalled();
                    });

                    it('will reject promise if times out',function(){
                        $httpBackend.expectGET('/api/minireelGroups')
                            .respond(200,'');
                        GroupsService.getGroups().then(successSpy,failureSpy);
                        $timeout.flush(60000);
                        expect(successSpy).not.toHaveBeenCalled();
                        expect(failureSpy).toHaveBeenCalledWith('Request timed out.');
                    });
                });

                describe('getGroup(id)', function() {
                    beforeEach(function(){
                        successSpy = jasmine.createSpy('getGroup.success');
                        failureSpy = jasmine.createSpy('getGroup.failure');
                        spyOn($timeout,'cancel');
                    });

                    it('will resolve promise if successfull',function(){
                        $httpBackend.expectGET('/api/minireelGroup/g-111')
                            .respond(200,mockGroup);
                        GroupsService.getGroup(mockGroup.id).then(successSpy,failureSpy);
                        $httpBackend.flush();
                        expect(successSpy).toHaveBeenCalledWith(mockGroup);
                        expect(failureSpy).not.toHaveBeenCalled();
                        expect($timeout.cancel).toHaveBeenCalled();
                    });

                    it('will reject promise if not successful',function(){
                        $httpBackend.expectGET('/api/minireelGroup/g-111')
                            .respond(404,'Unable to find group.');
                        GroupsService.getGroup(mockGroup.id).then(successSpy,failureSpy);
                        $httpBackend.flush();
                        expect(successSpy).not.toHaveBeenCalled();
                        expect(failureSpy).toHaveBeenCalledWith('Unable to find group.');
                        expect($timeout.cancel).toHaveBeenCalled();
                    });

                    it('will reject promise if times out',function(){
                        $httpBackend.expectGET('/api/minireelGroup/g-111')
                            .respond(200,'');
                        GroupsService.getGroup(mockGroup.id).then(successSpy,failureSpy);
                        $timeout.flush(60000);
                        expect(successSpy).not.toHaveBeenCalled();
                        expect(failureSpy).toHaveBeenCalledWith('Request timed out.');
                    });
                });

                describe('putGroup(id, group)', function() {
                    beforeEach(function(){
                        successSpy = jasmine.createSpy('putGroup.success');
                        failureSpy = jasmine.createSpy('putGroup.failure');
                        spyOn($timeout,'cancel');
                    });

                    it('will resolve promise if successfull',function(){
                        $httpBackend.expectPUT('/api/minireelGroup/g-111')
                            .respond(200,mockGroup);
                        GroupsService.putGroup(mockGroup.id, mockGroup).then(successSpy,failureSpy);
                        $httpBackend.flush();
                        expect(successSpy).toHaveBeenCalledWith(mockGroup);
                        expect(failureSpy).not.toHaveBeenCalled();
                        expect($timeout.cancel).toHaveBeenCalled();
                    });

                    it('will reject promise if not successful',function(){
                        $httpBackend.expectPUT('/api/minireelGroup/g-111')
                            .respond(404,'Unable to update group.');
                        GroupsService.putGroup(mockGroup.id, mockGroup).then(successSpy,failureSpy);
                        $httpBackend.flush();
                        expect(successSpy).not.toHaveBeenCalled();
                        expect(failureSpy).toHaveBeenCalledWith('Unable to update group.');
                        expect($timeout.cancel).toHaveBeenCalled();
                    });

                    it('will reject promise if times out',function(){
                        $httpBackend.expectPUT('/api/minireelGroup/g-111')
                            .respond(200,'');
                        GroupsService.putGroup(mockGroup.id, mockGroup).then(successSpy,failureSpy);
                        $timeout.flush(60000);
                        expect(successSpy).not.toHaveBeenCalled();
                        expect(failureSpy).toHaveBeenCalledWith('Request timed out.');
                    });
                });

                describe('postGroup(group)', function() {
                    beforeEach(function(){
                        successSpy = jasmine.createSpy('postSite.success');
                        failureSpy = jasmine.createSpy('postSite.failure');
                        spyOn($timeout,'cancel');
                    });

                    it('will resolve promise if successfull',function(){
                        $httpBackend.expectPOST('/api/minireelGroup')
                            .respond(200,mockGroup);
                        GroupsService.postGroup(mockGroup).then(successSpy,failureSpy);
                        $httpBackend.flush();
                        expect(successSpy).toHaveBeenCalledWith(mockGroup);
                        expect(failureSpy).not.toHaveBeenCalled();
                        expect($timeout.cancel).toHaveBeenCalled();
                    });

                    it('will reject promise if not successful',function(){
                        $httpBackend.expectPOST('/api/minireelGroup')
                            .respond(404,'Unable to create group.');
                        GroupsService.postGroup(mockGroup).then(successSpy,failureSpy);
                        $httpBackend.flush();
                        expect(successSpy).not.toHaveBeenCalled();
                        expect(failureSpy).toHaveBeenCalledWith('Unable to create group.');
                        expect($timeout.cancel).toHaveBeenCalled();
                    });

                    it('will reject promise if times out',function(){
                        $httpBackend.expectPOST('/api/minireelGroup')
                            .respond(200,'');
                        GroupsService.postGroup(mockGroup).then(successSpy,failureSpy);
                        $timeout.flush(60000);
                        expect(successSpy).not.toHaveBeenCalled();
                        expect(failureSpy).toHaveBeenCalledWith('Request timed out.');
                    });
                });

                describe('deleteGroup(id)', function() {
                    beforeEach(function(){
                        successSpy = jasmine.createSpy('deleteGroup.success');
                        failureSpy = jasmine.createSpy('deleteGroup.failure');
                        spyOn($timeout,'cancel');
                    });

                    it('will resolve promise if successfull',function(){
                        $httpBackend.expectDELETE('/api/minireelGroup/g-111')
                            .respond(204,'');
                        GroupsService.deleteGroup(mockGroup.id).then(successSpy,failureSpy);
                        $httpBackend.flush();
                        expect(successSpy).toHaveBeenCalled();
                        expect(failureSpy).not.toHaveBeenCalled();
                        expect($timeout.cancel).toHaveBeenCalled();
                    });

                    it('will reject promise if not successful',function(){
                        $httpBackend.expectDELETE('/api/minireelGroup/g-111')
                            .respond(401,'Unauthorized.');
                        GroupsService.deleteGroup(mockGroup.id).then(successSpy,failureSpy);
                        $httpBackend.flush();
                        expect(successSpy).not.toHaveBeenCalled();
                        expect(failureSpy).toHaveBeenCalledWith('Unauthorized.');
                        expect($timeout.cancel).toHaveBeenCalled();
                    });

                    it('will reject promise if times out',function(){
                        $httpBackend.expectDELETE('/api/minireelGroup/g-111')
                            .respond(200,'');
                        GroupsService.deleteGroup(mockGroup.id).then(successSpy,failureSpy);
                        $timeout.flush(60000);
                        expect(successSpy).not.toHaveBeenCalled();
                        expect(failureSpy).toHaveBeenCalledWith('Request timed out.');
                    });
                });
            });
        });
    })
}());