(function(){
    /* jshint -W106 */
    'use strict';

    angular.module('c6.proshop')
    .controller('LoginCtrl', ['$log','$scope','auth',
        function(              $log , $scope , auth ){

        $log = $log.context('LoginCtrl');
        $log.info('instantiated, scope=%1', $scope.$id);

        var self = this;

        $scope.LoginCtrl = this;

        self.email = '';
        self.password = '';
        self.loginError = '';

        self.login = function(){
            $log.info('logging in %1', self.email);

            if ( (!self.email) || (!self.password) ||
                 (self.email.match(/^\s*$/)) || (self.password.match(/^\s*$/)) ){
                self.loginError = 'Email and password required.';
                return;
            }

            auth.login(self.email, self.password)
            .then(function(data){
                $log.info('success:', data);

                $scope.$emit('loginSuccess', data);
            })
            .catch(function(err){
                $log.error('error:', err);

                self.loginError = err;
            });
        };

    }]);
}());

