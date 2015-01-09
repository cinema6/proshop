(function() {
    'use strict';

    define(['app'], function(proshop) {
        describe('CategoriesController', function() {
            var $rootScope,
                $scope,
                $controller,
                $log,
                $q,
                $location,
                CategoriesCtrl,
                CategoriesService,
                mockCategories;

            beforeEach(function() {
                module(proshop.name);

                CategoriesService = {
                    getCategories: jasmine.createSpy('CategoriesService.getCategories')
                };

                /* jsHint quotmark:false */
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

                inject(function($injector) {
                    $rootScope = $injector.get('$rootScope');
                    $controller = $injector.get('$controller');
                    $location = $injector.get('$location');
                    $log = $injector.get('$log');
                    $q = $injector.get('$q');
                });

                CategoriesService.getCategories.deferred = $q.defer();
                CategoriesService.getCategories.and.returnValue(CategoriesService.getCategories.deferred.promise);

                $log.context = function() { return $log; }

                $scope = $rootScope.$new();

                CategoriesCtrl = $controller('CategoriesController', {
                    $log: $log,
                    $scope: $scope,
                    CategoriesService: CategoriesService
                });
            });

            describe('initialization', function() {
                it('should exist', function() {
                    expect(CategoriesCtrl).toBeDefined();
                });

                it('should load all categories', function() {
                    expect(CategoriesService.getCategories).toHaveBeenCalled();
                });
            });

            describe('properties', function() {
                describe('loading', function() {
                    it('should be true on initialization', function() {
                        expect(CategoriesCtrl.loading).toBe(true);
                    });

                    it('should be false after all data promises resolve', function() {
                        $scope.$apply(function() {
                            CategoriesService.getCategories.deferred.resolve(angular.copy(mockCategories));
                        });

                        expect(CategoriesCtrl.loading).toBe(false);
                    });

                    it('should be false even if there are errors loading data', function() {
                        $scope.$apply(function() {
                            CategoriesService.getCategories.deferred.reject();
                        });

                        expect(CategoriesCtrl.loading).toBe(false);
                    });
                });
            });

            describe('methods', function() {
                describe('filterData(query)', function() {
                    it('should match case-insensitively against name, domain, and org name', function() {
                        $scope.$apply(function() {
                            CategoriesService.getCategories.deferred.resolve(angular.copy(mockCategories));
                        });

                        expect(CategoriesCtrl.categories.length).toBe(3);

                        CategoriesCtrl.filterData('R'); // category 1's name only
                        expect(CategoriesCtrl.categories.length).toBe(1);
                        expect(CategoriesCtrl.categories[0].id).toBe('c-111');

                        CategoriesCtrl.filterData('_'); // category 3's label only
                        expect(CategoriesCtrl.categories.length).toBe(1);
                        expect(CategoriesCtrl.categories[0].id).toBe('c-113');

                        CategoriesCtrl.filterData('t'); // category 1 and 3 name only
                        expect(CategoriesCtrl.categories.length).toBe(2);

                        CategoriesCtrl.filterData('xxx');
                        expect(CategoriesCtrl.categories.length).toBe(0);

                        CategoriesCtrl.filterData('');
                        expect(CategoriesCtrl.categories.length).toBe(3);
                    });
                });

                describe('addNew()', function() {
                    it('should redirect to /category/new', function() {
                        spyOn($location, 'path');

                        CategoriesCtrl.addNew();

                        expect($location.path).toHaveBeenCalledWith('/category/new');
                    });
                });
            });

            describe('$scope.doSort()', function() {
                it('should sort', function() {
                    $scope.doSort('name');
                    expect($scope.sort).toEqual({column:'name',descending:false});
                    $scope.doSort('name');
                    expect($scope.sort).toEqual({column:'name',descending:true});
                    $scope.doSort('label');
                    expect($scope.sort).toEqual({column:'label',descending:false});
                    $scope.doSort('active');
                    expect($scope.sort).toEqual({column:'active',descending:false});
                });
            });
        });
    });
}());