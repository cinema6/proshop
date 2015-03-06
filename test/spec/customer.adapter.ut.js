(function() {
    'use strict';

    define(['app'], function(proshop) {
        var copy = angular.copy;

        describe('CustomerAdapter', function() {
            var $rootScope,
                $httpBackend,
                $q,
                Cinema6Service,
                CustomerAdapter,
                adapter,
                c6UrlMaker,
                successSpy,
                failureSpy;

            var mockCustomer,
                mockCustomers,
                mockAdvertisers;

            beforeEach(function() {
                /* jsHint quotmark:false */
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

                module('c6.ui', function($provide) {
                    $provide.provider('c6UrlMaker', function(){
                        this.location = jasmine.createSpy('urlMaker.location');
                        this.makeUrl = jasmine.createSpy('urlMaker.makeUrl');
                        this.$get = function(){
                            return jasmine.createSpy('urlMaker.get');
                        };
                    });
                });

                module(proshop.name);

                inject(function($injector) {
                    $rootScope = $injector.get('$rootScope');
                    $httpBackend = $injector.get('$httpBackend');
                    $q = $injector.get('$q');

                    Cinema6Service = $injector.get('Cinema6Service');
                    Cinema6Service.getAll.deferred = $q.defer();
                    spyOn(Cinema6Service, 'getAll').and.callFake(function(endpoint, params) {
                        return Cinema6Service.getAll.deferred.promise;
                    });

                    c6UrlMaker = $injector.get('c6UrlMaker');
                    c6UrlMaker.and.callFake(function(path, base) {
                        return '/' + base + '/' + path;
                    });

                    CustomerAdapter = $injector.get('CustomerAdapter');

                    adapter = $injector.instantiate(CustomerAdapter);
                });
            });

            describe('initialization', function() {
                it('should exist', function() {
                    expect(adapter).toEqual(jasmine.any(Object));
                });
            });

            describe('methods', function() {
                describe('get(id)', function() {
                    beforeEach(function(){
                        successSpy = jasmine.createSpy('get().success');
                        failureSpy = jasmine.createSpy('get().failure');
                    });

                    it('will decorate the customer with advertiser objects and resolve promise if successfull',function(){
                        var decoratedCustomer = copy(mockCustomer);
                        decoratedCustomer.advertisers = copy([mockAdvertisers.data[0]]);
                        mockAdvertisers.data = [mockAdvertisers.data[0]];

                        $httpBackend.expectGET('/api/account/customer/cus-111')
                            .respond(200,mockCustomer);
                        adapter.get('cus-111').then(successSpy,failureSpy);
                        Cinema6Service.getAll.deferred.resolve(mockAdvertisers)
                        $httpBackend.flush();

                        expect(Cinema6Service.getAll).toHaveBeenCalledWith('advertisers', {ids: 'a-111'});
                        expect(successSpy).toHaveBeenCalledWith(decoratedCustomer);
                        expect(failureSpy).not.toHaveBeenCalled();
                    });

                    it('will reject promise if not successful',function(){
                        $httpBackend.expectGET('/api/account/customer/cus-111')
                            .respond(404,'Unable to find customers.');
                        adapter.get('cus-111').then(successSpy,failureSpy);
                        $httpBackend.flush();
                        expect(successSpy).not.toHaveBeenCalled();
                        expect(failureSpy).toHaveBeenCalledWith('Unable to find customers.');
                    });

                    it('will reject promise if decoration call is not successful',function(){
                        $httpBackend.expectGET('/api/account/customer/cus-111')
                            .respond(200,mockCustomer);
                        adapter.get('cus-111').then(successSpy,failureSpy);
                        Cinema6Service.getAll.deferred.reject();
                        $httpBackend.flush();
                        expect(successSpy).not.toHaveBeenCalled();
                        expect(failureSpy).toHaveBeenCalledWith('Unable to complete request');
                    });
                });

                describe('getAll(params)', function() {
                    beforeEach(function(){
                        successSpy = jasmine.createSpy('getAll().success');
                        failureSpy = jasmine.createSpy('getAll.failure');
                    });

                    it('will accept empty params and will decorate each customer with advertiser objects', function() {
                        var decoratedCustomers = copy(mockCustomers);

                        decoratedCustomers[0].advertisers = [copy(mockAdvertisers.data[0])];
                        decoratedCustomers[1].advertisers = [copy(mockAdvertisers.data[1]), copy(mockAdvertisers.data[2])];
                        decoratedCustomers[2].advertisers = [];

                        $httpBackend.expectGET('/api/account/customers')
                            .respond(200,mockCustomers,{'Content-Range': 'items 1-19/19'});
                        adapter.getAll().then(successSpy,failureSpy);
                        Cinema6Service.getAll.deferred.resolve(mockAdvertisers);
                        $httpBackend.flush();

                        expect(Cinema6Service.getAll).toHaveBeenCalledWith('advertisers', {ids: 'a-111,a-112,a-113'});
                        expect(successSpy).toHaveBeenCalledWith(jasmine.objectContaining({
                            data: decoratedCustomers,
                            meta: {
                                items: {
                                    start: 1,
                                    end: 19,
                                    total: 19
                                }
                            }
                        }));

                        expect(failureSpy).not.toHaveBeenCalled();
                    });

                    it('will decorate the customers with advertisers and resolve promise if successfull',function(){
                        var decoratedCustomers = copy(mockCustomers);

                        decoratedCustomers[0].advertisers = [copy(mockAdvertisers.data[0])];
                        decoratedCustomers[1].advertisers = [copy(mockAdvertisers.data[1]), copy(mockAdvertisers.data[2])];
                        decoratedCustomers[2].advertisers = [];

                        $httpBackend.expectGET('/api/account/customers?ids=cus-1,cus-2,cus-3&limit=3')
                            .respond(200,mockCustomers,{'Content-Range': 'items 1-19/19'});
                        adapter.getAll({ids: 'cus-1,cus-2,cus-3', limit: 3}).then(successSpy,failureSpy);
                        Cinema6Service.getAll.deferred.resolve(mockAdvertisers);
                        $httpBackend.flush();

                        expect(Cinema6Service.getAll).toHaveBeenCalledWith('advertisers', {ids: 'a-111,a-112,a-113'});
                        expect(successSpy).toHaveBeenCalledWith(jasmine.objectContaining({
                            data: decoratedCustomers,
                            meta: {
                                items: {
                                    start: 1,
                                    end: 19,
                                    total: 19
                                }
                            }
                        }));
                        expect(failureSpy).not.toHaveBeenCalled();
                    });

                    it('will reject promise if not successful',function(){
                        $httpBackend.expectGET('/api/account/customers?ids=cus-1,cus-2,cus-3')
                            .respond(404,'Unable to find customers.');
                        adapter.getAll({ids: 'cus-1,cus-2,cus-3'}).then(successSpy,failureSpy);
                        $httpBackend.flush();
                        expect(successSpy).not.toHaveBeenCalled();
                        expect(failureSpy).toHaveBeenCalledWith('Unable to find customers.');
                    });

                    it('will reject promise if decoration call is not successful',function(){
                        $httpBackend.expectGET('/api/account/customers?ids=cus-1,cus-2,cus-3')
                            .respond(200,mockCustomers,{'Content-Range': 'items 1-19/19'});
                        adapter.getAll({ids: 'cus-1,cus-2,cus-3'}).then(successSpy,failureSpy);
                        Cinema6Service.getAll.deferred.reject();
                        $httpBackend.flush();
                        expect(successSpy).not.toHaveBeenCalled();
                        expect(failureSpy).toHaveBeenCalledWith('Unable to complete request');
                    });
                });

                describe('put(id, model)', function() {
                    beforeEach(function(){
                        successSpy = jasmine.createSpy('put.success');
                        failureSpy = jasmine.createSpy('put.failure');
                    });

                    it('will resolve promise if successfull',function(){
                        $httpBackend.expectPUT('/api/account/customer/cus-111')
                            .respond(200,mockCustomer);
                        adapter.put(mockCustomer.id, mockCustomer).then(successSpy,failureSpy);
                        $httpBackend.flush();
                        expect(successSpy).toHaveBeenCalledWith(mockCustomer);
                        expect(failureSpy).not.toHaveBeenCalled();
                    });

                    it('will reject promise if not successful',function(){
                        $httpBackend.expectPUT('/api/account/customer/cus-111')
                            .respond(404,'Unable to update customer.');
                        adapter.put(mockCustomer.id, mockCustomer).then(successSpy,failureSpy);
                        $httpBackend.flush();
                        expect(successSpy).not.toHaveBeenCalled();
                        expect(failureSpy).toHaveBeenCalledWith('Unable to update customer.');
                    });
                });

                describe('post(model)', function() {
                    beforeEach(function(){
                        successSpy = jasmine.createSpy('post.success');
                        failureSpy = jasmine.createSpy('post.failure');
                    });

                    it('will resolve promise if successfull',function(){
                        $httpBackend.expectPOST('/api/account/customer')
                            .respond(200,mockCustomer);
                        adapter.post(mockCustomer).then(successSpy,failureSpy);
                        $httpBackend.flush();
                        expect(successSpy).toHaveBeenCalledWith(mockCustomer);
                        expect(failureSpy).not.toHaveBeenCalled();
                    });

                    it('will reject promise if not successful',function(){
                        $httpBackend.expectPOST('/api/account/customer')
                            .respond(404,'Unable to create customer.');
                        adapter.post(mockCustomer).then(successSpy,failureSpy);
                        $httpBackend.flush();
                        expect(successSpy).not.toHaveBeenCalled();
                        expect(failureSpy).toHaveBeenCalledWith('Unable to create customer.');
                    });
                });

                describe('delete(id)', function() {
                    beforeEach(function(){
                        successSpy = jasmine.createSpy('delete.success');
                        failureSpy = jasmine.createSpy('delete.failure');
                    });

                    it('will resolve promise if successfull',function(){
                        $httpBackend.expectDELETE('/api/account/customer/cus-111')
                            .respond(204,'');
                        adapter.delete(mockCustomer.id).then(successSpy,failureSpy);
                        $httpBackend.flush();
                        expect(successSpy).toHaveBeenCalled();
                        expect(failureSpy).not.toHaveBeenCalled();
                    });

                    it('will reject promise if not successful',function(){
                        $httpBackend.expectDELETE('/api/account/customer/cus-111')
                            .respond(401,'Unauthorized.');
                        adapter.delete(mockCustomer.id).then(successSpy,failureSpy);
                        $httpBackend.flush();
                        expect(successSpy).not.toHaveBeenCalled();
                        expect(failureSpy).toHaveBeenCalledWith('Unauthorized.');
                    });
                });
            });
        });
    });
}());