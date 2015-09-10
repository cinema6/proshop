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
                Cinema6Service,
                ConfirmDialogService,
                mockCategory;

            function compileCtrl(id) {
                $routeParams = { id: id };

                $scope = $rootScope.$new();

                CategoryCtrl = $controller('CategoryController', {
                    $log: $log,
                    $scope: $scope,
                    $routeParams: $routeParams,
                    Cinema6Service: Cinema6Service,
                    ConfirmDialogService: ConfirmDialogService
                });
            }

            beforeEach(function() {
                module(proshop.name);

                ConfirmDialogService = {
                    display: jasmine.createSpy('ConfirmDialogService.display()'),
                    close: jasmine.createSpy('ConfirmDialogService.close()')
                };

                Cinema6Service = {
                    get: jasmine.createSpy('Cinema6Service.get'),
                    put: jasmine.createSpy('Cinema6Service.put'),
                    post: jasmine.createSpy('Cinema6Service.post'),
                    delete: jasmine.createSpy('Cinema6Service.delete')
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

                    Cinema6Service.get.deferred = $q.defer();
                    Cinema6Service.get.and.returnValue(Cinema6Service.get.deferred.promise);

                    Cinema6Service.put.deferred = $q.defer();
                    Cinema6Service.put.and.returnValue(Cinema6Service.put.deferred.promise);

                    Cinema6Service.post.deferred = $q.defer();
                    Cinema6Service.post.and.returnValue(Cinema6Service.post.deferred.promise);

                    Cinema6Service.delete.deferred = $q.defer();
                    Cinema6Service.delete.and.returnValue(Cinema6Service.delete.deferred.promise);
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
                        expect(Cinema6Service.get).toHaveBeenCalled();
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
                        expect(Cinema6Service.get).not.toHaveBeenCalled();
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
                                Cinema6Service.get.deferred.resolve(angular.copy(mockCategory));
                            });

                            expect(CategoryCtrl.loading).toBe(false);
                        });

                        it('should be false even if there are errors loading data', function() {
                            $scope.$apply(function() {
                                Cinema6Service.get.deferred.reject();
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

                            expect(Cinema6Service.post).toHaveBeenCalledWith('categories', {
                                name: 'New Category',
                                label: 'new_category',
                                status: 'active'
                            });
                        });

                        it('should return to /sites on successful save', function() {
                            CategoryCtrl.save(CategoryCtrl.category);

                            $scope.$apply(function() {
                                Cinema6Service.post.deferred.resolve(CategoryCtrl.category);
                            });

                            expect($location.path).toHaveBeenCalledWith('/categories');
                        });

                        it('should display an error dialog on failure', function() {
                            CategoryCtrl.save(CategoryCtrl.category);

                            $scope.$apply(function() {
                                Cinema6Service.post.deferred.reject('Error message');
                            });

                            expect(ConfirmDialogService.display).toHaveBeenCalled();
                            expect(ConfirmDialogService.display.calls.mostRecent().args[0].prompt).toBe('There was a problem saving the Category. Error message.');
                        });
                    });

                    describe('when /:id', function() {
                        beforeEach(function() {
                            compileCtrl('c-111');

                            $scope.$apply(function() {
                                Cinema6Service.get.deferred.resolve(mockCategory);
                            });
                        });

                        it('should PUT the category', function() {
                            CategoryCtrl.save(CategoryCtrl.category);

                            expect(Cinema6Service.put).toHaveBeenCalledWith('categories', 'c-111', {
                                name: 'sports',
                                label: 'Sports',
                                status: 'active'
                            });

                            CategoryCtrl.category.label = 'Sports & Stuff';
                            CategoryCtrl.category.name = 'sports_and_stuff';
                            CategoryCtrl.category.status = 'inactive';

                            CategoryCtrl.save(CategoryCtrl.category);

                            expect(Cinema6Service.put).toHaveBeenCalledWith('categories', 'c-111', {
                                name: 'sports_and_stuff',
                                label: 'Sports & Stuff',
                                status: 'inactive'
                            });
                        });

                        it('should return to /sites on successful save', function() {
                            CategoryCtrl.save(CategoryCtrl.category);

                            $scope.$apply(function() {
                                Cinema6Service.put.deferred.resolve(CategoryCtrl.category);
                            });

                            expect($location.path).toHaveBeenCalledWith('/categories');
                        });

                        it('should display an error dialog on failure', function() {
                            CategoryCtrl.save(CategoryCtrl.category);

                            $scope.$apply(function() {
                                Cinema6Service.put.deferred.reject('Error message');
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
                            Cinema6Service.get.deferred.resolve(mockCategory);
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
                            expect(Cinema6Service.delete).toHaveBeenCalled();
                        });

                        describe('when delete is successful', function() {
                            it('should show redirect back to full category list', function() {
                                onAffirm();

                                $scope.$apply(function() {
                                    Cinema6Service.delete.deferred.resolve();
                                });

                                expect($location.path).toHaveBeenCalledWith('/categories');
                            });
                        });

                        describe('when delete fails', function() {
                            it('should display an error dialog', function() {
                                onAffirm();

                                ConfirmDialogService.display.calls.reset();

                                $scope.$apply(function() {
                                    Cinema6Service.delete.deferred.reject('Error message');
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
                            expect(Cinema6Service.delete).not.toHaveBeenCalled();
                        });
                    });
                });

                describe('disableLabelBinding()', function() {
                    it('should stop the binding of name to label', function() {
                        compileCtrl();

                        CategoryCtrl.category.label = 'A New Label';

                        $scope.$digest();

                        expect(CategoryCtrl.category.name).toBe('a_new_label');

                        CategoryCtrl.disableLabelBinding();

                        CategoryCtrl.category.label = 'Edit After Name Field Has Been Clicked Into';

                        $scope.$digest();

                        expect(CategoryCtrl.category.name).toBe('a_new_label');
                    });
                });
            });

            describe('$watch', function() {
                describe('label binding', function() {
                    describe('when /:id', function() {
                        it('should not bind label to name at all', function() {
                            compileCtrl('c-111');

                            $scope.$apply(function() {
                                Cinema6Service.get.deferred.resolve(mockCategory);
                            });

                            CategoryCtrl.category.label = 'Some New Label';

                            $scope.$digest();

                            expect(CategoryCtrl.category.name).toBe('sports');
                        });
                    });

                    describe('when /new', function() {
                        it('should bind the name to the label, converting to acceptable format until the name input field has been clicked into, triggering Ctrl.disableLabelBinding()', function() {
                            compileCtrl();

                            CategoryCtrl.category.label = 'A New Label';

                            $scope.$digest();

                            expect(CategoryCtrl.category.name).toBe('a_new_label');

                            CategoryCtrl.category.label = 'A Bad Label *&%$%))';

                            $scope.$digest();

                            expect(CategoryCtrl.category.name).toBe('a_bad_label');

                            CategoryCtrl.disableLabelBinding();

                            CategoryCtrl.category.label = 'Edit After Name Field Has Been Clicked Into';

                            $scope.$digest();

                            expect(CategoryCtrl.category.name).toBe('a_bad_label');
                        });
                    });
                });
            });
        });
    });
}());