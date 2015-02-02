define(['account'], function(account) {
    'use strict';

    var extend = angular.extend,
        copy = angular.copy;

    return angular.module('c6.proshop.sites', [account.name])
        .controller('SitesController', ['$scope','$location','$log','SitesService','account','$q',
        function                       ( $scope , $location , $log , SitesService , account , $q ) {
            var self = this,
                _data = {};

            $log = $log.context('SitesCtrl');
            $log.info('instantiated');

            function initView() {
                self.loading = true;

                $q.all([SitesService.getSites(), account.getOrgs()])
                    .then(function(promises) {
                        var sites = promises[0],
                            orgs = promises[1],
                            siteOrgPromiseArray = [];

                        self.orgs = orgs;
                        _data.orgs = orgs;

                        self.sites = sites;
                        _data.sites = sites;

                        sites.forEach(function(site) {
                            if (site.org) {
                                siteOrgPromiseArray.push(account.getOrg(site.org)
                                    .then(function(org) {
                                        site.org = org;
                                    }));
                            }
                        });

                        return $q.all(siteOrgPromiseArray);
                    })
                    .finally(function() {
                        self.loading = false;
                    });
            }

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

            self.addNewSite = function() {
                $location.path('/sites/new');
            };

            $scope.tableHeaders = [
                {label:'Name',value:'name'},
                {label:'Domain',value:'host'},
                {label:'Org',value:'org.name'},
                {label:'AdTech ID',value:'placementId'},
                {label:'Wild Card ID',value:'wildCardPlacement'},
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

            initView();

        }])

        .controller('SiteController', ['$scope','$routeParams','$location','$log','$q',
                                       'SitesService','account','ConfirmDialogService','appData',
        function                      ( $scope , $routeParams , $location , $log , $q ,
                                        SitesService , account , ConfirmDialogService , appData ) {
            var self = this,
                bindBrandToName = !$routeParams.id,
                containerTypes = appData.proshop.data.siteContainers;

            $log = $log.context('SiteCtrl');
            $log.info('instantiated');

            function getObjectByProp(prop, value, array) {
                return array.filter(function(obj) {
                    return obj[prop] === value;
                })[0];
            }

            function filterId(string) {
                return string.toLowerCase()
                    .replace(/ /g, '_')
                    .replace(/[^0-9a-zA-Z_]*/g,'');
            }

            function getNextNum(containers, container) {
                return containers.filter(function(cont) {
                    return cont.type === container.type;
                }).length + 1;
            }

            function convertNameToBrand(name) {
                return name.toLowerCase().split(',')[0].replace(/ /g, '_');
            }

            function convertContainersForSaving(containers) {
                return containers.map(function(container) {
                    return {id: container.id};
                });
            }

            function convertContainersForEditing(containers) {
                containers.forEach(function(container) {
                    var type = container.id.split('_')[0],
                        _container = getObjectByProp('type', type, self.containerTypes);

                    extend(container, _container || {name: 'Custom'});
                });
            }

            function initView() {
                var promiseArray = [account.getOrgs()];

                self.loading = true;

                if ($routeParams.id) {
                    promiseArray.push(SitesService.getSite($routeParams.id));
                }

                $q.all(promiseArray)
                    .then(function(promises) {
                        var orgs = promises[0],
                            site = promises[1] || {
                                status: 'active',
                                containers: []
                            };

                        self.orgs = orgs;
                        self.site = site;
                        self.org = !site.org ? null : orgs.filter(function(org) {
                            return site.org === org.id;
                        })[0];

                        convertContainersForEditing(site.containers);
                    })
                    .finally(function() {
                        self.loading = false;
                    });
            }

            self.newContainerId = '';
            self.vowelRegex = /[AEIOUaeiou]/;
            self.duplicateContainerId = false;
            self.duplicateContainerType = false;
            self.containerTypes = containerTypes;

            self.addContainerItem = function() {
                self.site.containers.push(
                    extend({
                        id: self.newContainerId
                    }, copy(self.container))
                );

                self.container.customization = '';
                self.container = null;
            };

            self.removeContainerItem = function(container) {
                var i = self.site.containers.indexOf(container);

                self.site.containers.splice(i,1);
            };

            self.disableBrandBinding = function() {
                bindBrandToName = false;
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
                    $location.path('/sites');
                }

                s.org = self.org ? self.org.id : null;

                ['name','branding','host','status','placementId','wildCardPlacement'].forEach(function(prop) {
                    s[prop] = site[prop];
                });

                s.containers = convertContainersForSaving(site.containers);

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
                                $location.path('/sites');
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

            $scope.containerTableHeaders = [
                {label:'ID',value:'id'},
                {label:'Type',value:'name'},
                {label:'Display Placement ID',value:'displayPlacementId'},
                {label:'Content Placement ID',value:'contentPlacementId'}
            ];

            $scope.sort = {
                column: 'id',
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
                if (newName && bindBrandToName) {
                    self.site.branding = convertNameToBrand(newName);
                }
            });

            $scope.$watchCollection(function() { return self.container; }, function(container) {
                if (!container || !self.site.containers) { return; }

                var newId,
                    type = container.type,
                    isCustom = type === '',
                    prefix = isCustom ? '' : '_',
                    containers = self.site.containers,
                    customization = container.customization,
                    typeExists = !isCustom && !!getObjectByProp('type', type, containers);

                self.newContainerId = newId = type +
                    (customization ?
                        prefix + filterId(customization) :
                        (typeExists ? '_' + getNextNum(containers, container) : '')
                    );
                self.duplicateContainerType = typeExists;
                self.duplicateContainerId = !!getObjectByProp('id', newId, containers);
            });

            initView();
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