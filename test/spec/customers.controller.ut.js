(function() {
    'use strict';

    define(['app'], function(proshop) {
        describe('CustomersController', function() {
            var $rootScope,
                $scope,
                $controller,
                $log,
                $q,
                $location,
                CustomersCtrl,
                CustomersService,
                mockCustomers;

            beforeEach(function() {
                module(proshop.name);

                CustomersService = {
                    getCustomers: jasmine.createSpy('CustomersService.getCustomers')
                };

                /* jsHint quotmark:false */
                mockCustomers = [
                    {
                        "id": "cus-111",
                        "name": "Ybrant",
                        "adtechId": "12234354",
                        "created": "2014-06-13T19:28:39.408Z",
                        "lastUpdated": "2014-06-13T19:28:39.408Z",
                        "status": "active",
                        "advertisers": [
                            "a-111"
                        ]
                    },
                    {
                        "id": "cus-112",
                        "name": "Carat USA",
                        "adtechId": "28746456",
                        "created": "2014-06-13T19:28:39.408Z",
                        "lastUpdated": "2014-06-13T19:28:39.408Z",
                        "status": "active",
                        "advertisers": [
                            "a-112",
                            "a-113"
                        ]
                    },
                    {
                        "id": "cus-113",
                        "name": "Live Nation",
                        "adtechId": "9874587676",
                        "created": "2014-06-13T19:28:39.408Z",
                        "lastUpdated": "2014-06-13T19:28:39.408Z",
                        "status": "active",
                        "advertisers": []
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

                CustomersService.getCustomers.deferred = $q.defer();
                CustomersService.getCustomers.and.returnValue(CustomersService.getCustomers.deferred.promise);

                $log.context = function() { return $log; }

                $scope = $rootScope.$new();

                CustomersCtrl = $controller('CustomersController', {
                    $log: $log,
                    $scope: $scope,
                    CustomersService: CustomersService
                });
            });

            describe('initialization', function() {
                it('should exist', function() {
                    expect(CustomersCtrl).toBeDefined();
                });

                it('should load all customers', function() {
                    expect(CustomersService.getCustomers).toHaveBeenCalled();
                });
            });

            describe('properties', function() {
                describe('loading', function() {
                    it('should be true on initialization', function() {
                        expect(CustomersCtrl.loading).toBe(true);
                    });

                    it('should be false after all data promises resolve', function() {
                        $scope.$apply(function() {
                            CustomersService.getCustomers.deferred.resolve(angular.copy(mockCustomers));
                        });

                        expect(CustomersCtrl.loading).toBe(false);
                    });

                    it('should be false even if there are errors loading data', function() {
                        $scope.$apply(function() {
                            CustomersService.getCustomers.deferred.reject();
                        });

                        expect(CustomersCtrl.loading).toBe(false);
                    });
                });
            });

            describe('methods', function() {
                describe('filterData(query)', function() {
                    it('should match case-insensitively against name, domain, and org name', function() {
                        $scope.$apply(function() {
                            CustomersService.getCustomers.deferred.resolve(angular.copy(mockCustomers));
                        });

                        expect(CustomersCtrl.customers.length).toBe(3);

                        CustomersCtrl.filterData('Y'); // customer 1's name only
                        expect(CustomersCtrl.customers.length).toBe(1);
                        expect(CustomersCtrl.customers[0].id).toBe('cus-111');

                        CustomersCtrl.filterData('v'); // customer 3's name only
                        expect(CustomersCtrl.customers.length).toBe(1);
                        expect(CustomersCtrl.customers[0].id).toBe('cus-113');

                        CustomersCtrl.filterData('456'); // customer 2's adtechID only
                        expect(CustomersCtrl.customers.length).toBe(1);
                        expect(CustomersCtrl.customers[0].id).toBe('cus-112');

                        CustomersCtrl.filterData('n'); // customer 1 and 3 name only
                        expect(CustomersCtrl.customers.length).toBe(2);

                        CustomersCtrl.filterData('xxx');
                        expect(CustomersCtrl.customers.length).toBe(0);

                        CustomersCtrl.filterData('');
                        expect(CustomersCtrl.customers.length).toBe(3);
                    });
                });

                describe('addNew()', function() {
                    it('should redirect to /customer/new', function() {
                        spyOn($location, 'path');

                        CustomersCtrl.addNew();

                        expect($location.path).toHaveBeenCalledWith('/customer/new');
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