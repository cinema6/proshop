(function() {
    'use strict';

    define(['content'], function() {
        describe('contentService', function() {
            var $httpBackend,
                $timeout,
                content,
                successSpy,
                failureSpy,
                c6UrlMaker,
                mockOrg,
                mockExperiences;

            beforeEach(function() {
                mockOrg = {
                    id: 'o-1',
                    name: 'Org1',
                    status: 'active',
                    config: {},
                    waterfalls: {
                        video: ['cinema6'],
                        display: ['cinema6']
                    }
                };

                mockExperiences = [
                    {
                        id: 'e-1',
                        title: 'Mock Exp 1',
                        org: 'o-1',
                        user: 'u-1'
                    },
                    {
                        id: 'e-2',
                        title: 'Title 2',
                        org: 'o-2',
                        user: 'u-2'
                    }
                ]

                module('c6.ui', function($provide) {
                    $provide.provider('c6UrlMaker', function(){
                        this.location = jasmine.createSpy('urlMaker.location');
                        this.makeUrl = jasmine.createSpy('urlMaker.makeUrl');
                        this.$get = function(){
                            return jasmine.createSpy('urlMaker.get');
                        };
                    });
                });

                module('c6.proshop');

                inject(function($injector){
                    content = $injector.get('content');
                    $timeout = $injector.get('$timeout');
                    $httpBackend = $injector.get('$httpBackend');
                    c6UrlMaker = $injector.get('c6UrlMaker');
                });

                c6UrlMaker.and.callFake(function(path, base) {
                    return '/' + base + '/' + path;
                });
            });

            describe('methods', function() {
                describe('getExperiencesByOrg()', function() {
                    beforeEach(function(){
                        successSpy = jasmine.createSpy('getExperiencesByOrg.success');
                        failureSpy = jasmine.createSpy('getExperiencesByOrg.failure');
                        spyOn($timeout,'cancel');
                    });

                    it('will resolve promise if successfull',function(){
                        $httpBackend.expectGET('/api/content/experiences?org=o-1')
                            .respond(200,mockExperiences);
                        content.getExperiencesByOrg(mockOrg.id).then(successSpy,failureSpy);
                        $httpBackend.flush();
                        expect(successSpy).toHaveBeenCalledWith(mockExperiences);
                        expect(failureSpy).not.toHaveBeenCalled();
                        expect($timeout.cancel).toHaveBeenCalled();
                    });

                    it('will reject promise if not successful',function(){
                        $httpBackend.expectGET('/api/content/experiences?org=o-1')
                            .respond(404,'Unable to find experiences.');
                        content.getExperiencesByOrg(mockOrg.id).then(successSpy,failureSpy);
                        $httpBackend.flush();
                        expect(successSpy).not.toHaveBeenCalled();
                        expect(failureSpy).toHaveBeenCalledWith('Unable to find experiences.');
                        expect($timeout.cancel).toHaveBeenCalled();
                    });

                    it('will reject promise if times out',function(){
                        $httpBackend.expectGET('/api/content/experiences?org=o-1')
                            .respond(200,'');
                        content.getExperiencesByOrg(mockOrg.id).then(successSpy,failureSpy);
                        $timeout.flush(60000);
                        expect(successSpy).not.toHaveBeenCalled();
                        expect(failureSpy).toHaveBeenCalledWith('Request timed out.');
                    });
                });

                describe('getExperiences(params)', function() {
                    beforeEach(function(){
                        successSpy = jasmine.createSpy('getExperiences.success');
                        failureSpy = jasmine.createSpy('getExperiences.failure');
                        spyOn($timeout,'cancel');
                    });

                    it('will accept empty params', function() {
                        $httpBackend.expectGET('/api/content/experiences?sponsored=false')
                            .respond(200,mockExperiences);
                        content.getExperiences().then(successSpy,failureSpy);
                        $httpBackend.flush();
                        expect(successSpy).toHaveBeenCalledWith(mockExperiences);
                        expect(failureSpy).not.toHaveBeenCalled();
                        expect($timeout.cancel).toHaveBeenCalled();
                    });

                    it('will resolve promise if successfull',function(){
                        $httpBackend.expectGET('/api/content/experiences?ids=e-1,e-2,e-3&sponsored=false')
                            .respond(200,mockExperiences);
                        content.getExperiences({ids: 'e-1,e-2,e-3'}).then(successSpy,failureSpy);
                        $httpBackend.flush();
                        expect(successSpy).toHaveBeenCalledWith(mockExperiences);
                        expect(failureSpy).not.toHaveBeenCalled();
                        expect($timeout.cancel).toHaveBeenCalled();
                    });

                    it('will reject promise if not successful',function(){
                        $httpBackend.expectGET('/api/content/experiences?ids=e-1,e-2,e-3&sponsored=false')
                            .respond(404,'Unable to find experiences.');
                        content.getExperiences({ids: 'e-1,e-2,e-3'}).then(successSpy,failureSpy);
                        $httpBackend.flush();
                        expect(successSpy).not.toHaveBeenCalled();
                        expect(failureSpy).toHaveBeenCalledWith('Unable to find experiences.');
                        expect($timeout.cancel).toHaveBeenCalled();
                    });

                    it('will reject promise if times out',function(){
                        $httpBackend.expectGET('/api/content/experiences?ids=e-1,e-2,e-3&sponsored=false')
                            .respond(200,'');
                        content.getExperiences({ids: 'e-1,e-2,e-3'}).then(successSpy,failureSpy);
                        $timeout.flush(60000);
                        expect(successSpy).not.toHaveBeenCalled();
                        expect(failureSpy).toHaveBeenCalledWith('Request timed out.');
                    });
                });

                describe('getExperience()', function() {
                    beforeEach(function(){
                        successSpy = jasmine.createSpy('getExperience.success');
                        failureSpy = jasmine.createSpy('getExperience.failure');
                        spyOn($timeout,'cancel');
                    });

                    it('will resolve promise if successfull',function(){
                        $httpBackend.expectGET('/api/content/experience/e-1')
                            .respond(200,mockExperiences[0]);
                        content.getExperience('e-1').then(successSpy,failureSpy);
                        $httpBackend.flush();
                        expect(successSpy).toHaveBeenCalledWith(mockExperiences[0]);
                        expect(failureSpy).not.toHaveBeenCalled();
                        expect($timeout.cancel).toHaveBeenCalled();
                    });

                    it('will reject promise if not successful',function(){
                        $httpBackend.expectGET('/api/content/experience/e-1')
                            .respond(404,'Unable to find experience.');
                        content.getExperience('e-1').then(successSpy,failureSpy);
                        $httpBackend.flush();
                        expect(successSpy).not.toHaveBeenCalled();
                        expect(failureSpy).toHaveBeenCalledWith('Unable to find experience.');
                        expect($timeout.cancel).toHaveBeenCalled();
                    });

                    it('will reject promise if times out',function(){
                        $httpBackend.expectGET('/api/content/experience/e-1')
                            .respond(200,'');
                        content.getExperience('e-1').then(successSpy,failureSpy);
                        $timeout.flush(60000);
                        expect(successSpy).not.toHaveBeenCalled();
                        expect(failureSpy).toHaveBeenCalledWith('Request timed out.');
                    });
                });

                describe('putExperience()', function() {
                    beforeEach(function(){
                        successSpy = jasmine.createSpy('putExperience.success');
                        failureSpy = jasmine.createSpy('putExperience.failure');
                        spyOn($timeout,'cancel');
                    });

                    it('will resolve promise if successfull',function(){
                        $httpBackend.expectPUT('/api/content/experience/e-1')
                            .respond(200,mockExperiences[0]);
                        content.putExperience(mockExperiences[0]).then(successSpy,failureSpy);
                        $httpBackend.flush();
                        expect(successSpy).toHaveBeenCalledWith(mockExperiences[0]);
                        expect(failureSpy).not.toHaveBeenCalled();
                        expect($timeout.cancel).toHaveBeenCalled();
                    });

                    it('will reject promise if not successful',function(){
                        $httpBackend.expectPUT('/api/content/experience/e-1')
                            .respond(404,'Unable to find experience.');
                        content.putExperience(mockExperiences[0]).then(successSpy,failureSpy);
                        $httpBackend.flush();
                        expect(successSpy).not.toHaveBeenCalled();
                        expect(failureSpy).toHaveBeenCalledWith('Unable to find experience.');
                        expect($timeout.cancel).toHaveBeenCalled();
                    });

                    it('will reject promise if times out',function(){
                        $httpBackend.expectPUT('/api/content/experience/e-1')
                            .respond(200,'');
                        content.putExperience(mockExperiences[0]).then(successSpy,failureSpy);
                        $timeout.flush(60000);
                        expect(successSpy).not.toHaveBeenCalled();
                        expect(failureSpy).toHaveBeenCalledWith('Request timed out.');
                    });
                });

                describe('postExperience()', function() {
                    beforeEach(function(){
                        successSpy = jasmine.createSpy('postExperience.success');
                        failureSpy = jasmine.createSpy('postExperience.failure');
                        spyOn($timeout,'cancel');
                    });

                    it('will resolve promise if successfull',function(){
                        $httpBackend.expectPOST('/api/content/experience')
                            .respond(200,mockExperiences[0]);
                        content.postExperience(mockExperiences[0]).then(successSpy,failureSpy);
                        $httpBackend.flush();
                        expect(successSpy).toHaveBeenCalledWith(mockExperiences[0]);
                        expect(failureSpy).not.toHaveBeenCalled();
                        expect($timeout.cancel).toHaveBeenCalled();
                    });

                    it('will reject promise if not successful',function(){
                        $httpBackend.expectPOST('/api/content/experience')
                            .respond(404,'Unable to create experience.');
                        content.postExperience(mockExperiences[0]).then(successSpy,failureSpy);
                        $httpBackend.flush();
                        expect(successSpy).not.toHaveBeenCalled();
                        expect(failureSpy).toHaveBeenCalledWith('Unable to create experience.');
                        expect($timeout.cancel).toHaveBeenCalled();
                    });

                    it('will reject promise if times out',function(){
                        $httpBackend.expectPOST('/api/content/experience')
                            .respond(200,'');
                        content.postExperience(mockExperiences[0]).then(successSpy,failureSpy);
                        $timeout.flush(60000);
                        expect(successSpy).not.toHaveBeenCalled();
                        expect(failureSpy).toHaveBeenCalledWith('Request timed out.');
                    });
                });

                describe('convertExperienceForCopy()', function() {
                    it('should add properties', function() {
                        var exp = angular.copy(mockExperiences[0]);
                        exp.user = {
                            id: 'u-1',
                            email: 'foo@bar.com'
                        };
                        exp = content.convertExperienceForCopy(exp);

                        expect(exp.origExpId).toBe('e-1');
                        expect(exp.origOrg).toBe('o-1');
                        expect(exp.origUser).toBe('u-1');
                        expect(exp.status).toBe('active');
                        expect(exp.access).toBe('public');
                    });
                });
            });
        });
    });
}());