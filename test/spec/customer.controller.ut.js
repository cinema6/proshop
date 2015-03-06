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
                ConfirmDialogService,
                Cinema6Service,
                mockCustomer,
                mockAdvertisers;

            function compileCtrl(id) {
                $routeParams = { id: id };

                $scope = $rootScope.$new();

                CustomerCtrl = $controller('CustomerController', {
                    $log: $log,
                    $scope: $scope,
                    $routeParams: $routeParams,
                    ConfirmDialogService: ConfirmDialogService,
                    Cinema6Service: Cinema6Service
                });
            }

            beforeEach(function() {
                module(proshop.name);

                ConfirmDialogService = {
                    display: jasmine.createSpy('ConfirmDialogService.display()'),
                    close: jasmine.createSpy('ConfirmDialogService.close()')
                };

                Cinema6Service = {
                    getAll: jasmine.createSpy('Cinema6Service.getAll'),
                    get: jasmine.createSpy('Cinema6Service.get'),
                    put: jasmine.createSpy('Cinema6Service.put'),
                    post: jasmine.createSpy('Cinema6Service.post'),
                    delete: jasmine.createSpy('Cinema6Service.delete')
                }

                /* jshint quotmark:false */
                // the 'advertisers' property has been decorated.
                // In the real app this takes place in the CustomerAdapter
                mockCustomer = {
                    "id": "cus-111",
                    "name": "Ybrant",
                    "adtechId": "12234354",
                    "created": "2014-06-13T19:28:39.408Z",
                    "lastUpdated": "2014-06-13T19:28:39.408Z",
                    "status": "active",
                    "advertisers": [
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
                        }
                    ]
                };

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
                };
                /* jshint quotmark:single */

                inject(function($injector) {
                    $rootScope = $injector.get('$rootScope');
                    $controller = $injector.get('$controller');
                    $location = $injector.get('$location');
                    $log = $injector.get('$log');
                    $q = $injector.get('$q');

                    spyOn($location, 'path');
                    $log.context = function(){ return $log; }

                    Cinema6Service.getAll.deferred = $q.defer();
                    Cinema6Service.getAll.and.returnValue(Cinema6Service.getAll.deferred.promise);

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
                        compileCtrl('cus-111');
                    });

                    it('should exist', function() {
                        expect(CustomerCtrl).toBeDefined();
                    });

                    it('should load the customer and all advertisers', function() {
                        expect(Cinema6Service.get).toHaveBeenCalledWith('customers','cus-111');
                        expect(Cinema6Service.getAll).toHaveBeenCalledWith('advertisers');
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
                        expect(Cinema6Service.get).not.toHaveBeenCalled();
                    });

                    it('should load all advertisers', function() {
                        expect(Cinema6Service.getAll).toHaveBeenCalledWith('advertisers');
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
                                Cinema6Service.getAll.deferred.resolve(mockAdvertisers);
                            });

                            expect(CustomerCtrl.loading).toBe(false);
                        });

                        it('should be false even if there are errors loading data', function() {
                            $scope.$apply(function() {
                                Cinema6Service.getAll.deferred.reject();
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
                                Cinema6Service.get.deferred.resolve(angular.copy(mockCustomer));
                                Cinema6Service.getAll.deferred.resolve(mockAdvertisers);
                            });

                            expect(CustomerCtrl.loading).toBe(false);
                        });

                        it('should be false even if there are errors loading data', function() {
                            $scope.$apply(function() {
                                Cinema6Service.get.deferred.reject();
                                Cinema6Service.getAll.deferred.reject();
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
                            Cinema6Service.getAll.deferred.resolve(mockAdvertisers);
                        });

                        expect(CustomerCtrl.customer.advertisers.length).toBe(0);

                        CustomerCtrl.addAdvertiser(mockAdvertisers.data[0]);
                        CustomerCtrl.addAdvertiser(mockAdvertisers.data[1]);
                        CustomerCtrl.addAdvertiser(mockAdvertisers.data[2]);

                        expect(CustomerCtrl.customer.advertisers.length).toBe(3);
                        expect(CustomerCtrl.customer.advertisers[0]).toEqual(mockAdvertisers.data[0]);
                        expect(CustomerCtrl.customer.advertisers[1]).toEqual(mockAdvertisers.data[1]);
                        expect(CustomerCtrl.customer.advertisers[2]).toEqual(mockAdvertisers.data[2]);
                    });
                });

                describe('removeAdvertiser(index)', function() {
                    it('should remove the advertiser', function() {
                        compileCtrl('cus-111');

                        $scope.$apply(function() {
                            Cinema6Service.get.deferred.resolve(angular.copy(mockCustomer));
                            Cinema6Service.getAll.deferred.resolve(mockAdvertisers);
                        });

                        expect(CustomerCtrl.customer.advertisers).toEqual([mockAdvertisers.data[0]]);
                        expect(CustomerCtrl.customer.advertisers.length).toBe(1);

                        CustomerCtrl.removeAdvertiser(0);

                        expect(CustomerCtrl.customer.advertisers.length).toBe(0);

                        CustomerCtrl.customer.advertisers = angular.copy(mockAdvertisers.data);

                        expect(CustomerCtrl.customer.advertisers.length).toBe(3);

                        CustomerCtrl.removeAdvertiser(1);

                        expect(CustomerCtrl.customer.advertisers.length).toBe(2);
                        expect(CustomerCtrl.customer.advertisers[0]).toEqual(mockAdvertisers.data[0]);
                        expect(CustomerCtrl.customer.advertisers[1]).toEqual(mockAdvertisers.data[2]);
                    });
                });

                describe('save(customer)', function() {
                    describe('when /new', function() {
                        beforeEach(function() {
                            compileCtrl();

                            $scope.$apply(function() {
                                Cinema6Service.getAll.deferred.resolve(mockAdvertisers);
                            });

                            CustomerCtrl.customer.name = 'New Customer';
                            CustomerCtrl.customer.status = 'active';
                        });

                        it('should POST the customer', function() {
                            CustomerCtrl.save(CustomerCtrl.customer);

                            expect(Cinema6Service.post).toHaveBeenCalledWith('customers', {
                                name: 'New Customer',
                                status: 'active',
                                advertisers: []
                            });

                            CustomerCtrl.customer.advertisers = [mockAdvertisers.data[0], mockAdvertisers.data[2]];

                            CustomerCtrl.save(CustomerCtrl.customer);

                            expect(Cinema6Service.post).toHaveBeenCalledWith('customers', {
                                name: 'New Customer',
                                status: 'active',
                                advertisers: ['a-111', 'a-113']
                            });
                        });

                        it('should return to /customers on successful save', function() {
                            CustomerCtrl.save(CustomerCtrl.customer);

                            $scope.$apply(function() {
                                Cinema6Service.post.deferred.resolve(CustomerCtrl.customer);
                            });

                            expect($location.path).toHaveBeenCalledWith('/customers');
                        });

                        it('should display an error dialog on failure', function() {
                            CustomerCtrl.save(CustomerCtrl.customer);

                            $scope.$apply(function() {
                                Cinema6Service.post.deferred.reject('Error message');
                            });

                            expect(ConfirmDialogService.display).toHaveBeenCalled();
                            expect(ConfirmDialogService.display.calls.mostRecent().args[0].prompt).toBe('There was a problem saving the Customer. Error message.');
                        });
                    });

                    describe('when /:id', function() {
                        beforeEach(function() {
                            compileCtrl('cus-111');

                            $scope.$apply(function() {
                                Cinema6Service.get.deferred.resolve(mockCustomer);
                                Cinema6Service.getAll.deferred.resolve(mockAdvertisers);
                            });
                        });

                        it('should PUT the customer', function() {
                            CustomerCtrl.save(CustomerCtrl.customer);

                            expect(Cinema6Service.put).toHaveBeenCalledWith('customers', 'cus-111', {
                                name: 'Ybrant',
                                status: 'active',
                                advertisers: ['a-111']
                            });

                            CustomerCtrl.customer.name = 'DashBid';
                            CustomerCtrl.customer.status = 'inactive';
                            CustomerCtrl.customer.advertisers = [mockAdvertisers.data[0], mockAdvertisers.data[2]];

                            CustomerCtrl.save(CustomerCtrl.customer);

                            expect(Cinema6Service.put).toHaveBeenCalledWith('customers', 'cus-111', {
                                name: 'DashBid',
                                status: 'inactive',
                                advertisers: ['a-111', 'a-113']
                            });
                        });

                        it('should return to /customers on successful save', function() {
                            CustomerCtrl.save(CustomerCtrl.customer);

                            $scope.$apply(function() {
                                Cinema6Service.put.deferred.resolve(CustomerCtrl.customer);
                            });

                            expect($location.path).toHaveBeenCalledWith('/customers');
                        });

                        it('should display an error dialog on failure', function() {
                            CustomerCtrl.save(CustomerCtrl.customer);

                            $scope.$apply(function() {
                                Cinema6Service.put.deferred.reject('Error message');
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
                            Cinema6Service.get.deferred.resolve(mockCustomer);
                            Cinema6Service.getAll.deferred.resolve(mockAdvertisers);
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
                            expect(Cinema6Service.delete).toHaveBeenCalled();
                        });

                        describe('when delete is successful', function() {
                            it('should show redirect back to full customer list', function() {
                                onAffirm();

                                $scope.$apply(function() {
                                    Cinema6Service.delete.deferred.resolve();
                                });

                                expect($location.path).toHaveBeenCalledWith('/customers');
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
                                expect(ConfirmDialogService.display.calls.mostRecent().args[0].prompt).toBe('There was a problem deleting the Customer. Error message.');
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
            });
        });
    });
}());