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
                Cinema6Service,
                mockAdvertisers;

            beforeEach(function() {
                module(proshop.name);

                Cinema6Service = {
                    getAll: jasmine.createSpy('Cinema6Service.get()')
                };

                /* jsHint quotmark:false */
                mockAdvertisers = {
                    meta: {
                        items: {
                            start: 1,
                            end: 3,
                            total: 3
                        }
                    },
                    data: [
                        {
                            "id": "a-111",
                            "adtechId": "12121212",
                            "name": "Ybrant",
                            "created": "2014-06-13T19:28:39.408Z",
                            "lastUpdated": "2015-01-12T18:06:52.877Z",
                            "defaultLinks": {
                                "Facebook": "http://facebook.com",
                                "Twitter": "http://twitter.com"
                            },
                            "defaultLogos": {
                                "Main": "http://example.com/logo.jpg"
                            },
                            "status": "active"
                        },
                        {
                            "id": "a-112",
                            "adtechId": "12121213",
                            "name": "DashBid",
                            "created": "2014-06-13T19:28:39.408Z",
                            "lastUpdated": "2014-06-13T19:28:39.408Z",
                            "defaultLinks": {
                                "Facebook": "http://facebook.com",
                                "Twitter": "http://twitter.com"
                            },
                            "defaultLogos": {
                                "logo1": "http://example.com/logo.jpg"
                            },
                            "status": "active"
                        },
                        {
                            "id": "a-113",
                            "adtechId": "12121233",
                            "name": "Adap.tv",
                            "created": "2014-06-13T19:28:39.408Z",
                            "lastUpdated": "2014-06-13T19:28:39.408Z",
                            "defaultLinks": {
                                "Facebook": "http://facebook.com",
                                "Twitter": "http://twitter.com"
                            },
                            "defaultLogos": {
                                "logo1": "http://example.com/logo.jpg"
                            },
                            "status": "active"
                        }
                    ]
                }
                ;
                /* jshint quotmark:single */

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

            describe('properties', function() {
                describe('loading', function() {
                    it('should be true on initialization', function() {
                        expect(AdvertisersCtrl.loading).toBe(true);
                    });

                    it('should be false after all data promises resolve', function() {
                        $scope.$apply(function() {
                            Cinema6Service.getAll.deferred.resolve(angular.copy(mockAdvertisers));
                        });

                        expect(AdvertisersCtrl.loading).toBe(false);
                    });

                    it('should be false even if there are errors loading data', function() {
                        $scope.$apply(function() {
                            Cinema6Service.getAll.deferred.reject();
                        });

                        expect(AdvertisersCtrl.loading).toBe(false);
                    });
                });
            });

            describe('methods', function() {
                describe('filterData(query)', function() {
                    it('should match case-insensitively against name, domain, and org name', function() {
                        $scope.$apply(function() {
                            Cinema6Service.getAll.deferred.resolve(angular.copy(mockAdvertisers));
                        });

                        expect(AdvertisersCtrl.advertisers.length).toBe(3);

                        AdvertisersCtrl.filterData('Y'); // advertiser 1's name only
                        expect(AdvertisersCtrl.advertisers.length).toBe(1);
                        expect(AdvertisersCtrl.advertisers[0].id).toBe('a-111');

                        AdvertisersCtrl.filterData('.'); // advertiser 3's name only
                        expect(AdvertisersCtrl.advertisers.length).toBe(1);
                        expect(AdvertisersCtrl.advertisers[0].id).toBe('a-113');

                        AdvertisersCtrl.filterData('213'); // advertiser 2's adtechID only
                        expect(AdvertisersCtrl.advertisers.length).toBe(1);
                        expect(AdvertisersCtrl.advertisers[0].id).toBe('a-112');

                        AdvertisersCtrl.filterData('t'); // advertiser 1 and 3 name only
                        expect(AdvertisersCtrl.advertisers.length).toBe(2);

                        AdvertisersCtrl.filterData('xxx');
                        expect(AdvertisersCtrl.advertisers.length).toBe(0);

                        AdvertisersCtrl.filterData('');
                        expect(AdvertisersCtrl.advertisers.length).toBe(3);
                    });
                });

                describe('addNew()', function() {
                    it('should redirect to /advertiser/new', function() {
                        spyOn($location, 'path');

                        AdvertisersCtrl.addNew();

                        expect($location.path).toHaveBeenCalledWith('/advertiser/new');
                    });
                });
            });

            describe('$scope.doSort()', function() {
                it('should sort', function() {
                    $scope.doSort('adtechId');
                    expect($scope.sort).toEqual({column:'adtechId',descending:false});
                    $scope.doSort('adtechId');
                    expect($scope.sort).toEqual({column:'adtechId',descending:true});
                    $scope.doSort('name');
                    expect($scope.sort).toEqual({column:'name',descending:false});
                    $scope.doSort('active');
                    expect($scope.sort).toEqual({column:'active',descending:false});
                });
            });
        });
    });
}());