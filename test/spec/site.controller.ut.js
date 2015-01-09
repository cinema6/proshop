(function() {

    'use strict';

    define(['app'], function() {
        describe('SiteController', function() {
            var $rootScope,
                $scope,
                $controller,
                $q,
                $log,
                $routeParams,
                $location,
                SiteCtrl,
                SitesService,
                account,
                ConfirmDialogService,
                mockSite,
                mockOrgs;

            beforeEach(function() {
                module('c6.proshop');

                $routeParams = {
                    id: 's-1'
                };

                ConfirmDialogService = {
                    display: jasmine.createSpy('ConfirmDialogService.display()'),
                    close: jasmine.createSpy('ConfirmDialogService.close()')
                };

                account = {
                    getOrgs: jasmine.createSpy('account.getOrgs'),
                };

                SitesService = {
                    getSite: jasmine.createSpy('SitesService.getSite'),
                    putSite: jasmine.createSpy('SitesService.putSite'),
                    postSite: jasmine.createSpy('SitesService.postSite'),
                    deleteSite: jasmine.createSpy('SitesService.deleteSite')
                };

                /* jshint quotmark:false */
                mockSite = {
                    "id": "s-1",
                    "status": "active",
                    "created": "2014-06-13T19:28:39.408Z",
                    "lastUpdated": "2014-06-13T19:28:39.408Z",
                    "org": "o-112",
                    "branding": "site1_branding",
                    "placementId": "111111",
                    "wildCardPlacement": "121212",
                    "name": "Best Website Ever",
                    "host": "bestever.com"/*,
                    "containers": []*/
                };
                /* jshint quotmark:single */

                mockOrgs = [
                    {
                        name: 'Org1',
                        id: 'o-111'
                    },
                    {
                        name: 'Org2',
                        id: 'o-112'
                    },
                    {
                        name: 'Org3',
                        id: 'o-114'
                    }
                ];

                inject(function($injector) {
                    $controller = $injector.get('$controller');
                    $log = $injector.get('$log');
                    $q = $injector.get('$q');
                    $rootScope = $injector.get('$rootScope');
                    $location = $injector.get('$location');

                    spyOn($location, 'path');

                    account.getOrgs.deferred = $q.defer();
                    account.getOrgs.and.returnValue(account.getOrgs.deferred.promise);

                    SitesService.getSite.deferred = $q.defer();
                    SitesService.getSite.and.returnValue(SitesService.getSite.deferred.promise);

                    SitesService.putSite.deferred = $q.defer();
                    SitesService.putSite.and.returnValue(SitesService.putSite.deferred.promise);

                    SitesService.postSite.deferred = $q.defer();
                    SitesService.postSite.and.returnValue(SitesService.postSite.deferred.promise);

                    SitesService.deleteSite.deferred = $q.defer();
                    SitesService.deleteSite.and.returnValue(SitesService.deleteSite.deferred.promise);

                    $log.context = function(){ return $log; }

                    $scope = $rootScope.$new();

                    SiteCtrl = $controller('SiteController', {
                        $log: $log,
                        $scope: $scope,
                        $routeParams: $routeParams,
                        account: account,
                        SitesService: SitesService,
                        ConfirmDialogService: ConfirmDialogService
                    });
                });
            });

            describe('initialization', function() {
                it('should exist', function() {
                    expect(SiteCtrl).toBeDefined();
                });

                it('should load the Site from service', function() {
                    expect(SitesService.getSite).toHaveBeenCalledWith('s-1');
                    expect(account.getOrgs).toHaveBeenCalled();
                });

                it('should not load the Site if no id is in the route', function() {
                    SitesService.getSite.calls.reset();

                    $routeParams = {};

                    SiteCtrl = $controller('SiteController', {
                        $log: $log,
                        $scope: $scope,
                        $routeParams: $routeParams,
                        account: account,
                        SitesService: SitesService,
                        ConfirmDialogService: ConfirmDialogService
                    });

                    expect(SitesService.getSite).not.toHaveBeenCalled();
                });
            });

            describe('methods', function() {
                xdescribe('addContainerItem()', function() {
                    describe('adding an existing container type', function() {
                        it('should enable it', function() {
                            expect(SiteCtrl.containers[2].enabled).toBe(false);

                            SiteCtrl.addContainerItem(SiteCtrl.containers[2]);

                            expect(SiteCtrl.containers[2].enabled).toBe(true);
                        });
                    });

                    describe('adding a custom container', function() {
                        var standardContainerCount,
                            customContainer;

                        beforeEach(function() {
                            standardContainerCount = SiteCtrl.containers.length;

                            customContainer = SiteCtrl.containers.filter(function(container) {
                                return container.name === 'Other';
                            })[0];
                        });

                        it('should do nothing if type is not defined', function() {
                            customContainer.type = '';

                            SiteCtrl.addContainerItem(customContainer);

                            expect(SiteCtrl.containers.length).toEqual(standardContainerCount);
                        });

                        it('should do add a container to the list and enable it', function() {
                            var newContainer;

                            customContainer.type = 'Some Custom Container';

                            SiteCtrl.addContainerItem(customContainer);

                            expect(SiteCtrl.containers.length).toEqual(standardContainerCount + 1);

                            newContainer = SiteCtrl.containers.filter(function(container) {
                                return container.name === 'Some Custom Container';
                            })[0];

                            expect(newContainer.enabled).toBe(true);
                            expect(newContainer.name).toBe('Some Custom Container');
                            expect(newContainer.type).toBe('some_custom_container');
                        });
                    });
                });

                describe('saveSite(site)', function() {
                    describe('when editing existing site', function() {
                        beforeEach(function() {
                            $scope.$apply(function() {
                                SitesService.getSite.deferred.resolve(angular.copy(mockSite));
                                account.getOrgs.deferred.resolve(angular.copy(mockOrgs));
                            });
                        });

                        it('should PUT the site', function() {
                            SiteCtrl.saveSite(SiteCtrl.site);

                            expect(SitesService.putSite).toHaveBeenCalledWith('s-1', {
                                status: 'active',
                                org: 'o-112',
                                branding: 'site1_branding',
                                placementId: '111111',
                                wildCardPlacement: '121212',
                                name: 'Best Website Ever',
                                host: 'bestever.com'/*,
                                containers: []*/
                            });

                            SiteCtrl.site.branding = 'test_branding';
                            SiteCtrl.site.name = 'Test Name';
                            SiteCtrl.site.placementId = '';
                            SiteCtrl.site.wildCardPlacement = '';
                            SiteCtrl.site.host = 'test.com';
                            SiteCtrl.site.status = 'inactive';
                            // SiteCtrl.containers = [
                            //     {
                            //         type: 'veeseo',
                            //         enabled: true
                            //     }
                            // ];
                            SiteCtrl.org = { id: 'o-999', name: 'New Org' };

                            SitesService.putSite.calls.reset();

                            SiteCtrl.saveSite(SiteCtrl.site);

                            expect(SitesService.putSite).toHaveBeenCalledWith('s-1', {
                                status: 'inactive',
                                org: 'o-999',
                                branding: 'test_branding',
                                placementId: '',
                                wildCardPlacement: '',
                                name: 'Test Name',
                                host: 'test.com'/*,
                                containers: [
                                    {
                                        type: 'veeseo'
                                    }
                                ]*/
                            });
                        });

                        it('should handle the absence of an Org', function() {
                            SiteCtrl.org = null;
                            SiteCtrl.saveSite(SiteCtrl.site);

                            expect(SitesService.putSite).toHaveBeenCalledWith('s-1', {
                                status: 'active',
                                org: null,
                                branding: 'site1_branding',
                                placementId: '111111',
                                wildCardPlacement: '121212',
                                name: 'Best Website Ever',
                                host: 'bestever.com'/*,
                                containers: []*/
                            });
                        });

                        it('should return to /sites on successful save', function() {
                            SiteCtrl.saveSite(SiteCtrl.site);

                            $scope.$apply(function() {
                                SitesService.putSite.deferred.resolve(SiteCtrl.site);
                            });

                            expect($location.path).toHaveBeenCalledWith('/sites');
                        });

                        it('should display an error dialog on failure', function() {
                            SiteCtrl.saveSite(SiteCtrl.site);

                            $scope.$apply(function() {
                                SitesService.putSite.deferred.reject('Error message');
                            });

                            expect(ConfirmDialogService.display).toHaveBeenCalled();
                            expect(ConfirmDialogService.display.calls.mostRecent().args[0].prompt).toBe('There was a problem saving the Site. Error message.');
                        });
                    });

                    describe('when creating a new site', function() {
                        beforeEach(function() {
                            $routeParams = {};

                            SiteCtrl = $controller('SiteController', {
                                $log: $log,
                                $scope: $scope,
                                $routeParams: $routeParams,
                                account: account,
                                SitesService: SitesService,
                                ConfirmDialogService: ConfirmDialogService
                            });

                            $scope.$apply(function() {
                                account.getOrgs.deferred.resolve(angular.copy(mockOrgs));
                            });

                            SiteCtrl.site.name = 'New Site';
                            SiteCtrl.site.branding = 'new_site';
                            SiteCtrl.site.host = 'newsite.com';
                            SiteCtrl.org = { id: 'o-1', name: 'Org1' };
                        });

                        it('should POST the site', function() {
                            SiteCtrl.saveSite(SiteCtrl.site);

                            expect(SitesService.postSite).toHaveBeenCalledWith({
                                status: 'active',
                                org: 'o-1',
                                branding: 'new_site',
                                placementId: undefined,
                                wildCardPlacement: undefined,
                                name: 'New Site',
                                host: 'newsite.com'/*,
                                containers: []*/
                            });
                        });

                        it('should handle the absence of an Org', function() {
                            SiteCtrl.org = null;
                            SiteCtrl.saveSite(SiteCtrl.site);

                            expect(SitesService.postSite).toHaveBeenCalledWith({
                                status: 'active',
                                org: null,
                                branding: 'new_site',
                                placementId: undefined,
                                wildCardPlacement: undefined,
                                name: 'New Site',
                                host: 'newsite.com'/*,
                                containers: []*/
                            });
                        });

                        it('should return to /sites on successful save', function() {
                            SiteCtrl.saveSite(SiteCtrl.site);

                            $scope.$apply(function() {
                                SitesService.postSite.deferred.resolve(SiteCtrl.site);
                            });

                            expect($location.path).toHaveBeenCalledWith('/sites');
                        });

                        it('should display an error dialog on failure', function() {
                            SiteCtrl.saveSite(SiteCtrl.site);

                            $scope.$apply(function() {
                                SitesService.postSite.deferred.reject('Error message');
                            });

                            expect(ConfirmDialogService.display).toHaveBeenCalled();
                            expect(ConfirmDialogService.display.calls.mostRecent().args[0].prompt).toBe('There was a problem saving the Site. Error message.');
                        });
                    });
                });

                describe('confirmDelete()', function() {
                    var onAffirm, onCancel;

                    beforeEach(function() {
                        $scope.$apply(function() {
                            SitesService.getSite.deferred.resolve(angular.copy(mockSite));
                            account.getOrgs.deferred.resolve(angular.copy(mockOrgs));
                        });

                        SiteCtrl.confirmDelete();

                        onAffirm = ConfirmDialogService.display.calls.mostRecent().args[0].onAffirm;
                        onCancel = ConfirmDialogService.display.calls.mostRecent().args[0].onCancel;
                    });

                    it('should display a confirmation dialog', function() {
                        expect(ConfirmDialogService.display).toHaveBeenCalled();
                    });

                    describe('onAffirm()', function() {
                        it('should close the dialog and delete site', function() {
                            onAffirm();

                            expect(ConfirmDialogService.close).toHaveBeenCalled();
                            expect(SitesService.deleteSite).toHaveBeenCalled();
                        });

                        describe('when delete is successful', function() {
                            it('should show a message and return to All Sites list', function() {
                                onAffirm();

                                $scope.$apply(function() {
                                    SitesService.deleteSite.deferred.resolve();
                                });

                                expect($location.path).toHaveBeenCalledWith('/sites');
                            });
                        });

                        describe('when delete fails', function() {
                            it('should display an error dialog', function() {
                                onAffirm();

                                ConfirmDialogService.display.calls.reset();

                                $scope.$apply(function() {
                                    SitesService.deleteSite.deferred.reject('Error message');
                                });

                                expect(ConfirmDialogService.display).toHaveBeenCalled();
                                expect(ConfirmDialogService.display.calls.mostRecent().args[0].prompt).toBe('There was a problem deleting the Site. Error message.');
                            });
                        });
                    });

                    describe('onCancel()', function() {
                        it('should close the dialog without deleting or changing views', function() {
                            onCancel();

                            expect(ConfirmDialogService.close).toHaveBeenCalled();
                            expect(SitesService.deleteSite).not.toHaveBeenCalled();
                        });
                    });
                });
            });

            describe('properties', function() {
                describe('loading', function() {
                    it('should be true on initialization', function() {
                        expect(SiteCtrl.loading).toBe(true);
                    });

                    it('should be false after all data promises resolve', function() {
                        $scope.$apply(function() {
                            SitesService.getSite.deferred.resolve(angular.copy(mockSite));
                            account.getOrgs.deferred.resolve(angular.copy(mockOrgs));
                        });

                        expect(SiteCtrl.loading).toBe(false);
                    });

                    it('should be false even if there are errors loading data', function() {
                        $scope.$apply(function() {
                            SitesService.getSite.deferred.reject();
                            account.getOrgs.deferred.reject();
                        });

                        expect(SiteCtrl.loading).toBe(false);
                    });
                });
            });

            describe('$scope.watch', function() {
                describe('site.name', function() {
                    describe('binding to branding when creating new site', function() {
                        beforeEach(function() {
                            $routeParams = {};

                            SiteCtrl = $controller('SiteController', {
                                $log: $log,
                                $scope: $scope,
                                $routeParams: $routeParams,
                                account: account,
                                SitesService: SitesService,
                                ConfirmDialogService: ConfirmDialogService
                            });

                            $scope.$apply(function() {
                                account.getOrgs.deferred.resolve(angular.copy(mockOrgs));
                            });
                        });

                        it('should happen until user clicks into the branding field', function() {
                            expect(SiteCtrl.site.name).toBe(undefined);
                            expect(SiteCtrl.site.branding).toBe(undefined);

                            $scope.$apply(function() {
                                SiteCtrl.site.name = 'Some New Site';
                            });

                            expect(SiteCtrl.site.branding).toBe('some_new_site');

                            $scope.$apply(function() {
                                SiteCtrl.site.name = 'Some New Site Name';
                            });

                            expect(SiteCtrl.site.branding).toBe('some_new_site_name');

                            SiteCtrl.disableBrandBinding();

                            $scope.$apply(function() {
                                SiteCtrl.site.name = 'Some';
                            });

                            expect(SiteCtrl.site.branding).toBe('some_new_site_name');
                        });
                    });
                });
            });
        });
    });
}());