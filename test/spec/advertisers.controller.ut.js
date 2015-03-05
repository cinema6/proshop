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

                describe('page', function() {
                    it('should query for advertisers when page changes', function() {
                        AdvertisersCtrl.page = 1;
                        AdvertisersCtrl.limit = 10;
                        $scope.$digest();

                        AdvertisersCtrl.page = 2;
                        $scope.$digest();

                        expect(Cinema6Service.getAll).toHaveBeenCalledWith('advertisers', jasmine.objectContaining({limit: 10, skip: 10}));

                        AdvertisersCtrl.page = 3;
                        $scope.$digest();

                        expect(Cinema6Service.getAll).toHaveBeenCalledWith('advertisers', jasmine.objectContaining({limit: 10, skip: 20}));
                    });
                });

                describe('limit', function() {
                    it('should query for advertiser when changed', function() {
                        AdvertisersCtrl.page = 1;
                        AdvertisersCtrl.limit = 10;
                        $scope.$digest();

                        AdvertisersCtrl.limit = 20;
                        $scope.$digest();

                        expect(Cinema6Service.getAll).toHaveBeenCalledWith('advertisers', jasmine.objectContaining({limit: 20}));

                        AdvertisersCtrl.limit = 30;
                        $scope.$digest();

                        expect(Cinema6Service.getAll).toHaveBeenCalledWith('advertisers', jasmine.objectContaining({limit: 30}));
                    });
                });
            });

            describe('methods', function() {
                describe('search(query)', function() {
                    it('should set the page to 1', function() {
                        AdvertisersCtrl.page = 2;
                        AdvertisersCtrl.search('Ybrant');
                        expect(AdvertisersCtrl.page).toBe(1);
                    });

                    it('should query for advertisers', function() {
                        AdvertisersCtrl.search('Ybrant');
                        expect(Cinema6Service.getAll).toHaveBeenCalledWith('advertisers', jasmine.objectContaining({text: 'Ybrant'}));
                    });

                    it('should remove the bound query value if page === 1', function() {
                        $scope.query = 'Ybrant';
                        AdvertisersCtrl.page = 1;
                        AdvertisersCtrl.search($scope.query);
                        expect($scope.query).toBe('');
                    });

                    it('should trigger a $digest cycle if page !== 1', function() {
                        AdvertisersCtrl.page = 2;
                        $scope.$digest();

                        $scope.query = 'Ybrant';
                        AdvertisersCtrl.search($scope.query);

                        expect($scope.query).toBe('Ybrant');
                        expect(AdvertisersCtrl.page).toBe(1);

                        $scope.$digest();
                        expect($scope.query).toBe('');
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
                it('should request sorted advertisers', function() {
                    $scope.doSort('adtechId');
                    expect($scope.sort).toEqual({column:'adtechId',descending:false});
                    expect(Cinema6Service.getAll).toHaveBeenCalledWith('advertisers', jasmine.objectContaining({sort: 'adtechId,-1'}));

                    $scope.doSort('adtechId');
                    expect($scope.sort).toEqual({column:'adtechId',descending:true});
                    expect(Cinema6Service.getAll).toHaveBeenCalledWith('advertisers', jasmine.objectContaining({sort: 'adtechId,1'}));

                    $scope.doSort('name');
                    expect($scope.sort).toEqual({column:'name',descending:false});
                    expect(Cinema6Service.getAll).toHaveBeenCalledWith('advertisers', jasmine.objectContaining({sort: 'name,-1'}));

                    $scope.doSort('active');
                    expect($scope.sort).toEqual({column:'active',descending:false});
                    expect(Cinema6Service.getAll).toHaveBeenCalledWith('advertisers', jasmine.objectContaining({sort: 'active,-1'}));
                });
            });
        });
    });
}());