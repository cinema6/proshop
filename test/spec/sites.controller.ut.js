(function() {

    'user strict';

    define(['app'], function() {
        describe('SitesController', function() {
            var $rootScope,
                $scope,
                $controller,
                $q,
                $log,
                $location,
                SitesCtrl,
                SitesService,
                account,
                mockSites,
                mockOrgs;

            beforeEach(function() {
                module('c6.proshop');

                account = {
                    getOrg: jasmine.createSpy('account.getOrg'),
                    getOrgs: jasmine.createSpy('account.getOrgs'),
                };

                SitesService = {
                    getSites: jasmine.createSpy('SitesService.getSites'),
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
                        "wildCardPlacement": "121212",
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
                    $location = $injector.get('$location');

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

                    $log.context = function(){ return $log; }

                    $scope = $rootScope.$new();

                    SitesCtrl = $controller('SitesController', {
                        $log: $log,
                        $scope: $scope,
                        account: account,
                        SitesService: SitesService
                    });
                });
            });

            describe('initialization', function() {
                it('should exist', function() {
                    expect(SitesCtrl).toBeDefined();
                });

                it('should load Sites from service', function() {
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

                describe('addNewSite()', function() {
                    it('should redirect to /sites/new', function() {
                        spyOn($location, 'path');

                        SitesCtrl.addNewSite();

                        expect($location.path).toHaveBeenCalledWith('/sites/new');
                    });
                });
            });

            describe('properties', function() {
                describe('loading', function() {
                    it('should be true on initialization', function() {
                        expect(SitesCtrl.loading).toBe(true);
                    });

                    it('should be false after all data promises resolve', function() {
                        $scope.$apply(function() {
                            SitesService.getSites.deferred.resolve(angular.copy(mockSites));
                            account.getOrgs.deferred.resolve(angular.copy(mockOrgs));
                        });

                        expect(SitesCtrl.loading).toBe(false);
                    });

                    it('should be false even if there are errors loading data', function() {
                        $scope.$apply(function() {
                            SitesService.getSites.deferred.reject();
                            account.getOrgs.deferred.reject();
                        });

                        expect(SitesCtrl.loading).toBe(false);
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