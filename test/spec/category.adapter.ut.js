(function() {
    'use strict';

    define(['app'], function(proshop) {
        describe('CategoryAdapter', function() {
            var $rootScope,
                $httpBackend,
                CategoryAdapter,
                adapter,
                c6UrlMaker,
                successSpy,
                failureSpy;

            var mockCategory,
                mockCategories;

            beforeEach(function() {
                /* jsHint quotmark:false */
                mockCategory = {
                    "id": "c-111",
                    "name": "sports",
                    "label": "Sports",
                    "created": "2014-06-13T19:28:39.408Z",
                    "lastUpdated": "2014-06-13T19:28:39.408Z",
                    "status": "active"
                };

                mockCategories = [
                    {
                        "id": "c-111",
                        "name": "sports",
                        "label": "Sports",
                        "created": "2014-06-13T19:28:39.408Z",
                        "lastUpdated": "2014-06-13T19:28:39.408Z",
                        "status": "active"
                    },
                    {
                        "id": "c-112",
                        "name": "technology",
                        "label": "Technology",
                        "created": "2014-06-13T19:28:39.408Z",
                        "lastUpdated": "2014-06-13T19:28:39.408Z",
                        "status": "active"
                    },
                    {
                        "id": "c-113",
                        "name": "people_blogs",
                        "label": "People & Blogs",
                        "created": "2014-06-13T19:28:39.408Z",
                        "lastUpdated": "2014-06-13T19:28:39.408Z",
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

                    CategoryAdapter = $injector.get('CategoryAdapter');

                    adapter = $injector.instantiate(CategoryAdapter);
                });
            });

            describe('initialization', function() {
                it('should exist', function() {
                    expect(adapter).toEqual(jasmine.any(Object));
                });

                it('should set the apiBase', function() {
                    expect(c6UrlMaker).toHaveBeenCalledWith('content/category','api');
                });
            });

            describe('methods', function() {
                describe('get(id)', function() {
                    beforeEach(function(){
                        successSpy = jasmine.createSpy('get().success');
                        failureSpy = jasmine.createSpy('get().failure');
                    });

                    it('will resolve promise if successfull',function(){
                        $httpBackend.expectGET('/api/content/category/c-111')
                            .respond(200,mockCategory);
                        adapter.get('c-111').then(successSpy,failureSpy);
                        $httpBackend.flush();
                        expect(successSpy).toHaveBeenCalledWith(mockCategory);
                        expect(failureSpy).not.toHaveBeenCalled();
                    });

                    it('will reject promise if not successful',function(){
                        $httpBackend.expectGET('/api/content/category/c-111')
                            .respond(404,'Unable to find category.');
                        adapter.get('c-111').then(successSpy,failureSpy);
                        $httpBackend.flush();
                        expect(successSpy).not.toHaveBeenCalled();
                        expect(failureSpy).toHaveBeenCalledWith('Unable to find category.');
                    });
                });

                describe('getAll(params)', function() {
                    beforeEach(function(){
                        successSpy = jasmine.createSpy('getAll().success');
                        failureSpy = jasmine.createSpy('getAll.failure');
                    });

                    it('will accept empty params', function() {
                        $httpBackend.expectGET('/api/content/categories')
                            .respond(200,mockCategories,{'Content-Range': 'items 1-19/19'});
                        adapter.getAll().then(successSpy,failureSpy);
                        $httpBackend.flush();

                        expect(successSpy).toHaveBeenCalledWith(jasmine.objectContaining({
                            data: mockCategories,
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
                        $httpBackend.expectGET('/api/content/categories?ids=c-1,c-2,c-3&limit=3')
                            .respond(200,mockCategories,{'Content-Range': 'items 1-19/19'});
                        adapter.getAll({ids: 'c-1,c-2,c-3', limit: 3}).then(successSpy,failureSpy);
                        $httpBackend.flush();
                        expect(successSpy).toHaveBeenCalledWith(jasmine.objectContaining({
                            data: mockCategories,
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
                        $httpBackend.expectGET('/api/content/categories?ids=c-1,c-2,c-3')
                            .respond(404,'Unable to find categories.');
                        adapter.getAll({ids: 'c-1,c-2,c-3'}).then(successSpy,failureSpy);
                        $httpBackend.flush();
                        expect(successSpy).not.toHaveBeenCalled();
                        expect(failureSpy).toHaveBeenCalledWith('Unable to find categories.');
                    });
                });

                describe('put(id, model)', function() {
                    beforeEach(function(){
                        successSpy = jasmine.createSpy('put.success');
                        failureSpy = jasmine.createSpy('put.failure');
                    });

                    it('will resolve promise if successfull',function(){
                        $httpBackend.expectPUT('/api/content/category/c-111')
                            .respond(200,mockCategory);
                        adapter.put(mockCategory.id, mockCategory).then(successSpy,failureSpy);
                        $httpBackend.flush();
                        expect(successSpy).toHaveBeenCalledWith(mockCategory);
                        expect(failureSpy).not.toHaveBeenCalled();
                    });

                    it('will reject promise if not successful',function(){
                        $httpBackend.expectPUT('/api/content/category/c-111')
                            .respond(404,'Unable to update category.');
                        adapter.put(mockCategory.id, mockCategory).then(successSpy,failureSpy);
                        $httpBackend.flush();
                        expect(successSpy).not.toHaveBeenCalled();
                        expect(failureSpy).toHaveBeenCalledWith('Unable to update category.');
                    });
                });

                describe('post(model)', function() {
                    beforeEach(function(){
                        successSpy = jasmine.createSpy('post.success');
                        failureSpy = jasmine.createSpy('post.failure');
                    });

                    it('will resolve promise if successfull',function(){
                        $httpBackend.expectPOST('/api/content/category')
                            .respond(200,mockCategory);
                        adapter.post(mockCategory).then(successSpy,failureSpy);
                        $httpBackend.flush();
                        expect(successSpy).toHaveBeenCalledWith(mockCategory);
                        expect(failureSpy).not.toHaveBeenCalled();
                    });

                    it('will reject promise if not successful',function(){
                        $httpBackend.expectPOST('/api/content/category')
                            .respond(404,'Unable to create category.');
                        adapter.post(mockCategory).then(successSpy,failureSpy);
                        $httpBackend.flush();
                        expect(successSpy).not.toHaveBeenCalled();
                        expect(failureSpy).toHaveBeenCalledWith('Unable to create category.');
                    });
                });

                describe('delete(id)', function() {
                    beforeEach(function(){
                        successSpy = jasmine.createSpy('delete.success');
                        failureSpy = jasmine.createSpy('delete.failure');
                    });

                    it('will resolve promise if successfull',function(){
                        $httpBackend.expectDELETE('/api/content/category/c-111')
                            .respond(204,'');
                        adapter.delete(mockCategory.id).then(successSpy,failureSpy);
                        $httpBackend.flush();
                        expect(successSpy).toHaveBeenCalled();
                        expect(failureSpy).not.toHaveBeenCalled();
                    });

                    it('will reject promise if not successful',function(){
                        $httpBackend.expectDELETE('/api/content/category/c-111')
                            .respond(401,'Unauthorized.');
                        adapter.delete(mockCategory.id).then(successSpy,failureSpy);
                        $httpBackend.flush();
                        expect(successSpy).not.toHaveBeenCalled();
                        expect(failureSpy).toHaveBeenCalledWith('Unauthorized.');
                    });
                });
            });
        });
    });
}());