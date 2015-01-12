define(['angular'], function(angular) {
    'use strict';

    return angular.module('c6.proshop.advertisers',[])
        .controller('AdvertisersController', ['$scope','$log','$location','AdvertisersService',
        function                             ( $scope , $log , $location , AdvertisersService ) {
            var self = this,
                _data = {};

            $log = $log.context('AdvertisersCtrl');
            $log.info('instantiated');

            function initView() {
                self.loading = true;

                AdvertisersService.getAdvertisers()
                    .then(function(advertisers) {
                        self.advertisers = advertisers;
                        _data.advertisers = advertisers;
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
                        return self.advertisers && Math.ceil(self.advertisers.length / self.limit);
                    }
                }
            });

            self.addNew = function() {
                $location.path('/advertiser/new');
            };

            self.filterData = function(query) {
                var _query = query.toLowerCase();

                self.advertisers = _data.advertisers.filter(function(advertiser) {
                    return advertiser.name.toLowerCase().indexOf(_query) >= 0 ||
                        advertiser.adtechId.indexOf(_query) >= 0;
                });

                self.page = 1;
            };

            $scope.tableHeaders = [
                {label:'Name',value:'name'},
                {label:'Adtech ID',value:'adtechId'},
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
        .controller('AdvertiserController', ['$scope','$log','ConfirmDialogService','$location','AdvertisersService','$routeParams',
        function                            ( $scope , $log , ConfirmDialogService , $location , AdvertisersService , $routeParams ) {
            var self = this;

            $log = $log.context('AdvertiserCtrl');
            $log.info('instantiated');

            function initView() {
                self.loading = true;

                if ($routeParams.id) {
                    AdvertisersService.getAdvertiser($routeParams.id)
                        .then(function(advertiser) {
                            self.advertiser = advertiser;
                            enableActiveLinks(self.advertiser.defaultLinks);
                            enableActiveLogos(self.advertiser.defaultLogos);
                        })
                        .finally(function() {
                            self.loading = false;
                        });
                } else {
                    self.loading = false;
                    self.advertiser = {
                        status: 'active',
                        defaultLinks: {},
                        defaultLogos: {}
                    };
                    enableActiveLinks(self.advertiser.defaultLinks);
                    enableActiveLogos(self.advertiser.defaultLogos);
                }
            }

            function Link() {
                this.name = 'Untitled';
                this.href = null;
            }

            function enableActiveLinks(links) {
                self.links = ['Website', 'Facebook', 'Twitter', 'Pinterest', 'Youtube']
                    .concat(Object.keys(links))
                    .filter(function(name, index, names) {
                        return names.indexOf(name) === index;
                    })
                    .map(function(name) {
                        var href = links[name] || null;

                        return {
                            name: name,
                            href: href
                        };
                    });
            }

            function enableActiveLogos(logos) {
                self.logos = Object.keys(logos || {})
                    .map(function(name) {
                        return {
                            name: name,
                            href: logos[name]
                        };
                    });
            }

            function convertLinksForSaving() {
                return self.links.reduce(function(links, link) {
                    if (link.href) {
                        links[link.name] = link.href;
                    }

                    return links;
                }, {});
            }

            function convertLogosForSaving() {
                return self.logos.reduce(function(logos, logo) {
                    if (logo.href) {
                        logos[logo.name] = logo.href;
                    }

                    return logos;
                }, {});
            }

            self.newLink = new Link();
            self.newLogo = new Link();

            self.addLink = function() {
                self.links = self.links.concat([self.newLink]);

                /* jshint boss:true */
                return (self.newLink = new Link());
            };

            self.addLogo = function() {
                self.logos = self.logos.concat([self.newLogo]);

                /* jshint boss:true */
                return (self.newLogo = new Link());
            };

            self.removeLogo = function(logo) {
                /* jshint boss:true */
                return (this.logos = this.logos.filter(function(item) {
                    return item !== logo;
                }));
            };

            self.removeLink = function(link) {
                /* jshint boss:true */
                return (this.links = this.links.filter(function(item) {
                    return item !== link;
                }));
            };

            self.save = function(advertiser) {
                var a = {};

                function handleError(err) {
                    $log.error(err);
                    ConfirmDialogService.display({
                        prompt: 'There was a problem saving the Advertiser. ' + err + '.',
                        affirm: 'Close',
                        onAffirm: function() {
                            ConfirmDialogService.close();
                        }
                    });
                }

                function handleSuccess(advertiser) {
                    $log.info('saved Advertiser: ', advertiser);
                    $scope.message = 'Successfully saved Advertiser: ' + advertiser.name;
                    $location.path('/advertisers');
                }

                ['name','status'].forEach(function(prop) {
                    a[prop] = advertiser[prop];
                });

                a.defaultLinks = convertLinksForSaving();
                a.defaultLogos = convertLogosForSaving();

                if (advertiser.id) {
                    AdvertisersService.putAdvertiser(advertiser.id, a)
                        .then(handleSuccess, handleError);
                } else {
                    AdvertisersService.postAdvertiser(a)
                        .then(handleSuccess, handleError);
                }
            };

            self.delete = function() {
                ConfirmDialogService.display({
                    prompt: 'Are you sure you want to delete this Advertiser?',
                    affirm: 'Yes',
                    cancel: 'Cancel',
                    onAffirm: function() {
                        ConfirmDialogService.close();
                        AdvertisersService.deleteAdvertiser(self.advertiser.id)
                            .then(function() {
                                $scope.message = 'Successfully deleted Advertiser: ' + self.advertiser.name;
                                $location.path('/advertisers');
                            }, function(err) {
                                $log.error(err);
                                ConfirmDialogService.display({
                                    prompt: 'There was a problem deleting the Advertiser. ' + err + '.',
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

            initView();
        }])
        .service('AdvertisersService', ['c6UrlMaker','$http','$q','$timeout',
        function                       ( c6UrlMaker , $http , $q , $timeout ) {
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

            this.getAdvertisers = function() {
                return httpWrapper({
                    method: 'GET',
                    url: c6UrlMaker('account/advertisers', 'api')
                });
            };

            this.getAdvertiser = function(id) {
                return httpWrapper({
                    method: 'GET',
                    url: c6UrlMaker('account/advertiser/' + id, 'api')
                });
            };

            this.putAdvertiser = function(id, advertiser) {
                return httpWrapper({
                    method: 'PUT',
                    url: c6UrlMaker('account/advertiser/' + id, 'api'),
                    data: advertiser
                });
            };

            this.postAdvertiser = function(advertiser) {
                return httpWrapper({
                    method: 'POST',
                    url: c6UrlMaker('account/advertiser', 'api'),
                    data: advertiser
                });
            };

            this.deleteAdvertiser = function(id) {
                return httpWrapper({
                    method: 'DELETE',
                    url: c6UrlMaker('account/advertiser/' + id, 'api')
                });
            };
        }]);
});