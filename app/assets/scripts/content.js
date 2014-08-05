define(['angular','c6ui'],function(angular,c6ui) {
    'use strict';

    return angular.module('c6.proshop.content',[c6ui.name])
        .service('content', ['c6UrlMaker','$http','$q','$timeout',
        function            ( c6UrlMaker , $http , $q , $timeout ) {
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

            /*
            ********************
            EXPERIENCES
            ********************
            */

            this.getExperiencesByOrg = function(orgId) {
                return httpWrapper({
                    method: 'GET',
                    url: c6UrlMaker('content/experiences?org=' + orgId,'api')
                });
            };

            this.convertExperienceForCopy = function(exp) {
                exp.originalExperienceId = exp.id;
                exp.originalOrg = exp.org;
                exp.originalUser = exp.user;
                exp.status = 'active';
                exp.access = 'private';

                return exp;
            };

        }]);
});