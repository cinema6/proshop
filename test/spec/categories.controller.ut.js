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
                Cinema6Service,
                mockCategories;

            beforeEach(function() {
                module(proshop.name);

                Cinema6Service = {
                    getAll: jasmine.createSpy('Cinema6Service.get()')
                };

                inject(function($injector) {
                    $rootScope = $injector.get('$rootScope');
                    $controller = $injector.get('$controller');
                    $location = $injector.get('$location');
                    $log = $injector.get('$log');
                    $q = $injector.get('$q');
                });

                Cinema6Service.getAll.deferred = $q.defer();
                Cinema6Service.getAll.and.returnValue(Cinema6Service.getAll.deferred.promise);

                $log.context = function() { return $log; }

                $scope = $rootScope.$new();

                CategoriesCtrl = $controller('CategoriesController', {
                    $log: $log,
                    $scope: $scope,
                    Cinema6Service: Cinema6Service
                });
            });

            describe('initialization', function() {
                it('should exist', function() {
                    expect(CategoriesCtrl).toBeDefined();
                });

                it('should load all advertisers', function() {
                    expect(Cinema6Service.getAll).toHaveBeenCalled();
                });
            });

            describe('methods', function() {
                describe('addNew()', function() {
                    it('should redirect to /category/new', function() {
                        spyOn($location, 'path');

                        CategoriesCtrl.addNew();

                        expect($location.path).toHaveBeenCalledWith('/category/new');
                    });
                });
            });
        });
    });
}());