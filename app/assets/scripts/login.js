(function(){
    /* jshint -W106 */
    'use strict';

    angular.module('c6.proshop')
    .controller('LoginCtrl',['$log','$scope','auth',
        function(             $log , $scope , auth ){

        $log = $log.context('LoginCtrl');
        $log.info('instantiated, scope=%1',$scope.$id);

        $scope.email = '';
        $scope.password = '';
        $scope.loginError = '';

        $scope.login = function(){
            $log.info('logging in %1', $scope.email);

            if ( (!$scope.email) || (!$scope.password) ||
                 ($scope.email.match(/^\s*$/)) || ($scope.password.match(/^\s*$/)) ){
                $scope.loginError = 'Email and password required.';
                return;
            }

            auth.login($scope.email,$scope.password)
            .then(function(data){
                $log.info('success:',data);
                $scope.$emit('loginSuccess',data);
            })
            .catch(function(err){
                $log.error('error:',err);
                $scope.loginError = err;
            });
        };

    }]);
}());

