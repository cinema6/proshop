(function() {
    'use strict';

    define(['customers'], function(customersModule) {
        describe('CustomersService', function() {
            var $httpBackend,
                $timeout,
                CustomersService,
                successSpy,
                failureSpy,
                c6UrlMaker,
                mockCustomer,
                mockCustomers;

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

                module(customersModule.name);

                inject(function($injector) {
                    $httpBackend = $injector.get('$httpBackend');
                    $timeout = $injector.get('$timeout');
                    CustomersService = $injector.get('CustomersService');
                    c6UrlMaker = $injector.get('c6UrlMaker');
                });

                c6UrlMaker.and.callFake(function(path, base) {
                    return '/' + base + '/' + path;
                });
            });

            describe('methods', function() {
                describe('getCustomers()', function() {
                    beforeEach(function(){
                        successSpy = jasmine.createSpy('getSites.success');
                        failureSpy = jasmine.createSpy('getSites.failure');
                        spyOn($timeout,'cancel');
                    });

                    it('will resolve promise if successfull',function(){
                        $httpBackend.expectGET('/api/account/customers')
                            .respond(200,mockCustomers);
                        CustomersService.getCustomers().then(successSpy,failureSpy);
                        $httpBackend.flush();
                        expect(successSpy).toHaveBeenCalledWith(mockCustomers);
                        expect(failureSpy).not.toHaveBeenCalled();
                        expect($timeout.cancel).toHaveBeenCalled();
                    });

                    it('will reject promise if not successful',function(){
                        $httpBackend.expectGET('/api/account/customers')
                            .respond(404,'Unable to find customers.');
                        CustomersService.getCustomers().then(successSpy,failureSpy);
                        $httpBackend.flush();
                        expect(successSpy).not.toHaveBeenCalled();
                        expect(failureSpy).toHaveBeenCalledWith('Unable to find customers.');
                        expect($timeout.cancel).toHaveBeenCalled();
                    });

                    it('will reject promise if times out',function(){
                        $httpBackend.expectGET('/api/account/customers')
                            .respond(200,'');
                        CustomersService.getCustomers().then(successSpy,failureSpy);
                        $timeout.flush(60000);
                        expect(successSpy).not.toHaveBeenCalled();
                        expect(failureSpy).toHaveBeenCalledWith('Request timed out.');
                    });
                });

                describe('getCustomer(id)', function() {
                    beforeEach(function(){
                        successSpy = jasmine.createSpy('getCustomer.success');
                        failureSpy = jasmine.createSpy('getCustomer.failure');
                        spyOn($timeout,'cancel');
                    });

                    it('will resolve promise if successfull',function(){
                        $httpBackend.expectGET('/api/account/customer/cus-111')
                            .respond(200,mockCustomer);
                        CustomersService.getCustomer(mockCustomer.id).then(successSpy,failureSpy);
                        $httpBackend.flush();
                        expect(successSpy).toHaveBeenCalledWith(mockCustomer);
                        expect(failureSpy).not.toHaveBeenCalled();
                        expect($timeout.cancel).toHaveBeenCalled();
                    });

                    it('will reject promise if not successful',function(){
                        $httpBackend.expectGET('/api/account/customer/cus-111')
                            .respond(404,'Unable to find customer.');
                        CustomersService.getCustomer(mockCustomer.id).then(successSpy,failureSpy);
                        $httpBackend.flush();
                        expect(successSpy).not.toHaveBeenCalled();
                        expect(failureSpy).toHaveBeenCalledWith('Unable to find customer.');
                        expect($timeout.cancel).toHaveBeenCalled();
                    });

                    it('will reject promise if times out',function(){
                        $httpBackend.expectGET('/api/account/customer/cus-111')
                            .respond(200,'');
                        CustomersService.getCustomer(mockCustomer.id).then(successSpy,failureSpy);
                        $timeout.flush(60000);
                        expect(successSpy).not.toHaveBeenCalled();
                        expect(failureSpy).toHaveBeenCalledWith('Request timed out.');
                    });
                });

                describe('putCustomer(id, customer)', function() {
                    beforeEach(function(){
                        successSpy = jasmine.createSpy('putCustomer.success');
                        failureSpy = jasmine.createSpy('putCustomer.failure');
                        spyOn($timeout,'cancel');
                    });

                    it('will resolve promise if successfull',function(){
                        $httpBackend.expectPUT('/api/account/customer/cus-111')
                            .respond(200,mockCustomer);
                        CustomersService.putCustomer(mockCustomer.id, mockCustomer).then(successSpy,failureSpy);
                        $httpBackend.flush();
                        expect(successSpy).toHaveBeenCalledWith(mockCustomer);
                        expect(failureSpy).not.toHaveBeenCalled();
                        expect($timeout.cancel).toHaveBeenCalled();
                    });

                    it('will reject promise if not successful',function(){
                        $httpBackend.expectPUT('/api/account/customer/cus-111')
                            .respond(404,'Unable to update customer.');
                        CustomersService.putCustomer(mockCustomer.id, mockCustomer).then(successSpy,failureSpy);
                        $httpBackend.flush();
                        expect(successSpy).not.toHaveBeenCalled();
                        expect(failureSpy).toHaveBeenCalledWith('Unable to update customer.');
                        expect($timeout.cancel).toHaveBeenCalled();
                    });

                    it('will reject promise if times out',function(){
                        $httpBackend.expectPUT('/api/account/customer/cus-111')
                            .respond(200,'');
                        CustomersService.putCustomer(mockCustomer.id, mockCustomer).then(successSpy,failureSpy);
                        $timeout.flush(60000);
                        expect(successSpy).not.toHaveBeenCalled();
                        expect(failureSpy).toHaveBeenCalledWith('Request timed out.');
                    });
                });

                describe('postCustomer(customer)', function() {
                    beforeEach(function(){
                        successSpy = jasmine.createSpy('postSite.success');
                        failureSpy = jasmine.createSpy('postSite.failure');
                        spyOn($timeout,'cancel');
                    });

                    it('will resolve promise if successfull',function(){
                        $httpBackend.expectPOST('/api/account/customer')
                            .respond(200,mockCustomer);
                        CustomersService.postCustomer(mockCustomer).then(successSpy,failureSpy);
                        $httpBackend.flush();
                        expect(successSpy).toHaveBeenCalledWith(mockCustomer);
                        expect(failureSpy).not.toHaveBeenCalled();
                        expect($timeout.cancel).toHaveBeenCalled();
                    });

                    it('will reject promise if not successful',function(){
                        $httpBackend.expectPOST('/api/account/customer')
                            .respond(404,'Unable to create customer.');
                        CustomersService.postCustomer(mockCustomer).then(successSpy,failureSpy);
                        $httpBackend.flush();
                        expect(successSpy).not.toHaveBeenCalled();
                        expect(failureSpy).toHaveBeenCalledWith('Unable to create customer.');
                        expect($timeout.cancel).toHaveBeenCalled();
                    });

                    it('will reject promise if times out',function(){
                        $httpBackend.expectPOST('/api/account/customer')
                            .respond(200,'');
                        CustomersService.postCustomer(mockCustomer).then(successSpy,failureSpy);
                        $timeout.flush(60000);
                        expect(successSpy).not.toHaveBeenCalled();
                        expect(failureSpy).toHaveBeenCalledWith('Request timed out.');
                    });
                });

                describe('deleteCustomer(id)', function() {
                    beforeEach(function(){
                        successSpy = jasmine.createSpy('deleteCustomer.success');
                        failureSpy = jasmine.createSpy('deleteCustomer.failure');
                        spyOn($timeout,'cancel');
                    });

                    it('will resolve promise if successfull',function(){
                        $httpBackend.expectDELETE('/api/account/customer/cus-111')
                            .respond(204,'');
                        CustomersService.deleteCustomer(mockCustomer.id).then(successSpy,failureSpy);
                        $httpBackend.flush();
                        expect(successSpy).toHaveBeenCalled();
                        expect(failureSpy).not.toHaveBeenCalled();
                        expect($timeout.cancel).toHaveBeenCalled();
                    });

                    it('will reject promise if not successful',function(){
                        $httpBackend.expectDELETE('/api/account/customer/cus-111')
                            .respond(401,'Unauthorized.');
                        CustomersService.deleteCustomer(mockCustomer.id).then(successSpy,failureSpy);
                        $httpBackend.flush();
                        expect(successSpy).not.toHaveBeenCalled();
                        expect(failureSpy).toHaveBeenCalledWith('Unauthorized.');
                        expect($timeout.cancel).toHaveBeenCalled();
                    });

                    it('will reject promise if times out',function(){
                        $httpBackend.expectDELETE('/api/account/customer/cus-111')
                            .respond(200,'');
                        CustomersService.deleteCustomer(mockCustomer.id).then(successSpy,failureSpy);
                        $timeout.flush(60000);
                        expect(successSpy).not.toHaveBeenCalled();
                        expect(failureSpy).toHaveBeenCalledWith('Request timed out.');
                    });
                });
            });
        });
    })
}());