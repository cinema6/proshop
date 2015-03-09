define(['angular','./mixins/paginatedListController'], function(angular, PaginatedListCtrl) {
    'use strict';

    return angular.module('c6.proshop.customers',[])
        .controller('CustomersController', ['$scope','$log','$location','Cinema6Service','scopePromise','$injector',
        function                           ( $scope , $log , $location , Cinema6Service , scopePromise , $injector ) {
            var self = this;

            $log = $log.context('CustomersCtrl');
            $log.info('instantiated');

            self.addNew = function() {
                $location.path('/customer/new');
            };

            $scope.endpoint = 'customers';

            $scope.tableHeaders = [
                {label:'Name',value:'name',sortable:true},
                {label:'Adtech ID',value:'adtechId',sortable:false},
                {label:'Status',value:'status',sortable:false},
                {label:'Last Updated',value:'lastUpdated',sortable:true}
            ];

            $scope.sort = {
                column: 'name',
                descending: false
            };

            $injector.invoke(PaginatedListCtrl, self, {
                $scope: $scope,
                scopePromise: scopePromise,
                Cinema6Service: Cinema6Service
            });
        }])
        .controller('CustomerController', ['$scope','$log','ConfirmDialogService','$location',
                                           '$routeParams','$q','Cinema6Service',
        function                          ( $scope , $log , ConfirmDialogService , $location ,
                                            $routeParams , $q , Cinema6Service ) {
            var self = this;

            $log = $log.context('CustomerCtrl');
            $log.info('instantiated');

            function initView() {
                var promiseArray = [Cinema6Service.getAll('advertisers')];

                self.loading = true;

                if ($routeParams.id) {
                    promiseArray.push(Cinema6Service.get('customers', $routeParams.id));
                }

                $q.all(promiseArray)
                    .then(function(promises) {
                        var advertisers = promises[0],
                            customer = promises[1] || {
                                advertisers: [],
                                status: 'active'
                            };

                        self.advertisers = advertisers.data;
                        self.customer = customer;
                    })
                    .finally(function() {
                        self.loading = false;
                    });
            }

            self.addAdvertiser = function(advertiser) {
                var advertisers = self.customer.advertisers;

                if (advertisers.indexOf(advertiser) === -1) {
                    advertisers.push(advertiser);
                }
            };

            self.removeAdvertiser = function(index) {
                self.customer.advertisers.splice(index, 1);
            };

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

                cus.advertisers = customer.advertisers.map(function(advertiser) {
                    return advertiser.id;
                });

                if (customer.id) {
                    Cinema6Service.put('customers', customer.id, cus)
                        .then(handleSuccess, handleError);
                } else {
                    Cinema6Service.post('customers', cus)
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
                        Cinema6Service.delete('customers', self.customer.id)
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
        }]);
});