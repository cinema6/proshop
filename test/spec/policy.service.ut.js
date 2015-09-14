(function() {
    'use strict';

    define(['app'], function(proshop) {
        var copy = angular.copy;

        describe('PolicyService', function() {
            var $rootScope,
                $httpBackend,
                $q,
                content,
                PolicyService,
                c6UrlMaker,
                successSpy,
                failureSpy;

            var mockPolicy,
                mockPolicies,
                mockExperiences;

            beforeEach(function() {
                /* jsHint quotmark:false */
                mockPolicy = {
                    "id": "p-111",
                    "name": "Campaign Manager",
                    "created": "2014-06-13T19:28:39.408Z",
                    "lastUpdated": "2014-06-13T19:28:39.408Z",
                    "status": "active",
                    "priority": 1,
                    "permissions": {
                        "campaigns": {
                            "read": "all",
                            "create": "all",
                            "edit": "all",
                            "delete": "all"
                        }
                    },
                    "applications": [
                        "e-selfie-experience",
                        "e-studio-experience"
                    ],
                    "fieldValidation": {
                        "campaigns": {
                            "status": {
                                "__allowed": true
                            },
                            "user": {
                                "__allowed": true
                            },
                            "org": {
                                "__allowed": true
                            },
                            "minViewTime": {
                                "__allowed": true
                            },
                            "pricing": {
                                "cost": {
                                    "__allowed": true
                                }
                            },
                            "cards": {
                                "__allowed": true,
                                "__unchangeable": false
                            }
                        }
                    },
                    "entitlements": {
                        "canEditSomething": true
                    }
                };

                mockPolicies = [
                    {
                        "id": "p-111",
                        "name": "Campaign Manager",
                        "created": "2014-06-13T19:28:39.408Z",
                        "lastUpdated": "2014-06-13T19:28:39.408Z",
                        "status": "active",
                        "priority": 1,
                        "permissions": {
                            "campaigns": {
                                "read": "all",
                                "create": "all",
                                "edit": "all",
                                "delete": "all"
                            }
                        },
                        "applications": [
                            "e-selfie-experience",
                            "e-studio-experience"
                        ],
                        "fieldValidation": {
                            "campaigns": {
                                "status": {
                                    "__allowed": true
                                },
                                "user": {
                                    "__allowed": true
                                },
                                "org": {
                                    "__allowed": true
                                },
                                "minViewTime": {
                                    "__allowed": true
                                },
                                "pricing": {
                                    "cost": {
                                        "__allowed": true
                                    }
                                },
                                "cards": {
                                    "__allowed": true,
                                    "__unchangeable": false
                                }
                            }
                        },
                        "entitlements": {
                            "canEditSomething": true
                        }
                    },
                    {
                        "id": "p-112",
                        "name": "MiniReel Creator",
                        "created": "2015-06-13T19:28:39.408Z",
                        "lastUpdated": "2015-06-13T19:28:39.408Z",
                        "status": "active",
                        "applications": ["e-studio-experience"],
                        "permissions": {},
                        "fieldValidation": {}
                    },
                    {
                        "id": "p-113",
                        "name": "Selfie User",
                        "created": "2015-07-13T19:28:39.408Z",
                        "lastUpdated": "2015-07-13T19:28:39.408Z",
                        "status": "active",
                        "permissions": {
                            "campaigns": {
                                "read": "org",
                                "create": "org",
                                "edit": "org",
                                "delete": "org"
                            }
                        },
                        "fieldValidation": {
                            "campaigns": {}
                        },
                        "applications": ["e-selfie-experience"]
                    }
                ];

                mockExperiences = {
                    meta: {
                        items: {
                            start: 1,
                            end: 3,
                            total: 3
                        }
                    },
                    data: [
                        {
                            "id": "e-proshop-experience",
                            "title": "ProShop",
                            "created": "2014-06-13T19:28:39.408Z",
                            "lastUpdated": "2015-01-12T18:06:52.877Z",
                            "status": "active"
                        },
                        {
                            "id": "e-selfie-experience",
                            "title": "Selfie",
                            "created": "2014-06-13T19:28:39.408Z",
                            "lastUpdated": "2014-06-13T19:28:39.408Z",
                            "status": "active"
                        },
                        {
                            "id": "e-studio-experience",
                            "title": "Studio",
                            "created": "2014-06-13T19:28:39.408Z",
                            "lastUpdated": "2014-06-13T19:28:39.408Z",
                            "status": "active"
                        }
                    ]
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

                    content = $injector.get('content');
                    content.getExperiences.deferred = $q.defer();
                    spyOn(content, 'getExperiences').and.callFake(function(endpoint, params) {
                        return content.getExperiences.deferred.promise;
                    });

                    c6UrlMaker = $injector.get('c6UrlMaker');
                    c6UrlMaker.and.callFake(function(path, base) {
                        return '/' + base + '/' + path;
                    });

                    PolicyService = $injector.get('PolicyService');
                });
            });

            describe('initialization', function() {
                it('should exist', function() {
                    expect(PolicyService).toEqual(jasmine.any(Object));
                });

                it('should set the apiBase', function() {
                    expect(c6UrlMaker).toHaveBeenCalledWith('account/policies','api');
                });
            });

            describe('methods', function() {
                describe('get(id)', function() {
                    beforeEach(function(){
                        successSpy = jasmine.createSpy('get().success');
                        failureSpy = jasmine.createSpy('get().failure');
                    });

                    it('will decorate the policy with application experience objects and resolve promise if successfull',function(){
                        var decoratedPolicy = copy(mockPolicy);
                        decoratedPolicy.applications = copy([mockExperiences.data[1],mockExperiences.data[2]]);
                        mockExperiences.data = [mockExperiences.data[1],mockExperiences.data[2]];

                        $httpBackend.expectGET('/api/account/policies/p-111')
                            .respond(200,mockPolicy);
                        PolicyService.get('p-111').then(successSpy,failureSpy);
                        content.getExperiences.deferred.resolve(mockExperiences.data);
                        $httpBackend.flush();

                        expect(content.getExperiences).toHaveBeenCalledWith({ids: 'e-selfie-experience,e-studio-experience'});
                        expect(successSpy).toHaveBeenCalledWith(decoratedPolicy);
                        expect(failureSpy).not.toHaveBeenCalled();
                    });

                    it('will reject promise if not successful',function(){
                        $httpBackend.expectGET('/api/account/policies/p-111')
                            .respond(404,'Unable to find policies.');
                        PolicyService.get('p-111').then(successSpy,failureSpy);
                        $httpBackend.flush();
                        expect(successSpy).not.toHaveBeenCalled();
                        expect(failureSpy).toHaveBeenCalledWith('Unable to find policies.');
                    });

                    it('will reject promise if decoration call is not successful',function(){
                        $httpBackend.expectGET('/api/account/policies/p-111')
                            .respond(200,mockPolicy);
                        PolicyService.get('p-111').then(successSpy,failureSpy);
                        content.getExperiences.deferred.reject();
                        $httpBackend.flush();
                        expect(successSpy).not.toHaveBeenCalled();
                        expect(failureSpy).toHaveBeenCalledWith('Unable to complete request');
                    });
                });

                describe('getAll(params)', function() {
                    beforeEach(function(){
                        successSpy = jasmine.createSpy('getAll().success');
                        failureSpy = jasmine.createSpy('getAll.failure');

                        content.getExperiences.and.callFake(function(params) {
                            var ids = params.ids.split(',');

                            return $q.all(mockExperiences.data.filter(function(exp) {
                                return ids.indexOf(exp.id) !== -1;
                            }));
                        });
                    });

                    it('will accept empty params and will decorate each customer with advertiser objects', function() {
                        var decoratedPolicies = copy(mockPolicies);

                        decoratedPolicies[0].applications = [copy(mockExperiences.data[1]), copy(mockExperiences.data[2])];
                        decoratedPolicies[1].applications = [copy(mockExperiences.data[2])];
                        decoratedPolicies[2].applications = [copy(mockExperiences.data[1])];

                        $httpBackend.expectGET('/api/account/policies')
                            .respond(200,mockPolicies,{'Content-Range': 'items 1-19/19'});
                        PolicyService.getAll().then(successSpy,failureSpy);
                        $httpBackend.flush();

                        expect(content.getExperiences).toHaveBeenCalledWith({ids: 'e-selfie-experience,e-studio-experience'});
                        expect(content.getExperiences).toHaveBeenCalledWith({ids: 'e-studio-experience'});
                        expect(content.getExperiences).toHaveBeenCalledWith({ids: 'e-selfie-experience'});

                        expect(successSpy).toHaveBeenCalledWith(jasmine.objectContaining({
                            data: decoratedPolicies,
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

                    it('will decorate the customers with advertisers and resolve promise if successfull',function(){
                        var decoratedPolicies = copy(mockPolicies);

                        decoratedPolicies[0].applications = [copy(mockExperiences.data[1]), copy(mockExperiences.data[2])];
                        decoratedPolicies[1].applications = [copy(mockExperiences.data[2])];
                        decoratedPolicies[2].applications = [copy(mockExperiences.data[1])];

                        $httpBackend.expectGET('/api/account/policies?ids=p-111,p-112,p-113&limit=3')
                            .respond(200,mockPolicies,{'Content-Range': 'items 1-19/19'});
                        PolicyService.getAll({ids: 'p-111,p-112,p-113', limit: 3}).then(successSpy,failureSpy);
                        $httpBackend.flush();

                        expect(content.getExperiences).toHaveBeenCalledWith({ids: 'e-selfie-experience,e-studio-experience'});
                        expect(content.getExperiences).toHaveBeenCalledWith({ids: 'e-studio-experience'});
                        expect(content.getExperiences).toHaveBeenCalledWith({ids: 'e-selfie-experience'});

                        expect(successSpy).toHaveBeenCalledWith(jasmine.objectContaining({
                            data: decoratedPolicies,
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
                        $httpBackend.expectGET('/api/account/policies?ids=p-111,p-112,p-113')
                            .respond(404,'Unable to find policies.');
                        PolicyService.getAll({ids: 'p-111,p-112,p-113'}).then(successSpy,failureSpy);
                        $httpBackend.flush();
                        expect(successSpy).not.toHaveBeenCalled();
                        expect(failureSpy).toHaveBeenCalledWith('Unable to find policies.');
                    });

                    it('will reject promise if decoration call is not successful',function(){
                        content.getExperiences.and.returnValue(content.getExperiences.deferred.promise);

                        $httpBackend.expectGET('/api/account/policies?ids=p-111,p-112,p-113')
                            .respond(200,mockPolicies,{'Content-Range': 'items 1-19/19'});
                        PolicyService.getAll({ids: 'p-111,p-112,p-113'}).then(successSpy,failureSpy);
                        content.getExperiences.deferred.reject();
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

                    it('should undecorate the policy', function() {
                        var decoratedPolicy = copy(mockPolicy);
                        decoratedPolicy.applications = [copy(mockExperiences.data[1]), copy(mockExperiences.data[2])];

                        var putPolicy = copy(mockPolicy);
                        delete putPolicy.id;

                        $httpBackend.expectPUT('/api/account/policies/p-111',putPolicy)
                            .respond(200,mockPolicy);
                        PolicyService.put(decoratedPolicy.id, decoratedPolicy).then(successSpy,failureSpy);
                        $httpBackend.flush();
                        expect(successSpy).toHaveBeenCalledWith(mockPolicy);
                        expect(failureSpy).not.toHaveBeenCalled();
                    });

                    it('will resolve promise if successfull',function(){
                        $httpBackend.expectPUT('/api/account/policies/p-111')
                            .respond(200,mockPolicy);
                        PolicyService.put(mockPolicy.id, mockPolicy).then(successSpy,failureSpy);
                        $httpBackend.flush();
                        expect(successSpy).toHaveBeenCalledWith(mockPolicy);
                        expect(failureSpy).not.toHaveBeenCalled();
                    });

                    it('will reject promise if not successful',function(){
                        $httpBackend.expectPUT('/api/account/policies/p-111')
                            .respond(404,'Unable to update policy.');
                        PolicyService.put(mockPolicy.id, mockPolicy).then(successSpy,failureSpy);
                        $httpBackend.flush();
                        expect(successSpy).not.toHaveBeenCalled();
                        expect(failureSpy).toHaveBeenCalledWith('Unable to update policy.');
                    });
                });

                describe('post(model)', function() {
                    beforeEach(function(){
                        successSpy = jasmine.createSpy('post.success');
                        failureSpy = jasmine.createSpy('post.failure');
                    });

                    it('should undecorate the policy', function() {
                        var decoratedPolicy = copy(mockPolicy);
                        decoratedPolicy.applications = [copy(mockExperiences.data[1]), copy(mockExperiences.data[2])];

                        var postedPolicy = copy(mockPolicy);
                        delete postedPolicy.id;

                        $httpBackend.expectPOST('/api/account/policies',postedPolicy)
                            .respond(200,mockPolicy);
                        PolicyService.post(decoratedPolicy).then(successSpy,failureSpy);
                        $httpBackend.flush();
                        expect(successSpy).toHaveBeenCalledWith(mockPolicy);
                        expect(failureSpy).not.toHaveBeenCalled();
                    });

                    it('will resolve promise if successfull',function(){
                        $httpBackend.expectPOST('/api/account/policies')
                            .respond(200,mockPolicy);
                        PolicyService.post(mockPolicy).then(successSpy,failureSpy);
                        $httpBackend.flush();
                        expect(successSpy).toHaveBeenCalledWith(mockPolicy);
                        expect(failureSpy).not.toHaveBeenCalled();
                    });

                    it('will reject promise if not successful',function(){
                        $httpBackend.expectPOST('/api/account/policies')
                            .respond(404,'Unable to create policies.');
                        PolicyService.post(mockPolicy).then(successSpy,failureSpy);
                        $httpBackend.flush();
                        expect(successSpy).not.toHaveBeenCalled();
                        expect(failureSpy).toHaveBeenCalledWith('Unable to create policies.');
                    });
                });

                describe('delete(id)', function() {
                    beforeEach(function(){
                        successSpy = jasmine.createSpy('delete.success');
                        failureSpy = jasmine.createSpy('delete.failure');
                    });

                    it('will resolve promise if successfull',function(){
                        $httpBackend.expectDELETE('/api/account/policies/p-111')
                            .respond(204,'');
                        PolicyService.delete(mockPolicy.id).then(successSpy,failureSpy);
                        $httpBackend.flush();
                        expect(successSpy).toHaveBeenCalled();
                        expect(failureSpy).not.toHaveBeenCalled();
                    });

                    it('will reject promise if not successful',function(){
                        $httpBackend.expectDELETE('/api/account/policies/p-111')
                            .respond(401,'Unauthorized.');
                        PolicyService.delete(mockPolicy.id).then(successSpy,failureSpy);
                        $httpBackend.flush();
                        expect(successSpy).not.toHaveBeenCalled();
                        expect(failureSpy).toHaveBeenCalledWith('Unauthorized.');
                    });
                });
            });
        });
    });
}());