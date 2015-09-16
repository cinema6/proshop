define(['angular','./mixins/paginatedListController'], function(angular, PaginatedListCtrl) {
    'use strict';

    var forEach = angular.forEach;

    return angular.module('c6.proshop.roles',[])
        .controller('RolesController', ['$scope','$log','$location','$injector','Cinema6Service','scopePromise',
        function                       ( $scope , $log , $location , $injector , Cinema6Service , scopePromise ) {
            var self = this;

            $log = $log.context('RolesCtrl');
            $log.info('instantiated');

            self.addNew = function() {
                $location.path('/role/new');
            };

            $scope.endpoint = 'roles';

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

        .controller('RoleController', ['$scope','$log','$location','$routeParams','$q','Cinema6Service',
                                       'ConfirmDialogService',
        function                      ( $scope , $log , $location , $routeParams , $q , Cinema6Service ,
                                        ConfirmDialogService ) {
            var self = this;

            $log = $log.context('RoleCtrl');
            $log.info('instantiated');

            function initView() {
                var promiseArray = [Cinema6Service.getAll('policies',{})];

                self.loading = true;

                if ($routeParams.id) {
                    promiseArray.push(Cinema6Service.get('roles', $routeParams.id));
                }

                $q.all(promiseArray)
                    .then(function(promises) {
                        var policies = promises[0] || [],
                            role = promises[1] || {
                                name: null,
                                policies: []
                            };

                        self.role = role;
                        self.policies = policies.data;
                    })
                    .finally(function() {
                        self.loading = false;
                    });
            }
            initView();

            self.addPolicy = function(policy) {
                var policies = self.role.policies;

                if (policies.indexOf(policy.name) === -1) {
                    policies.push(policy.name);
                }
            };

            self.removePolicy = function(index) {
                self.role.policies.splice(index, 1);
            };

            self.save = function(role) {
                function handleError(err) {
                    $log.error(err);
                    ConfirmDialogService.display({
                        prompt: 'There was a problem saving the Role. ' + err + '.',
                        affirm: 'Close',
                        onAffirm: function() {
                            ConfirmDialogService.close();
                        }
                    });
                }

                function handleSuccess(role) {
                    $log.info('saved Role: ', role);
                    $scope.message = 'Successfully saved Role: ' + role.name;
                    $location.path('/roles');
                }

                if (role.id) {
                    Cinema6Service.put('roles', role.id, role)
                        .then(handleSuccess, handleError);
                } else {
                    Cinema6Service.post('roles', role)
                        .then(handleSuccess, handleError);
                }
            };

            self.delete = function() {
                ConfirmDialogService.display({
                    prompt: 'Are you sure you want to delete this Role?',
                    affirm: 'Yes',
                    cancel: 'Cancel',
                    onAffirm: function() {
                        ConfirmDialogService.close();
                        Cinema6Service.delete('roles', self.role.id)
                            .then(function() {
                                $scope.message = 'Successfully deleted Role: ' + self.role.name;
                                $location.path('/roles');
                            }, function(err) {
                                $log.error(err);
                                ConfirmDialogService.display({
                                    prompt: 'There was a problem deleting the Role. ' + err + '.',
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