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
                    "host": "bestever.com",
                    "containers": [
                        {
                            "id": "embed"
                        },
                        {
                            "id": "custom_container_id"
                        }
                    ]
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

                it('should set up objects on the controller for editing when promises resolve', function() {
                    $scope.$apply(function() {
                        SitesService.getSite.deferred.resolve(angular.copy(mockSite));
                        account.getOrgs.deferred.resolve(angular.copy(mockOrgs));
                    });

                    expect(SiteCtrl.orgs).toEqual(mockOrgs);
                    expect(SiteCtrl.org).toEqual(mockOrgs[1]);
                    expect(SiteCtrl.site.id).toBe('s-1');
                    expect(SiteCtrl.site.status).toBe('active');
                    expect(SiteCtrl.site.org).toBe('o-112');
                    expect(SiteCtrl.site.branding).toBe('site1_branding');
                    expect(SiteCtrl.site.host).toBe('bestever.com');
                    expect(SiteCtrl.site.placementId).toBe('111111');
                    expect(SiteCtrl.site.wildCardPlacement).toBe('121212');
                    expect(SiteCtrl.site.containers).toEqual([
                        {
                            id: 'embed',
                            type: 'embed',
                            name: 'Embed'
                        },
                        {
                            id: 'custom_container_id',
                            name: 'Custom'
                        }
                    ]);
                });
            });

            describe('methods', function() {
                describe('addContainerItem()', function() {
                    it('should add a new container object to the Site Container array', function() {
                        $scope.$apply(function() {
                            SitesService.getSite.deferred.resolve(angular.copy(mockSite));
                            account.getOrgs.deferred.resolve(angular.copy(mockOrgs));
                        });

                        SiteCtrl.container = SiteCtrl.containerTypes[0];

                        $scope.$digest();

                        SiteCtrl.addContainerItem();

                        expect(SiteCtrl.site.containers[2]).toEqual({
                            type: 'embed',
                            name: 'Embed',
                            id: 'embed_2'
                        });
                    });

                    it('should reset customization prop and reset selected container type', function() {
                        $scope.$apply(function() {
                            SitesService.getSite.deferred.resolve(angular.copy(mockSite));
                            account.getOrgs.deferred.resolve(angular.copy(mockOrgs));
                        });

                        SiteCtrl.container = SiteCtrl.containerTypes[0];
                        SiteCtrl.container.customization = 'Number 2';

                        $scope.$digest();

                        SiteCtrl.addContainerItem();

                        expect(SiteCtrl.site.containers[2]).toEqual({
                            type: 'embed',
                            name: 'Embed',
                            id: 'embed_number_2',
                            customization: 'Number 2'
                        });
                        expect(SiteCtrl.container).toBe(null);
                        expect(SiteCtrl.containerTypes[0].customization).toBe('');
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
                                host: 'bestever.com',
                                containers: [
                                    {
                                        id: 'embed'
                                    },
                                    {
                                        id: 'custom_container_id'
                                    }
                                ]
                            });

                            SiteCtrl.site.branding = 'test_branding';
                            SiteCtrl.site.name = 'Test Name';
                            SiteCtrl.site.placementId = '';
                            SiteCtrl.site.wildCardPlacement = '';
                            SiteCtrl.site.host = 'test.com';
                            SiteCtrl.site.status = 'inactive';
                            SiteCtrl.site.containers = [
                                {
                                    id: 'embed'
                                },
                                {
                                    id: 'custom_container_id'
                                },
                                {
                                    type: 'veeseo',
                                    id: 'veeseo',
                                    name: 'Veeseo'
                                },
                                {
                                    type: '',
                                    id: 'custom_container',
                                    name: 'Custom'
                                }
                            ];
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
                                host: 'test.com',
                                containers: [
                                    {
                                        id: 'embed'
                                    },
                                    {
                                        id: 'custom_container_id'
                                    },
                                    {
                                        id: 'veeseo'
                                    },
                                    {
                                        id: 'custom_container'
                                    }
                                ]
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
                                host: 'bestever.com',
                                containers: [
                                    {
                                        id: 'embed'
                                    },
                                    {
                                        id: 'custom_container_id'
                                    }
                                ]
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
                            SiteCtrl.site.containers = [
                                {
                                    type: 'veeseo',
                                    id: 'veeseo',
                                    name: 'Veeseo'
                                },
                                {
                                    type: '',
                                    id: 'custom_container',
                                    name: 'Custom'
                                }
                            ];
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
                                host: 'newsite.com',
                                containers: [
                                    {
                                        id: 'veeseo'
                                    },
                                    {
                                        id: 'custom_container'
                                    }
                                ]
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
                                host: 'newsite.com',
                                containers: [
                                    {
                                        id: 'veeseo'
                                    },
                                    {
                                        id: 'custom_container'
                                    }
                                ]
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
                describe('duplicateContainerId', function() {
                    it('should only be true if new container id matches an existing id', function() {
                        $scope.$apply(function() {
                            SitesService.getSite.deferred.resolve(angular.copy(mockSite));
                            account.getOrgs.deferred.resolve(angular.copy(mockOrgs));
                        });

                        SiteCtrl.container = { type: '', name: 'Custom', customization: 'custom_container_id'};

                        $scope.$digest();

                        expect(SiteCtrl.duplicateContainerId).toBe(true);

                        SiteCtrl.container = { type: '', name: 'Custom', customization: 'new_custom_container_id'};

                        $scope.$digest();

                        expect(SiteCtrl.duplicateContainerId).toBe(false);
                    });
                });

                describe('duplicateContainerType', function() {
                    it('should only be true if the new container type matches an existing container', function() {
                        $scope.$apply(function() {
                            SitesService.getSite.deferred.resolve(angular.copy(mockSite));
                            account.getOrgs.deferred.resolve(angular.copy(mockOrgs));
                        });

                        SiteCtrl.container = { type: 'embed', name: 'Embed' };

                        $scope.$digest();

                        expect(SiteCtrl.duplicateContainerType).toBe(true);

                        SiteCtrl.container = { type: '', name: 'Custom' };

                        $scope.$digest();

                        expect(SiteCtrl.duplicateContainerType).toBe(false);
                    });
                });

                describe('newContainerId', function() {
                    beforeEach(function() {
                        $scope.$apply(function() {
                            SitesService.getSite.deferred.resolve(angular.copy(mockSite));
                            account.getOrgs.deferred.resolve(angular.copy(mockOrgs));
                        });
                    });

                    describe('when there is no customization', function() {
                        describe('with no duplicate types', function() {
                            it('should be set to the container type', function() {
                                SiteCtrl.container = { type: 'veeseo', name: 'Veeseo'};

                                $scope.$digest();

                                expect(SiteCtrl.newContainerId).toBe('veeseo');

                                SiteCtrl.container = { type: 'mr2', name: 'MR2 Widget'};

                                $scope.$digest();

                                expect(SiteCtrl.newContainerId).toBe('mr2');
                            });
                        });

                        describe('with duplicate types', function() {
                            it('should add an incremented counter to the id to guarantee uniqueness', function() {
                                SiteCtrl.container = { type: 'embed', name: 'Embed'};

                                $scope.$digest();

                                expect(SiteCtrl.newContainerId).toBe('embed_2');

                                SiteCtrl.addContainerItem();

                                $scope.$digest();

                                SiteCtrl.container = { type: 'embed', name: 'Embed'};

                                $scope.$digest();

                                expect(SiteCtrl.newContainerId).toBe('embed_3');
                            });
                        });
                    });

                    describe('when there is customization', function() {
                        describe('with no duplicate types', function() {
                            it('should add the customization to the end of the type', function() {
                                SiteCtrl.container = { type: 'veeseo', name: 'Veeseo', customization: 'Custom Container' };

                                $scope.$digest();

                                expect(SiteCtrl.newContainerId).toBe('veeseo_custom_container');
                            });
                        });

                        describe('with duplicate types', function() {
                            it('should add the customization to the end of the type, overriding the incremented counter', function() {
                                SiteCtrl.container = { type: 'embed', name: 'Embed', customization: 'Custom Container' };

                                $scope.$digest();

                                expect(SiteCtrl.newContainerId).toBe('embed_custom_container');
                            });
                        });
                    });

                    describe('when container is Custom', function() {
                        it('should not prefix the id with anything', function() {
                            SiteCtrl.container = { type: '', name: 'Custom', customization: 'Custom Container' };

                            $scope.$digest();

                            expect(SiteCtrl.newContainerId).toBe('custom_container');
                        });
                    });
                });

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

                describe('SiteCtrl.container', function() {
                    it('should set the newContainerId, duplicateContainerType, and duplicateContainerId', function() {
                        $scope.$apply(function() {
                            SitesService.getSite.deferred.resolve(angular.copy(mockSite));
                            account.getOrgs.deferred.resolve(angular.copy(mockOrgs));
                        });

                        expect(SiteCtrl.newContainerId).toBe('');
                        expect(SiteCtrl.duplicateContainerType).toBe(false);
                        expect(SiteCtrl.duplicateContainerId).toBe(false);

                        SiteCtrl.site.containers.push({ type: 'embed', name: 'Embed', id: 'embed_my_container'})

                        SiteCtrl.container = { type: 'embed', name: 'Embed', customization: 'My Container' };

                        $scope.$digest();

                        expect(SiteCtrl.newContainerId).toBe('embed_my_container');
                        expect(SiteCtrl.duplicateContainerType).toBe(true);
                        expect(SiteCtrl.duplicateContainerId).toBe(true);
                    });
                });
            });
        });
    });
}());