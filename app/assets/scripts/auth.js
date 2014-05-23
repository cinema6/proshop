(function(){
    /* jshint -W106 */
    'use strict';

    angular.module('c6.proshop')
    .service('auth', ['c6UrlMaker','$http','$q','$timeout',
        function(      c6UrlMaker , $http , $q , $timeout ){

        this.login = function(email,password){
            var deferred = $q.defer(),
                deferredTimeout = $q.defer(),
                cancelTimeout,
                body = {
                    email: email,
                    password: password
                };

            $http({
                method: 'POST',
                url: c6UrlMaker('auth/login','api'),
                data: body,
                timeout: deferredTimeout.promise
            })
            .success(function(data){
                $timeout.cancel(cancelTimeout);
                deferred.resolve(data);
            })
            .error(function(data){
                if (!data){
                    data = 'Login failed';
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

        this.checkStatus = function() {
            var deferred = $q.defer(),
                deferredTimeout = $q.defer(),
                cancelTimeout;

            $http({
                method: 'GET',
                url: c6UrlMaker('auth/status','api'),
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

        this.logout = function(){
            var deferred = $q.defer(),
                deferredTimeout = $q.defer(),
                cancelTimeout;

            $http({
                method: 'POST',
                url: c6UrlMaker('auth/logout','api'),
                timeout: deferredTimeout.promise
            })
            .success(function(data){
                $timeout.cancel(cancelTimeout);
                deferred.resolve(data);
            })
            .error(function(data){
                if (!data){
                    data = 'Logout failed';
                } else if (data.error) {
                    data = data.error;
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
    }]);

}());
