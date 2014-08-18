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
                        successSpy = jasmine.createSpy('getOrg.success');
                        failureSpy = jasmine.createSpy('getOrg.failure');
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
                            .respond(404,'Unable to find org.');
                        content.getExperiencesByOrg(mockOrg.id).then(successSpy,failureSpy);
                        $httpBackend.flush();
                        expect(successSpy).not.toHaveBeenCalled();
                        expect(failureSpy).toHaveBeenCalledWith('Unable to find org.');
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