(function() {
    'use strict';

    define(['app'], function(proshop) {
        describe('CustomerController', function() {
            var $rootScope,
                $scope,
                $controller,
                $q,
                $log,
                $routeParams,
                $location,
                CustomerCtrl,
                CustomersService,
                AdvertisersService,
                ConfirmDialogService,
                mockCustomer,
                mockAdvertisers;

            function compileCtrl(id) {
                $routeParams = { id: id };

                $scope = $rootScope.$new();

                CustomerCtrl = $controller('CustomerController', {
                    $log: $log,
                    $scope: $scope,
                    $routeParams: $routeParams,
                    CustomersService: CustomersService,
                    AdvertisersService: AdvertisersService,
                    ConfirmDialogService: ConfirmDialogService
                });
            }

            beforeEach(function() {
                module(proshop.name);

                ConfirmDialogService = {
                    display: jasmine.createSpy('ConfirmDialogService.display()'),
                    close: jasmine.createSpy('ConfirmDialogService.close()')
                };

                CustomersService = {
                    getCustomer: jasmine.createSpy('CustomersService.getCustomer'),
                    putCustomer: jasmine.createSpy('CustomersService.putCustomer'),
                    postCustomer: jasmine.createSpy('CustomersService.postCustomer'),
                    deleteCustomer: jasmine.createSpy('CustomersService.deleteCustomer')
                };

                AdvertisersService = {
                    getAdvertisers: jasmine.createSpy('AdvertisersService.getAdvertisers')
                };

                /* jshint quotmark:false */
                mockCustomer = {
                    "id": "cus-111",
                    "name": "Ybrant",
                    "adtechId": "12234354",
                    "created": "2014-06-13T19:28:39.408Z",
                    "lastUpdated": "2014-06-13T19:28:39.408Z",
                    "status": "active",
                    "advertisers": [
                        "a-111"
                    ]
                };

                mockAdvertisers = [
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
                ];
                /* jshint quotmark:single */

                inject(function($injector) {
                    $rootScope = $injector.get('$rootScope');
                    $controller = $injector.get('$controller');
                    $location = $injector.get('$location');
                    $log = $injector.get('$log');
                    $q = $injector.get('$q');

                    spyOn($location, 'path');
                    $log.context = function(){ return $log; }

                    CustomersService.getCustomer.deferred = $q.defer();
                    CustomersService.getCustomer.and.returnValue(CustomersService.getCustomer.deferred.promise);

                    CustomersService.putCustomer.deferred = $q.defer();
                    CustomersService.putCustomer.and.returnValue(CustomersService.putCustomer.deferred.promise);

                    CustomersService.postCustomer.deferred = $q.defer();
                    CustomersService.postCustomer.and.returnValue(CustomersService.postCustomer.deferred.promise);

                    CustomersService.deleteCustomer.deferred = $q.defer();
                    CustomersService.deleteCustomer.and.returnValue(CustomersService.deleteCustomer.deferred.promise);

                    AdvertisersService.getAdvertisers.deferred = $q.defer();
                    AdvertisersService.getAdvertisers.and.returnValue(AdvertisersService.getAdvertisers.deferred.promise);
                });
            });

            describe('initialization', function() {
                describe('when path has /:id', function() {
                    beforeEach(function() {
                        compileCtrl('cus-111');
                    });

                    it('should exist', function() {
                        expect(CustomerCtrl).toBeDefined();
                    });

                    it('should load the customer and all advertisers', function() {
                        expect(CustomersService.getCustomer).toHaveBeenCalled();
                        expect(AdvertisersService.getAdvertisers).toHaveBeenCalled();
                    });
                });

                describe('when path is /new', function() {
                    beforeEach(function() {
                        compileCtrl();
                    });

                    it('should exist', function() {
                        expect(CustomerCtrl).toBeDefined();
                    });

                    it('should not load a customer', function() {
                        expect(CustomersService.getCustomer).not.toHaveBeenCalled();
                    });

                    it('should load all advertisers', function() {
                        expect(AdvertisersService.getAdvertisers).toHaveBeenCalled();
                    });
                });
            });

            describe('properties', function() {
                describe('loading', function() {
                    describe('/new', function() {
                        beforeEach(function() {
                            compileCtrl();
                        });
                        it('should be true on initialization', function() {
                            expect(CustomerCtrl.loading).toBe(true);
                        });

                        it('should be false after all advertiser are loaded', function() {
                            $scope.$apply(function() {
                                AdvertisersService.getAdvertisers.deferred.resolve(mockAdvertisers);
                            });

                            expect(CustomerCtrl.loading).toBe(false);
                        });

                        it('should be false even if there are errors loading data', function() {
                            $scope.$apply(function() {
                                AdvertisersService.getAdvertisers.deferred.reject();
                            });

                            expect(CustomerCtrl.loading).toBe(false);
                        });
                    });

                    describe('/:id', function() {
                        beforeEach(function() {
                            compileCtrl('cus-111');
                        });

                        it('should be true on initialization', function() {
                            expect(CustomerCtrl.loading).toBe(true);
                        });

                        it('should be false after all data promises resolve', function() {
                            $scope.$apply(function() {
                                CustomersService.getCustomer.deferred.resolve(angular.copy(mockCustomer));
                                AdvertisersService.getAdvertisers.deferred.resolve(mockAdvertisers);
                            });

                            expect(CustomerCtrl.loading).toBe(false);
                        });

                        it('should be false even if there are errors loading data', function() {
                            $scope.$apply(function() {
                                CustomersService.getCustomer.deferred.reject();
                                AdvertisersService.getAdvertisers.deferred.reject();
                            });

                            expect(CustomerCtrl.loading).toBe(false);
                        });
                    });
                });
            });

            describe('methods', function() {
                describe('addAdvertiser(advertiser)', function() {
                    it('should add the advertiser', function() {
                        compileCtrl();

                        $scope.$apply(function() {
                            AdvertisersService.getAdvertisers.deferred.resolve(mockAdvertisers);
                        });

                        expect(CustomerCtrl.customer.advertisers.length).toBe(0);

                        CustomerCtrl.addAdvertiser(mockAdvertisers[0]);
                        CustomerCtrl.addAdvertiser(mockAdvertisers[1]);
                        CustomerCtrl.addAdvertiser(mockAdvertisers[2]);

                        expect(CustomerCtrl.customer.advertisers.length).toBe(3);
                        expect(CustomerCtrl.customer.advertisers[0]).toEqual(mockAdvertisers[0]);
                        expect(CustomerCtrl.customer.advertisers[1]).toEqual(mockAdvertisers[1]);
                        expect(CustomerCtrl.customer.advertisers[2]).toEqual(mockAdvertisers[2]);
                    });
                });

                describe('removeAdvertiser(index)', function() {
                    it('should remove the advertiser', function() {
                        compileCtrl('cus-111');

                        $scope.$apply(function() {
                            CustomersService.getCustomer.deferred.resolve(angular.copy(mockCustomer));
                            AdvertisersService.getAdvertisers.deferred.resolve(mockAdvertisers);
                        });

                        expect(CustomerCtrl.customer.advertisers).toEqual([mockAdvertisers[0]]);
                        expect(CustomerCtrl.customer.advertisers.length).toBe(1);

                        CustomerCtrl.removeAdvertiser(0);

                        expect(CustomerCtrl.customer.advertisers.length).toBe(0);

                        CustomerCtrl.customer.advertisers = angular.copy(mockAdvertisers);

                        expect(CustomerCtrl.customer.advertisers.length).toBe(3);

                        CustomerCtrl.removeAdvertiser(1);

                        expect(CustomerCtrl.customer.advertisers.length).toBe(2);
                        expect(CustomerCtrl.customer.advertisers[0]).toEqual(mockAdvertisers[0]);
                        expect(CustomerCtrl.customer.advertisers[1]).toEqual(mockAdvertisers[2]);
                    });
                });

                describe('save(customer)', function() {
                    describe('when /new', function() {
                        beforeEach(function() {
                            compileCtrl();

                            $scope.$apply(function() {
                                AdvertisersService.getAdvertisers.deferred.resolve(mockAdvertisers);
                            });

                            CustomerCtrl.customer.name = 'New Customer';
                            CustomerCtrl.customer.status = 'active';
                        });

                        it('should POST the customer', function() {
                            CustomerCtrl.save(CustomerCtrl.customer);

                            expect(CustomersService.postCustomer).toHaveBeenCalledWith({
                                name: 'New Customer',
                                status: 'active',
                                advertisers: []
                            });

                            CustomerCtrl.customer.advertisers = [mockAdvertisers[0], mockAdvertisers[2]];

                            CustomerCtrl.save(CustomerCtrl.customer);

                            expect(CustomersService.postCustomer).toHaveBeenCalledWith({
                                name: 'New Customer',
                                status: 'active',
                                advertisers: ['a-111', 'a-113']
                            });
                        });

                        it('should return to /customers on successful save', function() {
                            CustomerCtrl.save(CustomerCtrl.customer);

                            $scope.$apply(function() {
                                CustomersService.postCustomer.deferred.resolve(CustomerCtrl.customer);
                            });

                            expect($location.path).toHaveBeenCalledWith('/customers');
                        });

                        it('should display an error dialog on failure', function() {
                            CustomerCtrl.save(CustomerCtrl.customer);

                            $scope.$apply(function() {
                                CustomersService.postCustomer.deferred.reject('Error message');
                            });

                            expect(ConfirmDialogService.display).toHaveBeenCalled();
                            expect(ConfirmDialogService.display.calls.mostRecent().args[0].prompt).toBe('There was a problem saving the Customer. Error message.');
                        });
                    });

                    describe('when /:id', function() {
                        beforeEach(function() {
                            compileCtrl('cus-111');

                            $scope.$apply(function() {
                                CustomersService.getCustomer.deferred.resolve(mockCustomer);
                                AdvertisersService.getAdvertisers.deferred.resolve(mockAdvertisers);
                            });
                        });

                        it('should PUT the customer', function() {
                            CustomerCtrl.save(CustomerCtrl.customer);

                            expect(CustomersService.putCustomer).toHaveBeenCalledWith('cus-111', {
                                name: 'Ybrant',
                                status: 'active',
                                advertisers: ['a-111']
                            });

                            CustomerCtrl.customer.name = 'DashBid';
                            CustomerCtrl.customer.status = 'inactive';
                            CustomerCtrl.customer.advertisers = [mockAdvertisers[0], mockAdvertisers[2]];

                            CustomerCtrl.save(CustomerCtrl.customer);

                            expect(CustomersService.putCustomer).toHaveBeenCalledWith('cus-111', {
                                name: 'DashBid',
                                status: 'inactive',
                                advertisers: ['a-111', 'a-113']
                            });
                        });

                        it('should return to /customers on successful save', function() {
                            CustomerCtrl.save(CustomerCtrl.customer);

                            $scope.$apply(function() {
                                CustomersService.putCustomer.deferred.resolve(CustomerCtrl.customer);
                            });

                            expect($location.path).toHaveBeenCalledWith('/customers');
                        });

                        it('should display an error dialog on failure', function() {
                            CustomerCtrl.save(CustomerCtrl.customer);

                            $scope.$apply(function() {
                                CustomersService.putCustomer.deferred.reject('Error message');
                            });

                            expect(ConfirmDialogService.display).toHaveBeenCalled();
                            expect(ConfirmDialogService.display.calls.mostRecent().args[0].prompt).toBe('There was a problem saving the Customer. Error message.');
                        });
                    });
                });

                describe('delete(customer)', function() {
                    var onAffirm, onCancel;

                    beforeEach(function() {
                        compileCtrl('cus-111');

                        $scope.$apply(function() {
                            CustomersService.getCustomer.deferred.resolve(mockCustomer);
                            AdvertisersService.getAdvertisers.deferred.resolve(mockAdvertisers);
                        });

                        CustomerCtrl.delete();

                        onAffirm = ConfirmDialogService.display.calls.mostRecent().args[0].onAffirm;
                        onCancel = ConfirmDialogService.display.calls.mostRecent().args[0].onCancel;
                    });

                    it('should display a confirmation dialog', function() {
                        expect(ConfirmDialogService.display).toHaveBeenCalled();
                    });

                    describe('onAffirm()', function() {
                        it('should close the dialog and delete customer', function() {
                            onAffirm();

                            expect(ConfirmDialogService.close).toHaveBeenCalled();
                            expect(CustomersService.deleteCustomer).toHaveBeenCalled();
                        });

                        describe('when delete is successful', function() {
                            it('should show redirect back to full customer list', function() {
                                onAffirm();

                                $scope.$apply(function() {
                                    CustomersService.deleteCustomer.deferred.resolve();
                                });

                                expect($location.path).toHaveBeenCalledWith('/customers');
                            });
                        });

                        describe('when delete fails', function() {
                            it('should display an error dialog', function() {
                                onAffirm();

                                ConfirmDialogService.display.calls.reset();

                                $scope.$apply(function() {
                                    CustomersService.deleteCustomer.deferred.reject('Error message');
                                });

                                expect(ConfirmDialogService.display).toHaveBeenCalled();
                                expect(ConfirmDialogService.display.calls.mostRecent().args[0].prompt).toBe('There was a problem deleting the Customer. Error message.');
                            });
                        });
                    });

                    describe('onCancel()', function() {
                        it('should close the dialog without deleting or changing views', function() {
                            onCancel();

                            expect(ConfirmDialogService.close).toHaveBeenCalled();
                            expect(CustomersService.deleteCustomer).not.toHaveBeenCalled();
                        });
                    });
                });
            });
        });
    });
}());