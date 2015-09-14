(function() {
    'use strict';

    define(['app'], function(proshop) {
        describe('PoliciesController', function() {
            var $rootScope,
                $scope,
                $controller,
                $log,
                $q,
                $location,
                PoliciesCtrl,
                Cinema6Service;

            beforeEach(function() {
                module(proshop.name);

                Cinema6Service = {
                    getAll: jasmine.createSpy('Cinema6Service.getAll')
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

                PoliciesCtrl = $controller('PoliciesController', {
                    $log: $log,
                    $scope: $scope,
                    Cinema6Service: Cinema6Service
                });
            });

            describe('initialization', function() {
                it('should exist', function() {
                    expect(PoliciesCtrl).toBeDefined();
                });

                it('should load all customers', function() {
                    expect(Cinema6Service.getAll).toHaveBeenCalledWith('policies', jasmine.any(Object));
                });
            });

            describe('methods', function() {
                describe('addNew()', function() {
                    it('should redirect to /customer/new', function() {
                        spyOn($location, 'path');

                        PoliciesCtrl.addNew();

                        expect($location.path).toHaveBeenCalledWith('/policy/new');
                    });
                });
            });
        });
    });
}());