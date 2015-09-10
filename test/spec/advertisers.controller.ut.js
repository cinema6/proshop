(function() {
    'use strict';

    define(['app'], function(proshop) {
        describe('AdvertisersController', function() {
            var $rootScope,
                $scope,
                $controller,
                $log,
                $q,
                $location,
                AdvertisersCtrl,
                Cinema6Service;

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

                AdvertisersCtrl = $controller('AdvertisersController', {
                    $log: $log,
                    $scope: $scope,
                    Cinema6Service: Cinema6Service
                });
            });

            describe('initialization', function() {
                it('should exist', function() {
                    expect(AdvertisersCtrl).toBeDefined();
                });

                it('should load all advertisers', function() {
                    expect(Cinema6Service.getAll).toHaveBeenCalled();
                });
            });

            describe('methods', function() {
                describe('addNew()', function() {
                    it('should redirect to /advertiser/new', function() {
                        spyOn($location, 'path');

                        AdvertisersCtrl.addNew();

                        expect($location.path).toHaveBeenCalledWith('/advertiser/new');
                    });
                });
            });
        });
    });
}());