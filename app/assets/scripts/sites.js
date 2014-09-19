define(['account'], function(account) {
    'use strict';

    return angular.module('c6.proshop.sites', [account.name])
        .controller('SitesController', ['$scope','$log','SitesService','account','ConfirmDialogService',
        function                       ( $scope , $log , SitesService , account , ConfirmDialogService ) {
            var self = this,
                data,
                bindBrandToName = true;

            $log = $log.context('SitesCtrl');
            $log.info('instantiated');

            function convertNameToBrand(name) {
                return name.toLowerCase().split(',')[0].replace(/ /g, '_');
            }

            function initView() {
                SitesService.getSites().then(function(sites) {
                    sites.forEach(function(site) {
                        account.getOrg(site.org).then(function(org) {
                            site.org = org;
                        });
                    });

                    self.sites = sites;
                });

                account.getOrgs().then(function(orgs) {
                    self.orgs = orgs;
                });
            }

            self.action = 'all';
            self.page = 1;
            self.limit = 50;
            self.limits = [5,10,50,100];
            Object.defineProperties(self, {
                total: {
                    get: function() {
                        return self.sites && Math.ceil(self.sites.length / self.limit);
                    }
                }
            });

            self.disableBrandBinding = function() {
                bindBrandToName = false;
            };

            self.convertNameToBrand = function(name) {
                $scope.site.branding = name.toLowerCase().split(',')[0].replace(/ /g, '_');
            };

            self.editSite = function(site) {
                self.site = site;
                self.org = self.orgs.filter(function(org) {
                    return self.site.org.id === org.id;
                })[0];
                self.action = 'edit';
            };

            self.addNewSite = function() {
                self.site = {};
                self.org = null;
                self.action = 'new';
                console.log($scope);
            };

            self.saveSite = function(site) {
                console.log(site);
            };

            self.confirmDelete = function() {
                ConfirmDialogService.display({
                    prompt: 'Are you sure you want to delete this Site?',
                    affirm: 'Yes',
                    cancel: 'Cancel',
                    onAffirm: function() {
                        ConfirmDialogService.close();
                        SitesService.deleteSite(self.site)
                            .then(function() {
                                $scope.message = 'Successfully deleted user: ' + self.site.name;
                                initView();
                            }, function(err) {
                                $log.error(err);
                                ConfirmDialogService.display({
                                    prompt: 'There was a problem deleting the Site. ' + err + '.',
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

            $scope.tableHeaders = [
                {label:'Name',value:'name'},
                {label:'Domain',value:'host'},
                {label:'Org',value:'org.name'},
                {label:'AdTech ID',value:'placementId'},
                {label:'Branding',value:'branding'},
                {label:'Status',value:'status'},
                {label:'Last Updated',value:'lastUpdated'}
            ];

            $scope.sort = {
                column: 'name',
                descending: false
            };

            $scope.doSort = function(column) {
                var sort = $scope.sort;
                if (sort.column === column) {
                    sort.descending = !sort.descending;
                } else {
                    sort.column = column;
                    sort.descending = false;
                }
            };

            $scope.$watch(function() {return self.site && self.site.name;}, function(newName) {
                if (newName && bindBrandToName && self.action === 'new') {
                    self.site.branding = convertNameToBrand(newName);
                }
            });

            initView();

        }])

        .directive('sitesAll', [ function ( ) {
            return {
                restrict: 'E',
                templateUrl: 'views/sites/sites_all.html',
                link: function(/*scope, element, attrs, ctrl*/) {
                    // can move any DOM stuff from Ctrl into here...
                }
            };
        }])

        .directive('sitesEdit', [ function ( ) {
            return {
                restrict: 'E',
                templateUrl: 'views/sites/sites_edit.html',
                link: function(/*scope, element, attrs, ctrl*/) {
                    // can move any DOM stuff from Ctrl into here...
                }
            };
        }])

        .directive('sitesNew', [ function ( ) {
            return {
                restrict: 'E',
                templateUrl: 'views/sites/sites_edit.html',
                link: function(/*scope, element, attrs, ctrl*/) {
                    // can move any DOM stuff from Ctrl into here...
                }
            };
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