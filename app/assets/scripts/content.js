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

            this.getExperience = function(id) {
                return httpWrapper({
                    method: 'GET',
                    url: c6UrlMaker('content/experience/'+id, 'api')
                });
            };

            this.getExperiencesByOrg = function(orgId) {
                return httpWrapper({
                    method: 'GET',
                    url: c6UrlMaker('content/experiences?org=' + orgId,'api')
                });
            };

            this.putExperience = function(exp) {
                var id = exp.id;
                delete exp.id;
                delete exp.org;
                delete exp.created;

                return httpWrapper({
                    method: 'PUT',
                    url: c6UrlMaker('content/experience/'+id, 'api'),
                    data: exp
                });
            };

            this.postExperience = function(exp) {
                return httpWrapper({
                    method: 'POST',
                    url: c6UrlMaker('content/experience','api'),
                    data: exp
                });
            };

            this.convertExperienceForCopy = function(exp) {
                exp.origExpId = exp.id;
                exp.origOrg = exp.org;
                exp.origUser = exp.user.id;
                exp.status = 'active';
                exp.access = 'public';

                return exp;
            };

        }]);
});