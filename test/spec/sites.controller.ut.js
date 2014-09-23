(function() {

    'user strict';

    define(['app'], function() {
        describe('SitesController', function() {
            var $rootScope,
                $scope,
                $controller,
                $q,
                $log,
                SitesCtrl,
                SitesService,
                account,
                ConfirmDialogService,
                mockSites,
                mockOrgs;

            beforeEach(function() {
                module('c6.proshop');

                ConfirmDialogService = {
                    display: jasmine.createSpy('ConfirmDialogService.display()'),
                    close: jasmine.createSpy('ConfirmDialogService.close()')
                };

                account = {
                    getOrg: jasmine.createSpy('account.getOrg'),
                    getOrgs: jasmine.createSpy('account.getOrgs'),
                };

                SitesService = {
                    getSite: jasmine.createSpy('SitesService.getSite'),
                    getSites: jasmine.createSpy('SitesService.getSites'),
                    putSite: jasmine.createSpy('SitesService.putSite'),
                    postSite: jasmine.createSpy('SitesService.postSite'),
                    deleteSite: jasmine.createSpy('SitesService.deleteSite')
                };

                mockSites = [
                    /* jshint quotmark:false */
                    {
                        "id": "s-1",
                        "status": "active",
                        "created": "2014-06-13T19:28:39.408Z",
                        "lastUpdated": "2014-06-13T19:28:39.408Z",
                        "org": "o-112",
                        "branding": "site1_branding",
                        "placementId": "111111",
                        "name": "Best Website Ever",
                        "host": "bestever.com"
                    },
                    {
                        "id": "s-2",
                        "status": "pending",
                        "created": "2014-05-13T19:28:39.408Z",
                        "lastUpdated": "2014-07-13T19:28:39.408Z",
                        "org": "o-111",
                        "branding": "site2_branding",
                        "placementId": "111112",
                        "name": "News Site",
                        "host": "thenews.com"
                    },
                    {
                        "id": "s-3",
                        "status": "inactive",
                        "created": "2014-06-17T19:28:39.408Z",
                        "lastUpdated": "2014-06-20T19:28:39.408Z",
                        "org": "o-114",
                        "branding": "site3_branding",
                        "placementId": "111113",
                        "name": "Sports Are Fun",
                        "host": "sportsarefun.com"
                    }
                    /* jshint quotmark:single */
                ];

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

                    account.getOrg.and.callFake(function(arg) {
                        account.getOrg.deferred = $q.defer();
                        var org = mockOrgs.filter(function(o) {
                            return o.id === arg;
                        })[0];
                        account.getOrg.deferred.resolve(org);
                        return account.getOrg.deferred.promise;
                    });

                    account.getOrgs.deferred = $q.defer();
                    account.getOrgs.and.returnValue(account.getOrgs.deferred.promise);

                    SitesService.getSites.deferred = $q.defer();
                    SitesService.getSites.and.returnValue(SitesService.getSites.deferred.promise);

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
                    // $scope.data = {
                    //     appData: appData
                    // };

                    SitesCtrl = $controller('SitesController', {
                        $log: $log,
                        $scope: $scope,
                        account: account,
                        SitesService: SitesService,
                        ConfirmDialogService: ConfirmDialogService
                    });
                });
            });

            describe('initialization', function() {
                it('should exist', function() {
                    expect(SitesCtrl).toBeDefined();
                });

                it('should load Sites form service', function() {
                    expect(SitesService.getSites).toHaveBeenCalled();
                    expect(account.getOrgs).toHaveBeenCalled();
                });
            });

            describe('methods', function() {
                describe('filterData(query)', function() {
                    it('should match case-insensitively against name, domain, and org name', function() {
                        $scope.$apply(function() {
                            SitesService.getSites.deferred.resolve(angular.copy(mockSites));
                            account.getOrgs.deferred.resolve(angular.copy(mockOrgs));
                        });

                        expect(SitesCtrl.sites.length).toBe(3);

                        SitesCtrl.filterData('B'); // site 1's name only
                        expect(SitesCtrl.sites.length).toBe(1);
                        expect(SitesCtrl.sites[0].id).toBe('s-1');

                        SitesCtrl.filterData('ws.c'); // site 2's domain only
                        expect(SitesCtrl.sites.length).toBe(1);
                        expect(SitesCtrl.sites[0].id).toBe('s-2');

                        SitesCtrl.filterData('Org3'); // site 3's org name only
                        expect(SitesCtrl.sites.length).toBe(1);
                        expect(SitesCtrl.sites[0].id).toBe('s-3');

                        SitesCtrl.filterData('xxx');
                        expect(SitesCtrl.sites.length).toBe(0);

                        SitesCtrl.filterData('');
                        expect(SitesCtrl.sites.length).toBe(3);
                    });
                });

                describe('editSite(site)', function() {
                    beforeEach(function() {
                        $scope.$apply(function() {
                            SitesService.getSites.deferred.resolve(angular.copy(mockSites));
                            account.getOrgs.deferred.resolve(angular.copy(mockOrgs));
                        });

                        SitesCtrl.editSite(SitesCtrl.sites[0]);
                    });

                    it('should null any existing messages and set the action to "edit"', function() {
                        expect($scope.message).toBe(null);
                        expect(SitesCtrl.action).toBe('edit');
                    });

                    it('should put site model and org on SitesCtrl', function() {
                        expect(SitesCtrl.site).toEqual({
                            id: 's-1',
                            status: 'active',
                            created: '2014-06-13T19:28:39.408Z',
                            lastUpdated: '2014-06-13T19:28:39.408Z',
                            org: {
                                id: 'o-112',
                                name: 'Org2'
                            },
                            branding: 'site1_branding',
                            placementId: '111111',
                            name: 'Best Website Ever',
                            host: 'bestever.com'
                        });
                    });
                });

                describe('addNewSite()', function() {
                    it('should null any existing message and set the action to "new"', function() {
                        SitesCtrl.addNewSite();

                        expect($scope.message).toBe(null);
                        expect(SitesCtrl.action).toBe('new');
                    });

                    it('should null the org and initialize site model with default status of "active"', function() {
                        SitesCtrl.addNewSite();

                        expect(SitesCtrl.org).toBe(null);
                        expect(SitesCtrl.site).toEqual({
                            status: 'active'
                        });
                    });
                });

                describe('saveSite(site)', function() {
                    describe('when editing existing site', function() {
                        beforeEach(function() {
                            $scope.$apply(function() {
                                SitesService.getSites.deferred.resolve(angular.copy(mockSites));
                                account.getOrgs.deferred.resolve(angular.copy(mockOrgs));
                            });

                            SitesCtrl.editSite(SitesCtrl.sites[0]);
                        });

                        it('should PUT the site', function() {
                            SitesCtrl.saveSite(SitesCtrl.site);

                            expect(SitesService.putSite).toHaveBeenCalledWith('s-1', {
                                status: 'active',
                                org: 'o-112',
                                branding: 'site1_branding',
                                placementId: '111111',
                                name: 'Best Website Ever',
                                host: 'bestever.com'
                            });

                            SitesCtrl.site.branding = 'test_branding';
                            SitesCtrl.site.name = 'Test Name';
                            SitesCtrl.site.placementId = '';
                            SitesCtrl.site.host = 'test.com';
                            SitesCtrl.site.status = 'inactive';
                            SitesCtrl.org = { id: 'o-999', name: 'New Org' };

                            SitesService.putSite.calls.reset();

                            SitesCtrl.saveSite(SitesCtrl.site);

                            expect(SitesService.putSite).toHaveBeenCalledWith('s-1', {
                                status: 'inactive',
                                org: 'o-999',
                                branding: 'test_branding',
                                placementId: '',
                                name: 'Test Name',
                                host: 'test.com'
                            });
                        });

                        it('should return to All Sites view on successful save', function() {
                            SitesCtrl.saveSite(SitesCtrl.site);

                            SitesService.getSites.calls.reset();
                            account.getOrgs.calls.reset();

                            $scope.$apply(function() {
                                SitesService.putSite.deferred.resolve(SitesCtrl.site);
                            });

                            expect($scope.message).toBe('Successfully saved Site: Best Website Ever');
                            expect(SitesCtrl.action).toBe('all');

                            expect(SitesService.getSites).toHaveBeenCalled();
                            expect(account.getOrgs).toHaveBeenCalled();
                        });

                        it('should display an error dialog on failure', function() {
                            SitesCtrl.saveSite(SitesCtrl.site);

                            $scope.$apply(function() {
                                SitesService.putSite.deferred.reject('Error message');
                            });

                            expect(ConfirmDialogService.display).toHaveBeenCalled();
                            expect(ConfirmDialogService.display.calls.mostRecent().args[0].prompt).toBe('There was a problem saving the Site. Error message.');
                        });
                    });

                    describe('when creating a new site', function() {
                        beforeEach(function() {
                            SitesCtrl.addNewSite();

                            SitesCtrl.site.name = 'New Site';
                            SitesCtrl.site.branding = 'new_site';
                            SitesCtrl.site.host = 'newsite.com';
                            SitesCtrl.org = { id: 'o-1', name: 'Org1' };
                        });

                        it('should POST the site', function() {
                            SitesCtrl.saveSite(SitesCtrl.site);

                            expect(SitesService.postSite).toHaveBeenCalledWith({
                                status: 'active',
                                org: 'o-1',
                                branding: 'new_site',
                                placementId: undefined,
                                name: 'New Site',
                                host: 'newsite.com'
                            });
                        });

                        it('should return to All Sites view on successful save', function() {
                            SitesCtrl.saveSite(SitesCtrl.site);

                            SitesService.getSites.calls.reset();
                            account.getOrgs.calls.reset();

                            $scope.$apply(function() {
                                SitesService.postSite.deferred.resolve(SitesCtrl.site);
                            });

                            expect($scope.message).toBe('Successfully saved Site: New Site');
                            expect(SitesCtrl.action).toBe('all');

                            expect(SitesService.getSites).toHaveBeenCalled();
                            expect(account.getOrgs).toHaveBeenCalled();
                        });

                        it('should display an error dialog on failure', function() {
                            SitesCtrl.saveSite(SitesCtrl.site);

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
                            SitesService.getSites.deferred.resolve(angular.copy(mockSites));
                            account.getOrgs.deferred.resolve(angular.copy(mockOrgs));
                        });

                        SitesCtrl.editSite(SitesCtrl.sites[0]);

                        SitesCtrl.confirmDelete();

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

                                SitesService.getSites.calls.reset();
                                account.getOrgs.calls.reset();

                                $scope.$apply(function() {
                                    SitesService.deleteSite.deferred.resolve();
                                });

                                expect($scope.message).toBe('Successfully deleted Site: Best Website Ever');
                                expect(SitesCtrl.action).toBe('all');
                                expect(SitesService.getSites).toHaveBeenCalled();
                                expect(account.getOrgs).toHaveBeenCalled();
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
                            expect(SitesCtrl.action).toBe('edit');
                        });
                    });
                });
            });

            describe('$scope.doSort()', function() {
                it('should sort', function() {
                    $scope.doSort('domain');
                    expect($scope.sort).toEqual({column:'domain',descending:false});
                    $scope.doSort('domain');
                    expect($scope.sort).toEqual({column:'domain',descending:true});
                    $scope.doSort('org.name');
                    expect($scope.sort).toEqual({column:'org.name',descending:false});
                    $scope.doSort('branding');
                    expect($scope.sort).toEqual({column:'branding',descending:false});
                });
            });
        });
    });
}());