define(['account'], function(account) {
    'use strict';

    return angular.module('c6.proshop.sites', [account.name])
        .controller('SitesController', ['$scope','$log','SitesService','ConfirmDialogService',
        function                       ( $scope , $log , SitesService , ConfirmDialogService ) {
            var self = this,
                data = $scope.data;

            $log = $log.context('SitesCtrl');
            $log.info('instantiated');

            SitesService.getSites().then(function(sites) {
                self.sites = sites;
            });

        }])

        .service('SitesService', ['c6UrlMaker','$http','$q','$timeout',
        function                 ( c6UrlMaker , $http , $q , $timeout ) {
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

            this.getSite = function(id) {
                return httpWrapper({
                    method: 'GET',
                    url: c6UrlMaker('site' + id, 'api')
                });
            };

            this.getSites = function(field) {
                return httpWrapper({
                    method: 'GET',
                    url: c6UrlMaker('sites' + (field ? '?sort=' + field : ''), 'api')
                });
            };
        }]);
});