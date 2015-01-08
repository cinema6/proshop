(function() {
    'use strict';

    define(['app'], function(proshop) {
        describe('CategoryController', function() {
            var $rootScope,
                $scope,
                $controller,
                $q,
                $log,
                $routeParams,
                $location,
                CategoryCtrl,
                CategoriesService,
                ConfirmDialogService,
                mockCategory;

            function compileCtrl(id) {
                $routeParams = { id: id };

                $scope = $rootScope.$new();

                CategoryCtrl = $controller('CategoryController', {
                    $log: $log,
                    $scope: $scope,
                    $routeParams: $routeParams,
                    CategoriesService: CategoriesService,
                    ConfirmDialogService: ConfirmDialogService
                });
            }

            beforeEach(function() {
                module(proshop.name);

                ConfirmDialogService = {
                    display: jasmine.createSpy('ConfirmDialogService.display()'),
                    close: jasmine.createSpy('ConfirmDialogService.close()')
                };

                CategoriesService = {
                    getCategory: jasmine.createSpy('CategoriesService.getCategory'),
                    putCategory: jasmine.createSpy('CategoriesService.putCategory'),
                    postCategory: jasmine.createSpy('CategoriesService.postCategory'),
                    deleteCategory: jasmine.createSpy('CategoriesService.deleteCategory')
                };

                /* jshint quotmark:false */
                mockCategory = {
                    "id": "c-111",
                    "name": "sports",
                    "label": "Sports",
                    "created": "2014-06-13T19:28:39.408Z",
                    "lastUpdated": "2014-06-13T19:28:39.408Z",
                    "status": "active"
                };
                /* jshint quotmark:single */

                inject(function($injector) {
                    $rootScope = $injector.get('$rootScope');
                    $controller = $injector.get('$controller');
                    $location = $injector.get('$location');
                    $log = $injector.get('$log');
                    $q = $injector.get('$q');

                    spyOn($location, 'path');

                    CategoriesService.getCategory.deferred = $q.defer();
                    CategoriesService.getCategory.and.returnValue(CategoriesService.getCategory.deferred.promise);

                    CategoriesService.putCategory.deferred = $q.defer();
                    CategoriesService.putCategory.and.returnValue(CategoriesService.putCategory.deferred.promise);

                    CategoriesService.postCategory.deferred = $q.defer();
                    CategoriesService.postCategory.and.returnValue(CategoriesService.postCategory.deferred.promise);

                    CategoriesService.deleteCategory.deferred = $q.defer();
                    CategoriesService.deleteCategory.and.returnValue(CategoriesService.deleteCategory.deferred.promise);
                });
            });

            describe('initialization', function() {
                describe('when path has /:id', function() {
                    beforeEach(function() {
                        compileCtrl('c-111');
                    });

                    it('should exist', function() {
                        expect(CategoryCtrl).toBeDefined();
                    });

                    it('should load the category', function() {
                        expect(CategoriesService.getCategory).toHaveBeenCalled();
                    });
                });

                describe('when path is /new', function() {
                    beforeEach(function() {
                        compileCtrl();
                    });

                    it('should exist', function() {
                        expect(CategoryCtrl).toBeDefined();
                    });

                    it('should not load a category', function() {
                        expect(CategoriesService.getCategory).not.toHaveBeenCalled();
                    });
                });
            });

            describe('properties', function() {
                describe('loading', function() {
                    describe('/new', function() {
                        it('should be false', function() {
                            compileCtrl();
                            expect(CategoryCtrl.loading).toBe(false);
                        });
                    });

                    describe('/:id', function() {
                        beforeEach(function() {
                            compileCtrl('c-111');
                        });

                        it('should be true on initialization', function() {
                            expect(CategoryCtrl.loading).toBe(true);
                        });

                        it('should be false after all data promises resolve', function() {
                            $scope.$apply(function() {
                                CategoriesService.getCategory.deferred.resolve(angular.copy(mockCategory));
                            });

                            expect(CategoryCtrl.loading).toBe(false);
                        });

                        it('should be false even if there are errors loading data', function() {
                            $scope.$apply(function() {
                                CategoriesService.getCategory.deferred.reject();
                            });

                            expect(CategoryCtrl.loading).toBe(false);
                        });
                    });
                });
            });

            describe('methods', function() {
                describe('save(category)', function() {
                    describe('when /new', function() {
                        beforeEach(function() {
                            compileCtrl();

                            CategoryCtrl.category.name = 'New Category';
                            CategoryCtrl.category.label = 'new_category';
                            CategoryCtrl.category.status = 'active';
                        });

                        it('should POST the category', function() {
                            CategoryCtrl.save(CategoryCtrl.category);

                            expect(CategoriesService.postCategory).toHaveBeenCalledWith({
                                name: 'New Category',
                                label: 'new_category',
                                status: 'active'
                            });
                        });

                        it('should return to /sites on successful save', function() {
                            CategoryCtrl.save(CategoryCtrl.category);

                            $scope.$apply(function() {
                                CategoriesService.postCategory.deferred.resolve(CategoryCtrl.category);
                            });

                            expect($location.path).toHaveBeenCalledWith('/categories');
                        });

                        it('should display an error dialog on failure', function() {
                            CategoryCtrl.save(CategoryCtrl.category);

                            $scope.$apply(function() {
                                CategoriesService.postCategory.deferred.reject('Error message');
                            });

                            expect(ConfirmDialogService.display).toHaveBeenCalled();
                            expect(ConfirmDialogService.display.calls.mostRecent().args[0].prompt).toBe('There was a problem saving the Category. Error message.');
                        });
                    });

                    describe('when /:id', function() {
                        beforeEach(function() {
                            compileCtrl('c-111');

                            $scope.$apply(function() {
                                CategoriesService.getCategory.deferred.resolve(mockCategory);
                            });
                        });

                        it('should PUT the category', function() {
                            CategoryCtrl.save(CategoryCtrl.category);

                            expect(CategoriesService.putCategory).toHaveBeenCalledWith('c-111', {
                                name: 'sports',
                                label: 'Sports',
                                status: 'active'
                            });

                            CategoryCtrl.category.label = 'Sports & Stuff';
                            CategoryCtrl.category.name = 'sports_and_stuff';
                            CategoryCtrl.category.status = 'inactive';

                            CategoryCtrl.save(CategoryCtrl.category);

                            expect(CategoriesService.putCategory).toHaveBeenCalledWith('c-111', {
                                name: 'sports_and_stuff',
                                label: 'Sports & Stuff',
                                status: 'inactive'
                            });
                        });

                        it('should return to /sites on successful save', function() {
                            CategoryCtrl.save(CategoryCtrl.category);

                            $scope.$apply(function() {
                                CategoriesService.putCategory.deferred.resolve(CategoryCtrl.category);
                            });

                            expect($location.path).toHaveBeenCalledWith('/categories');
                        });

                        it('should display an error dialog on failure', function() {
                            CategoryCtrl.save(CategoryCtrl.category);

                            $scope.$apply(function() {
                                CategoriesService.putCategory.deferred.reject('Error message');
                            });

                            expect(ConfirmDialogService.display).toHaveBeenCalled();
                            expect(ConfirmDialogService.display.calls.mostRecent().args[0].prompt).toBe('There was a problem saving the Category. Error message.');
                        });
                    });
                });

                describe('delete(category)', function() {
                    var onAffirm, onCancel;

                    beforeEach(function() {
                        compileCtrl('c-111');

                        $scope.$apply(function() {
                            CategoriesService.getCategory.deferred.resolve(mockCategory);
                        });

                        CategoryCtrl.delete();

                        onAffirm = ConfirmDialogService.display.calls.mostRecent().args[0].onAffirm;
                        onCancel = ConfirmDialogService.display.calls.mostRecent().args[0].onCancel;
                    });

                    it('should display a confirmation dialog', function() {
                        expect(ConfirmDialogService.display).toHaveBeenCalled();
                    });

                    describe('onAffirm()', function() {
                        it('should close the dialog and delete category', function() {
                            onAffirm();

                            expect(ConfirmDialogService.close).toHaveBeenCalled();
                            expect(CategoriesService.deleteCategory).toHaveBeenCalled();
                        });

                        describe('when delete is successful', function() {
                            it('should show redirect back to full category list', function() {
                                onAffirm();

                                $scope.$apply(function() {
                                    CategoriesService.deleteCategory.deferred.resolve();
                                });

                                expect($location.path).toHaveBeenCalledWith('/categories');
                            });
                        });

                        describe('when delete fails', function() {
                            it('should display an error dialog', function() {
                                onAffirm();

                                ConfirmDialogService.display.calls.reset();

                                $scope.$apply(function() {
                                    CategoriesService.deleteCategory.deferred.reject('Error message');
                                });

                                expect(ConfirmDialogService.display).toHaveBeenCalled();
                                expect(ConfirmDialogService.display.calls.mostRecent().args[0].prompt).toBe('There was a problem deleting the Category. Error message.');
                            });
                        });
                    });

                    describe('onCancel()', function() {
                        it('should close the dialog without deleting or changing views', function() {
                            onCancel();

                            expect(ConfirmDialogService.close).toHaveBeenCalled();
                            expect(CategoriesService.deleteCategory).not.toHaveBeenCalled();
                        });
                    });
                });
            });
        });
    });
}());