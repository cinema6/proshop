define(['angular'], function(angular) {
    'use strict';

    return angular.module('c6.proshop.customers',[])
        .controller('CustomersController', ['$scope','$log','$location','CustomersService',
        function                           ( $scope , $log , $location , CustomersService ) {
            var self = this,
                _data = {};

            $log = $log.context('CustomersCtrl');
            $log.info('instantiated');

            function initView() {
                self.loading = true;

                CustomersService.getCustomers()
                    .then(function(customers) {
                        self.customers = customers;
                        _data.customers = customers;
                    })
                    .finally(function() {
                        self.loading = false;
                    });
            }

            self.query = null;
            self.page = 1;
            self.limit = 50;
            self.limits = [5,10,50,100];
            Object.defineProperties(self, {
                total: {
                    get: function() {
                        return self.customers && Math.ceil(self.customers.length / self.limit);
                    }
                }
            });

            self.addNew = function() {
                $location.path('/customer/new');
            };

            self.filterData = function(query) {
                var _query = query.toLowerCase();

                self.customers = _data.customers.filter(function(customer) {
                    return customer.name.toLowerCase().indexOf(_query) >= 0 ||
                        customer.adtechId.indexOf(_query) >= 0;
                });

                self.page = 1;
            };

            $scope.tableHeaders = [
                {label:'Name',value:'name'},
                {label:'Adtech ID',value:'adtechId'},
                {label:'Status',value:'status'},
                {label:'Last Updated',value:'lastUpdated'}
            ];

            $scope.sort = {
                column: 'name',
                descending: false
            };

            $scope.doSort = function(column) {
                var sort = $scope.sort;
                if (sort.column === column) {
                    sort.descending = !sort.descending;
                } else {
                    sort.column = column;
                    sort.descending = false;
                }
            };

            initView();
        }])
        .controller('CustomerController', ['$scope','$log','ConfirmDialogService','$location','CustomersService','$routeParams',
        function                          ( $scope , $log , ConfirmDialogService , $location , CustomersService , $routeParams ) {
            var self = this;

            $log = $log.context('CustomerCtrl');
            $log.info('instantiated');

            function initView() {
                self.loading = true;

                if ($routeParams.id) {
                    CustomersService.getCustomer($routeParams.id)
                        .then(function(customer) {
                            self.customer = customer;
                        })
                        .finally(function() {
                            self.loading = false;
                        });
                } else {
                    self.loading = false;
                    self.customer = {
                        status: 'active',
                    };
                }
            }

            self.save = function(customer) {
                var cus = {};

                function handleError(err) {
                    $log.error(err);
                    ConfirmDialogService.display({
                        prompt: 'There was a problem saving the Customer. ' + err + '.',
                        affirm: 'Close',
                        onAffirm: function() {
                            ConfirmDialogService.close();
                        }
                    });
                }

                function handleSuccess(customer) {
                    $log.info('saved Customer: ', customer);
                    $scope.message = 'Successfully saved Customer: ' + customer.name;
                    $location.path('/customers');
                }

                ['name','status'].forEach(function(prop) {
                    cus[prop] = customer[prop];
                });

                if (customer.id) {
                    CustomersService.putCustomer(customer.id, cus)
                        .then(handleSuccess, handleError);
                } else {
                    CustomersService.postCustomer(a)
                        .then(handleSuccess, handleError);
                }
            };

            self.delete = function() {
                ConfirmDialogService.display({
                    prompt: 'Are you sure you want to delete this Customer?',
                    affirm: 'Yes',
                    cancel: 'Cancel',
                    onAffirm: function() {
                        ConfirmDialogService.close();
                        CustomersService.deleteCustomer(self.customer.id)
                            .then(function() {
                                $scope.message = 'Successfully deleted Customer: ' + self.customer.name;
                                $location.path('/customers');
                            }, function(err) {
                                $log.error(err);
                                ConfirmDialogService.display({
                                    prompt: 'There was a problem deleting the Customer. ' + err + '.',
                                    affirm: 'Close',
                                    onAffirm: function() {
                                        ConfirmDialogService.close();
                                    }
                                });
                            });
                    },
                    onCancel: function() {
                        ConfirmDialogService.close();
                    }
                });
            };

            initView();
        }])
        .service('CustomersService', ['c6UrlMaker','$http','$q','$timeout',
        function                     ( c6UrlMaker , $http , $q , $timeout ) {
            function httpWrapper(request) {
                var deferred = $q.defer(),
                    deferredTimeout = $q.defer(),
                    cancelTimeout;

                request.timeout = deferredTimeout.promise;

                $http(request)
                .success(function(data) {
                    $timeout.cancel(cancelTimeout);
                    deferred.resolve(data);
                })
                .error(function(data) {
                    if (!data) {
                        data = 'Unable to locate failed';
                    }
                    $timeout.cancel(cancelTimeout);
                    deferred.reject(data);
                });

                cancelTimeout = $timeout(function() {
                    deferredTimeout.resolve();
                    deferred.reject('Request timed out.');
                },10000);

                return deferred.promise;
            }

            this.getCustomers = function() {
                return httpWrapper({
                    method: 'GET',
                    url: c6UrlMaker('account/customers', 'api')
                });
            };

            this.getCustomer = function(id) {
                return httpWrapper({
                    method: 'GET',
                    url: c6UrlMaker('account/customer/' + id, 'api')
                });
            };

            this.putCustomer = function(id, customer) {
                return httpWrapper({
                    method: 'PUT',
                    url: c6UrlMaker('account/customer/' + id, 'api'),
                    data: customer
                });
            };

            this.postCustomer = function(customer) {
                return httpWrapper({
                    method: 'POST',
                    url: c6UrlMaker('account/customer', 'api'),
                    data: customer
                });
            };

            this.deleteCustomer = function(id) {
                return httpWrapper({
                    method: 'DELETE',
                    url: c6UrlMaker('account/customer/' + id, 'api')
                });
            };
        }]);
});