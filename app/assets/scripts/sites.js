define(['account'], function(account) {
    'use strict';

    return angular.module('c6.proshop.sites', [account.name])
        .controller('SitesController', ['$scope','$log','SitesService','account','ConfirmDialogService','$q',
        function                       ( $scope , $log , SitesService , account , ConfirmDialogService , $q ) {
            var self = this,
                _data = {},
                bindBrandToName = true;

            $log = $log.context('SitesCtrl');
            $log.info('instantiated');

            function convertNameToBrand(name) {
                return name.toLowerCase().split(',')[0].replace(/ /g, '_');
            }

            function initView() {
                self.loading = true;

                $q.all([SitesService.getSites(), account.getOrgs()])
                    .then(function(promises) {
                        var sites = promises[0],
                            orgs = promises[1],
                            siteOrgPromiseArray = [];

                        self.orgs = orgs;
                        _data.orgs = orgs;

                        sites.forEach(function(site) {
                            if (site.org) {
                                siteOrgPromiseArray.push(account.getOrg(site.org)
                                    .then(function(org) {
                                        site.org = org;
                                    }));
                            }
                        });

                        $q.all(siteOrgPromiseArray)
                            .then(function() {
                                self.loading = false;
                            });

                        self.sites = sites;
                        _data.sites = sites;
                    }, function() {
                        self.loading = false;
                    });
            }

            self.action = 'all';
            self.query = null;
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

            self.filterData = function(query) {
                var _query = query.toLowerCase(),
                    orgs = _data.orgs.filter(function(org) {
                        return org.name.toLowerCase().indexOf(_query) >= 0;
                    });

                self.sites = _data.sites.filter(function(site) {
                    var bool = false;

                    orgs.forEach(function(org) {
                        bool = (site.org && (site.org.id.indexOf(org.id) >= 0)) || bool;
                    });

                    [site.name, site.host].forEach(function(field) {
                        bool = (field && field.toLowerCase().indexOf(_query) >= 0) || bool;
                    });

                    return bool;
                });

                self.page = 1;
            };

            self.editSite = function(site) {
                $scope.message = null;
                self.site = site;
                if (site.org) {
                    self.org = self.orgs.filter(function(org) {
                        return self.site.org.id === org.id;
                    })[0];
                }
                self.action = 'edit';
            };

            self.addNewSite = function() {
                $scope.message = null;
                self.site = {
                    status: 'active'
                };
                self.org = null;
                self.action = 'new';
            };

            self.saveSite = function(site) {
                var s = {};

                function handleError(err) {
                    $log.error(err);
                    ConfirmDialogService.display({
                        prompt: 'There was a problem saving the Site. ' + err + '.',
                        affirm: 'Close',
                        onAffirm: function() {
                            ConfirmDialogService.close();
                        }
                    });
                }

                function handleSuccess(site) {
                    $log.info('saved user: ', site);
                    $scope.message = 'Successfully saved Site: ' + site.name;
                    initView();
                    self.action = 'all';
                }

                if (self.org) {
                    s.org = self.org.id;
                }

                ['name','branding','host','status','placementId'].forEach(function(prop) {
                    s[prop] = site[prop];
                });

                if (site.id) {
                    SitesService.putSite(site.id, s)
                        .then(handleSuccess, handleError);
                } else {
                    SitesService.postSite(s)
                        .then(handleSuccess, handleError);
                }
            };

            self.confirmDelete = function() {
                ConfirmDialogService.display({
                    prompt: 'Are you sure you want to delete this Site?',
                    affirm: 'Yes',
                    cancel: 'Cancel',
                    onAffirm: function() {
                        ConfirmDialogService.close();
                        SitesService.deleteSite(self.site.id)
                            .then(function() {
                                $scope.message = 'Successfully deleted Site: ' + self.site.name;
                                initView();
                                self.action = 'all';
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
                    url: c6UrlMaker('site/' + id, 'api')
                });
            };

            this.getSites = function(param, value) {
                return httpWrapper({
                    method: 'GET',
                    url: c6UrlMaker('sites' + (param && value ? '?' + param + '=' + value : ''), 'api')
                });
            };

            this.postSite = function(site) {
                return httpWrapper({
                    method: 'POST',
                    url: c6UrlMaker('site', 'api'),
                    data: site
                });
            };

            this.putSite = function(id, site) {
                return httpWrapper({
                    method: 'PUT',
                    url: c6UrlMaker('site/' + id, 'api'),
                    data: site
                });
            };

            this.deleteSite = function(id) {
                return httpWrapper({
                    method: 'DELETE',
                    url: c6UrlMaker('site/' + id, 'api')
                });
            };
        }]);
});