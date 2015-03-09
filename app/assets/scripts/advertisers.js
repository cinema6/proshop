define(['angular','./mixins/paginatedListController'], function(angular, PaginatedListCtrl) {
    'use strict';

    return angular.module('c6.proshop.advertisers',[])
        .controller('AdvertisersController', ['$scope','$log','$location','Cinema6Service','scopePromise','$injector',
        function                             ( $scope , $log , $location , Cinema6Service , scopePromise , $injector ) {
            var self = this;

            $log = $log.context('AdvertisersCtrl');
            $log.info('instantiated');

            self.addNew = function() {
                $location.path('/advertiser/new');
            };

            $scope.endpoint = 'advertisers';

            $scope.tableHeaders = [
                {label:'Name',value:'name',sortable:true},
                {label:'Adtech ID',value:'adtechId',sortable:false},
                {label:'Status',value:'status',sortable:false},
                {label:'Last Updated',value:'lastUpdated',sortable:true}
            ];

            $scope.sort = {
                column: 'lastUpdated',
                descending: true
            };

            $injector.invoke(PaginatedListCtrl, self, {
                $scope: $scope,
                scopePromise: scopePromise,
                Cinema6Service: Cinema6Service
            });
        }])
        .controller('AdvertiserController', ['$scope','$log','ConfirmDialogService','$location','$routeParams','Cinema6Service',
        function                            ( $scope , $log , ConfirmDialogService , $location , $routeParams , Cinema6Service ) {
            var self = this;

            $log = $log.context('AdvertiserCtrl');
            $log.info('instantiated');

            function initView() {
                self.loading = true;

                if ($routeParams.id) {
                    Cinema6Service.get('advertisers', $routeParams.id)
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
            self.imageRegex = /^(http:\/\/|https:\/\/)([\w-]+\.)+[\w-]+\/([\w-]+(\/)?)+(\.)(\w{3,4})$/;
            self.urlRegex =   /^(http:\/\/|https:\/\/)([\w-]+\.)+[\w-]+(\/([\w-]+(\/)?)*)*$/;

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
                    Cinema6Service.put('advertisers', advertiser.id, a)
                        .then(handleSuccess, handleError);
                } else {
                    Cinema6Service.post('advertisers', a)
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
                        Cinema6Service.delete('advertisers', self.advertiser.id)
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
        }]);
});