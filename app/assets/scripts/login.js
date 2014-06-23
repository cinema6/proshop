(function(){
    /* jshint -W106 */
    'use strict';

    angular.module('c6.proshop')
    .controller('LoginCtrl', ['$log','$scope','auth','account',
        function(              $log , $scope , auth , account ){

        $log = $log.context('LoginCtrl');
        $log.info('instantiated, scope=%1', $scope.$id);

        var self = this,
            user;

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
                    user = data;
                    return account.getOrg(user.org);
                })
                .then(function(org){
                    user.org = org;
                    $scope.$emit('loginSuccess', user);
                })
                .catch(function(err){
                    $log.error('error:', err);

                    if (user) {
                        self.loginError = 'There is a problem with your account.';
                        return;
                    }

                    self.loginError = err;
                });
        };

    }]);
}());

