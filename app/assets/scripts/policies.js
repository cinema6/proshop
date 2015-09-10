define(['angular','./mixins/paginatedListController'], function(angular, PaginatedListCtrl) {
    'use strict';

    return angular.module('c6.proshop.policies',[])
        .controller('PoliciesController', ['$scope','$log','$location','$injector','Cinema6Service','scopePromise',
        function                          ( $scope , $log , $location , $injector , Cinema6Service , scopePromise ) {
            var self = this;

            $log = $log.context('PoliciesCtrl');
            $log.info('instantiated');

            self.addNew = function() {
                $location.path('/policy/new');
            };

            $scope.endpoint = 'policies';

            $scope.tableHeaders = [
                {label:'Name',value:'name',sortable:true},
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

        .controller('PolicyController', ['$scope','$log','$location','$routeParams','Cinema6Service','ConfirmDialogService',
        function                        ( $scope , $log , $location , $routeParams , Cinema6Service , ConfirmDialogService ) {
            var self = this;

            $log = $log.context('PoliciyCtrl');
            $log.info('instantiated');

            function initView() {
                self.loading = true;

                if ($routeParams.id) {
                    Cinema6Service.get('policies', $routeParams.id)
                        .then(function(policy) {
                            self.policy = policy;
                        })
                        .finally(function() {
                            self.loading = false;
                        });
                } else {
                    self.loading = false;
                    self.policy = {
                        status: 'active',
                        name: null
                    };
                }
            }
            initView();

            self.addApplication = function(app) {
                var applications = self.policy.applications;

                if (applications.indexOf(app) === -1) {
                    applications.push(app);
                }
            };

            self.removeApplication = function(index) {
                self.policy.applications.splice(index, 1);
            };

            self.save = function(policy) {
                var _policy = {};

                function handleError(err) {
                    $log.error(err);
                    ConfirmDialogService.display({
                        prompt: 'There was a problem saving the Policy. ' + err + '.',
                        affirm: 'Close',
                        onAffirm: function() {
                            ConfirmDialogService.close();
                        }
                    });
                }

                function handleSuccess(policy) {
                    $log.info('saved Policy: ', policy);
                    $scope.message = 'Successfully saved Policy: ' + policy.name;
                    $location.path('/policies');
                }

                ['name','status'].forEach(function(prop) {
                    _policy[prop] = policy[prop];
                });

                if (policy.id) {
                    Cinema6Service.put('policies', policy.id, _policy)
                        .then(handleSuccess, handleError);
                } else {
                    Cinema6Service.post('policies', _policy)
                        .then(handleSuccess, handleError);
                }
            };

            self.delete = function() {
                ConfirmDialogService.display({
                    prompt: 'Are you sure you want to delete this Policy?',
                    affirm: 'Yes',
                    cancel: 'Cancel',
                    onAffirm: function() {
                        ConfirmDialogService.close();
                        Cinema6Service.delete('policies', self.policy.id)
                            .then(function() {
                                $scope.message = 'Successfully deleted Policy: ' + self.policy.name;
                                $location.path('/policies');
                            }, function(err) {
                                $log.error(err);
                                ConfirmDialogService.display({
                                    prompt: 'There was a problem deleting the Policy. ' + err + '.',
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
        }]);
});