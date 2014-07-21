(function(){
    /* jshint -W106 */
    'use strict';

    angular.module('c6.proshop')
    .controller('AcctChangeCtrl', ['$log', '$scope', 'account',
    function                      ( $log ,  $scope ,  account ){
        var self = this;

        $log = $log.context('AcctChangeCtrl');
        $log.info('instantiated, scope=%1',$scope.$id);

        self.changeEmail = function(origEmail,password,newEmail){
            $log.info('changeEmail:',origEmail,newEmail);

            return account.changeEmail(origEmail,password,newEmail);
        };

        self.changePassword = function(email,origPassword,newPassword){
            $log.info('changePassword:',email);

            return account.changePassword(email,origPassword,newPassword);
        };
    }])

    .directive('changeEmail', ['$log', 'c6UrlMaker',
    function                  ( $log ,  c6UrlMaker ){
        return {
            controller: 'AcctChangeCtrl',
            scope: {},
            restrict: 'E',
            templateUrl: c6UrlMaker('views/change_email.html'),
            link: function fnLink(scope,element,attrs,ctrl) {
                scope.origEmail     = attrs.email;
                scope.email         = null;
                scope.password      = '';
                scope.lastStatus    = null;
                scope.lastCode      = 0;
                scope.emailPattern  = /^\w+.*\.\w\w\w?$/;

                attrs.$observe('email',function(newVal){
                    scope.origEmail = newVal;
                });

                scope.submit = function(){
                    scope.lastStatus = null;
                    scope.lastCode   = 0;
                    scope.email = scope.email.replace(/\s+$/,'');

                    ctrl.changeEmail(scope.origEmail,scope.password,scope.email)
                        .then(function(){
                            $log.info('changed email for:',scope.email);

                            scope.lastStatus = 'User name has been changed.';
                            scope.$emit('emailChange',scope.email,scope.origEmail);
                        })
                        .catch(function(err){
                            $log.warn('failed changed email for:',scope.email,err);

                            scope.lastStatusCode = 1;
                            scope.lastStatus = 'User name change failed: ' + err;
                        });
                };
            }
        };
    }])

    .directive('changePassword', ['$log', 'c6UrlMaker',
    function                     ( $log ,  c6UrlMaker){
        return {
            controller : 'AcctChangeCtrl',
            scope : {
                email : '@'
            },
            restrict : 'E',
            templateUrl : c6UrlMaker('views/change_password.html'),
            link : function fnLink(scope,element,attrs,ctrl){
                scope.lastStatus    = null;
                scope.lastCode      = 0;
                scope.password = [null,null,null];
                scope.passwordPattern  = /(^\S+$)()/;

                scope.submit = function(){
                    scope.lastStatus = null;
                    scope.lastCode = 0;
                    ctrl.changePassword(scope.email,scope.password[0],scope.password[1])
                        .then(function(){
                            $log.info('changed password for:',scope.email);
                            scope.lastStatus = 'Password has been changed.';
                            scope.password = [null,null,null];
                        })
                        .catch(function(err){
                            $log.warn('failed changed password for:',scope.email,err);
                            scope.lastStatus = 'Password change failed: ' + err;
                            scope.lastCode = 1;
                            scope.password = [null,null,null];
                        });
                };
            }
        };
    }])

    .service('account', ['c6UrlMaker', '$http', '$q', '$timeout',
    function            ( c6UrlMaker ,  $http ,  $q ,  $timeout ){
        this.waterfallOptions = [
            {
                name: 'Cinema6',
                value: 'cinema6',
                checked: true
            },
            {
                name: 'Cinema6 - Publisher',
                value: 'cinema6-publisher',
                checked: false
            },
            {
                name: 'Publisher',
                value: 'publisher',
                checked: false
            },
            {
                name: 'Publisher - Cinema6',
                value: 'publisher-cinema6',
                checked: false
            }
        ];

        this.userPermissionOptions = {
            experiences: {
                name:   'Experience',
                actions: {
                    read:   {
                        name: 'read',
                        options: ['own','org','all']
                    },
                    create: {
                        name: 'create',
                        options: ['own','org','all']
                    },
                    edit:   {
                        name: 'edit',
                        options: ['own','org','all']
                    },
                    delete: {
                        name: 'delete',
                        options: ['own','org','all']
                    }
                }
            },
            elections: {
                name:   'Election',
                actions: {
                    read:   {
                        name: 'read',
                        options: ['own','org','all']
                    },
                    create: {
                        name: 'create',
                        options: ['own','org','all']
                    },
                    edit:   {
                        name: 'edit',
                        options: ['own','org','all']
                    },
                    delete: {
                        name: 'delete',
                        options: ['own','org','all']
                    }
                }
            },
            users: {
                name: 'User',
                actions: {
                    read:   {
                        name: 'read',
                        options: ['own','org','all']
                    },
                    edit:   {
                        name: 'edit',
                        options: ['own','org','all']
                    }
                }
            },
            orgs: {
                name: 'Org',
                actions: {
                    read:   {
                        name: 'read',
                        options: ['own']
                    },
                    edit:   {
                        name: 'edit',
                        options: ['own']
                    }
                }
            }
        };

        this.changeEmail = function(email,password,newEmail){
            var deferred = $q.defer(), deferredTimeout = $q.defer(), cancelTimeout,
                body = {
                    email: email,
                    password: password,
                    newEmail: newEmail,
                };

            $http({
                method: 'POST',
                url: c6UrlMaker('account/user/email','api'),
                data: body,
                timeout: deferredTimeout.promise
            })
            .success(function(data ){
                $timeout.cancel(cancelTimeout);
                deferred.resolve(data);
            })
            .error(function(data,status){
                if (!data){
                    data = status;
                }
                $timeout.cancel(cancelTimeout);
                deferred.reject(data);
            });

            cancelTimeout = $timeout(function(){
                deferredTimeout.resolve();
                deferred.reject('Request timed out.');
            },10000);

            return deferred.promise;
        };

        this.changePassword = function(email,password,newPassword) {
            var deferred = $q.defer(), deferredTimeout = $q.defer(), cancelTimeout,
                body = {
                    email: email,
                    password: password,
                    newPassword: newPassword
                };

            $http({
                method: 'POST',
                url: c6UrlMaker('account/user/password','api'),
                data: body,
                timeout: deferredTimeout.promise
            })
            .success(function(data ){
                $timeout.cancel(cancelTimeout);
                deferred.resolve(data);
            })
            .error(function(data, status){
                if (!data){
                    data = status;
                }
                $timeout.cancel(cancelTimeout);
                deferred.reject(data);
            });

            cancelTimeout = $timeout(function(){
                deferredTimeout.resolve();
                deferred.reject('Request timed out.');
            },10000);

            return deferred.promise;
        };

        this.putUser = function(id,email,password,org,lastName,firstName) {
            var deferred = $q.defer(), deferredTimeout = $q.defer(), cancelTimeout,
                body = {
                    email: email,
                    password: password,
                    org: org,
                    lastName: lastName,
                    firstName: firstName
                };

            $http({
                method: 'PUT',
                url: c6UrlMaker('account/user/' + id,'api'),
                data: body,
                timeout: deferredTimeout.promise
            })
            .success(function(data ){
                $timeout.cancel(cancelTimeout);
                deferred.resolve(data);
            })
            .error(function(data, status){
                if (!data){
                    data = status;
                }
                $timeout.cancel(cancelTimeout);
                deferred.reject(data);
            });

            cancelTimeout = $timeout(function(){
                deferredTimeout.resolve();
                deferred.reject('Request timed out.');
            },10000);

            return deferred.promise;
        };

        this.postUser = function(email,password,org,lastName,firstName) {
            var deferred = $q.defer(), deferredTimeout = $q.defer(), cancelTimeout,
                body = {
                    email: email,
                    password: password,
                    org: org,
                    lastName: lastName,
                    firstName: firstName
                };

            $http({
                method: 'POST',
                url: c6UrlMaker('account/user/','api'),
                data: body,
                timeout: deferredTimeout.promise
            })
            .success(function(data ){
                $timeout.cancel(cancelTimeout);
                deferred.resolve(data);
            })
            .error(function(data, status){
                if (!data){
                    data = status;
                }
                $timeout.cancel(cancelTimeout);
                deferred.reject(data);
            });

            cancelTimeout = $timeout(function(){
                deferredTimeout.resolve();
                deferred.reject('Request timed out.');
            },10000);

            return deferred.promise;
        };

        this.getOrg = function(orgId){
            var deferred = $q.defer(), deferredTimeout = $q.defer(), cancelTimeout,
                url = c6UrlMaker('account/org/' + orgId,'api');

            $http({
                method: 'GET',
                url: url,
                timeout: deferredTimeout.promise
            })
            .success(function(data){
                $timeout.cancel(cancelTimeout);
                deferred.resolve(data);
            })
            .error(function(data){
                if (!data){
                    data = 'Unable to locate failed';
                }
                $timeout.cancel(cancelTimeout);
                deferred.reject(data);
            });

            cancelTimeout = $timeout(function(){
                deferredTimeout.resolve();
                deferred.reject('Request timed out.');
            },10000);

            return deferred.promise;
        };

        this.getOrgs = function(field) {
            var deferred = $q.defer(),
                deferredTimeout = $q.defer(),
                cancelTimeout,
                url = c6UrlMaker('account/orgs' + (field ? '?sort=' + field : ''),'api');

            $http({
                method: 'GET',
                url: url,
                timeout: deferredTimeout.promise
            })
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
        };

        this.getUser = function(id) {
            var deferred = $q.defer(),
                deferredTimeout = $q.defer(),
                cancelTimeout,
                url = c6UrlMaker('account/user/' + id,'api');

            $http({
                method: 'GET',
                url: url,
                timeout: deferredTimeout.promise
            })
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
        };

        this.getUsers = function(org) {
            var deferred = $q.defer(),
                deferredTimeout = $q.defer(),
                cancelTimeout,
                url = c6UrlMaker('account/users' + (org ? '?org=' + org.id : ''),'api');

            $http({
                method: 'GET',
                url: url,
                timeout: deferredTimeout.promise
            })
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
        };
    }]);
}());


