define(['angular'], function(angular) {
    'use strict';

    return angular.module('c6.proshop.policies',[])
        .controller('PoliciesController', ['$scope','$log','$location','PoliciesService',
        function                          ( $scope , $log , $location , PoliciesService ) {
            var self = this;

            $log = $log.context('PoliciesCtrl');
            $log.info('instantiated');

            
        }])

        .controller('PolicyController', [function() {

        }])

        .service('PoliciesService', [function() {

        }]);
});