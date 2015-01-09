(function() {
    'use strict';

    define(['categories'], function(categoriesModule) {
        describe('CategoriesService', function() {
            var $httpBackend,
                $timeout,
                CategoriesService,
                successSpy,
                failureSpy,
                c6UrlMaker,
                mockCategory,
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

                module(categoriesModule.name);

                inject(function($injector) {
                    $httpBackend = $injector.get('$httpBackend');
                    $timeout = $injector.get('$timeout');
                    CategoriesService = $injector.get('CategoriesService');
                    c6UrlMaker = $injector.get('c6UrlMaker');
                });

                c6UrlMaker.and.callFake(function(path, base) {
                    return '/' + base + '/' + path;
                });
            });

            describe('methods', function() {
                describe('getCategories()', function() {
                    beforeEach(function(){
                        successSpy = jasmine.createSpy('getSites.success');
                        failureSpy = jasmine.createSpy('getSites.failure');
                        spyOn($timeout,'cancel');
                    });

                    it('will resolve promise if successfull',function(){
                        $httpBackend.expectGET('/api/categories')
                            .respond(200,mockCategories);
                        CategoriesService.getCategories().then(successSpy,failureSpy);
                        $httpBackend.flush();
                        expect(successSpy).toHaveBeenCalledWith(mockCategories);
                        expect(failureSpy).not.toHaveBeenCalled();
                        expect($timeout.cancel).toHaveBeenCalled();
                    });

                    it('will reject promise if not successful',function(){
                        $httpBackend.expectGET('/api/categories')
                            .respond(404,'Unable to find categories.');
                        CategoriesService.getCategories().then(successSpy,failureSpy);
                        $httpBackend.flush();
                        expect(successSpy).not.toHaveBeenCalled();
                        expect(failureSpy).toHaveBeenCalledWith('Unable to find categories.');
                        expect($timeout.cancel).toHaveBeenCalled();
                    });

                    it('will reject promise if times out',function(){
                        $httpBackend.expectGET('/api/categories')
                            .respond(200,'');
                        CategoriesService.getCategories().then(successSpy,failureSpy);
                        $timeout.flush(60000);
                        expect(successSpy).not.toHaveBeenCalled();
                        expect(failureSpy).toHaveBeenCalledWith('Request timed out.');
                    });
                });

                describe('getCategory(id)', function() {
                    beforeEach(function(){
                        successSpy = jasmine.createSpy('getCategory.success');
                        failureSpy = jasmine.createSpy('getCategory.failure');
                        spyOn($timeout,'cancel');
                    });

                    it('will resolve promise if successfull',function(){
                        $httpBackend.expectGET('/api/category/c-111')
                            .respond(200,mockCategory);
                        CategoriesService.getCategory(mockCategory.id).then(successSpy,failureSpy);
                        $httpBackend.flush();
                        expect(successSpy).toHaveBeenCalledWith(mockCategory);
                        expect(failureSpy).not.toHaveBeenCalled();
                        expect($timeout.cancel).toHaveBeenCalled();
                    });

                    it('will reject promise if not successful',function(){
                        $httpBackend.expectGET('/api/category/c-111')
                            .respond(404,'Unable to find category.');
                        CategoriesService.getCategory(mockCategory.id).then(successSpy,failureSpy);
                        $httpBackend.flush();
                        expect(successSpy).not.toHaveBeenCalled();
                        expect(failureSpy).toHaveBeenCalledWith('Unable to find category.');
                        expect($timeout.cancel).toHaveBeenCalled();
                    });

                    it('will reject promise if times out',function(){
                        $httpBackend.expectGET('/api/category/c-111')
                            .respond(200,'');
                        CategoriesService.getCategory(mockCategory.id).then(successSpy,failureSpy);
                        $timeout.flush(60000);
                        expect(successSpy).not.toHaveBeenCalled();
                        expect(failureSpy).toHaveBeenCalledWith('Request timed out.');
                    });
                });

                describe('putCategory(id, category)', function() {
                    var editedCategory;

                    beforeEach(function(){
                        successSpy = jasmine.createSpy('putCategory.success');
                        failureSpy = jasmine.createSpy('putCategory.failure');
                        spyOn($timeout,'cancel');

                        editedCategory = {};
                        ['name','label','status'].forEach(function(prop) {
                            editedCategory[prop] = mockCategory[prop];
                        });
                    });

                    it('will resolve promise if successfull',function(){
                        $httpBackend.expectPUT('/api/category/c-111')
                            .respond(200,mockCategory);
                        CategoriesService.putCategory(mockCategory.id, editedCategory).then(successSpy,failureSpy);
                        $httpBackend.flush();
                        expect(successSpy).toHaveBeenCalledWith(mockCategory);
                        expect(failureSpy).not.toHaveBeenCalled();
                        expect($timeout.cancel).toHaveBeenCalled();
                    });

                    it('will reject promise if not successful',function(){
                        $httpBackend.expectPUT('/api/category/c-111')
                            .respond(404,'Unable to update category.');
                        CategoriesService.putCategory(mockCategory.id, editedCategory).then(successSpy,failureSpy);
                        $httpBackend.flush();
                        expect(successSpy).not.toHaveBeenCalled();
                        expect(failureSpy).toHaveBeenCalledWith('Unable to update category.');
                        expect($timeout.cancel).toHaveBeenCalled();
                    });

                    it('will reject promise if times out',function(){
                        $httpBackend.expectPUT('/api/category/c-111')
                            .respond(200,'');
                        CategoriesService.putCategory(mockCategory.id, editedCategory).then(successSpy,failureSpy);
                        $timeout.flush(60000);
                        expect(successSpy).not.toHaveBeenCalled();
                        expect(failureSpy).toHaveBeenCalledWith('Request timed out.');
                    });
                });

                describe('postCategory(category)', function() {
                    var newCategory;

                    beforeEach(function(){
                        successSpy = jasmine.createSpy('postSite.success');
                        failureSpy = jasmine.createSpy('postSite.failure');
                        spyOn($timeout,'cancel');

                        newCategory = {};
                        ['name','label','status'].forEach(function(prop) {
                            newCategory[prop] = mockCategory[prop];
                        });
                    });

                    it('will resolve promise if successfull',function(){
                        $httpBackend.expectPOST('/api/category')
                            .respond(200,mockCategory);
                        CategoriesService.postCategory(newCategory).then(successSpy,failureSpy);
                        $httpBackend.flush();
                        expect(successSpy).toHaveBeenCalledWith(mockCategory);
                        expect(failureSpy).not.toHaveBeenCalled();
                        expect($timeout.cancel).toHaveBeenCalled();
                    });

                    it('will reject promise if not successful',function(){
                        $httpBackend.expectPOST('/api/category')
                            .respond(404,'Unable to create category.');
                        CategoriesService.postCategory(newCategory).then(successSpy,failureSpy);
                        $httpBackend.flush();
                        expect(successSpy).not.toHaveBeenCalled();
                        expect(failureSpy).toHaveBeenCalledWith('Unable to create category.');
                        expect($timeout.cancel).toHaveBeenCalled();
                    });

                    it('will reject promise if times out',function(){
                        $httpBackend.expectPOST('/api/category')
                            .respond(200,'');
                        CategoriesService.postCategory(newCategory).then(successSpy,failureSpy);
                        $timeout.flush(60000);
                        expect(successSpy).not.toHaveBeenCalled();
                        expect(failureSpy).toHaveBeenCalledWith('Request timed out.');
                    });
                });

                describe('deleteCategory(id)', function() {
                    beforeEach(function(){
                        successSpy = jasmine.createSpy('deleteCategory.success');
                        failureSpy = jasmine.createSpy('deleteCategory.failure');
                        spyOn($timeout,'cancel');
                    });

                    it('will resolve promise if successfull',function(){
                        $httpBackend.expectDELETE('/api/category/c-111')
                            .respond(204,'');
                        CategoriesService.deleteCategory(mockCategory.id).then(successSpy,failureSpy);
                        $httpBackend.flush();
                        expect(successSpy).toHaveBeenCalled();
                        expect(failureSpy).not.toHaveBeenCalled();
                        expect($timeout.cancel).toHaveBeenCalled();
                    });

                    it('will reject promise if not successful',function(){
                        $httpBackend.expectDELETE('/api/category/c-111')
                            .respond(401,'Unauthorized.');
                        CategoriesService.deleteCategory(mockCategory.id).then(successSpy,failureSpy);
                        $httpBackend.flush();
                        expect(successSpy).not.toHaveBeenCalled();
                        expect(failureSpy).toHaveBeenCalledWith('Unauthorized.');
                        expect($timeout.cancel).toHaveBeenCalled();
                    });

                    it('will reject promise if times out',function(){
                        $httpBackend.expectDELETE('/api/category/c-111')
                            .respond(200,'');
                        CategoriesService.deleteCategory(mockCategory.id).then(successSpy,failureSpy);
                        $timeout.flush(60000);
                        expect(successSpy).not.toHaveBeenCalled();
                        expect(failureSpy).toHaveBeenCalledWith('Request timed out.');
                    });
                });
            });
        });
    })
}());