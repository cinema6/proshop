(function() {
    'use strict';

    define(['app','mixins/paginatedListController'], function(proshop, PaginatedListController) {
        describe('PaginatedListController', function() {
            var $rootScope,
                $scope,
                $q,
                Cinema6Service,
                scopePromise,
                mockResponse,
                PaginatedListCtrl;

            beforeEach(function() {
                module(proshop.name);

                Cinema6Service = {
                    getAll: jasmine.createSpy('Cinema6Service.getAll')
                };

                /* jsHint quotmark:false */
                mockResponse = {
                    meta: {
                        items: {
                            start: 1,
                            end: 3,
                            total: 3
                        }
                    },
                    data: [
                        {
                            "id": "a-111",
                            "adtechId": "12121212",
                            "name": "Ybrant",
                            "created": "2014-06-13T19:28:39.408Z",
                            "lastUpdated": "2015-01-12T18:06:52.877Z",
                            "defaultLinks": {
                                "Facebook": "http://facebook.com",
                                "Twitter": "http://twitter.com"
                            },
                            "defaultLogos": {
                                "Main": "http://example.com/logo.jpg"
                            },
                            "status": "active"
                        },
                        {
                            "id": "a-112",
                            "adtechId": "12121213",
                            "name": "DashBid",
                            "created": "2014-06-13T19:28:39.408Z",
                            "lastUpdated": "2014-06-13T19:28:39.408Z",
                            "defaultLinks": {
                                "Facebook": "http://facebook.com",
                                "Twitter": "http://twitter.com"
                            },
                            "defaultLogos": {
                                "logo1": "http://example.com/logo.jpg"
                            },
                            "status": "active"
                        },
                        {
                            "id": "a-113",
                            "adtechId": "12121233",
                            "name": "Adap.tv",
                            "created": "2014-06-13T19:28:39.408Z",
                            "lastUpdated": "2014-06-13T19:28:39.408Z",
                            "defaultLinks": {
                                "Facebook": "http://facebook.com",
                                "Twitter": "http://twitter.com"
                            },
                            "defaultLogos": {
                                "logo1": "http://example.com/logo.jpg"
                            },
                            "status": "active"
                        }
                    ]
                };
                /* jshint quotmark:single */

                inject(function($injector) {
                    $rootScope = $injector.get('$rootScope');
                    $q = $injector.get('$q');
                    scopePromise = $injector.get('scopePromise');

                    Cinema6Service.getAll.deferred = $q.defer();
                    Cinema6Service.getAll.and.returnValue(Cinema6Service.getAll.deferred.promise);

                    $scope = $rootScope.$new();
                    $scope.endpoint = 'advertisers';
                    $scope.sort = {
                        column: 'lastUpdated',
                        descending: true
                    };
                    $scope.$apply(function() {
                        PaginatedListCtrl = $injector.instantiate(PaginatedListController, {
                            $scope: $scope,
                            scopePromise: scopePromise,
                            Cinema6Service: Cinema6Service
                        });
                    });
                });
            });

            describe('initialization', function() {
                it('should be defined', function() {
                    expect(PaginatedListCtrl).toEqual(jasmine.any(Object));
                });

                it('should request data from the endpoint on the $scope', function() {
                    expect(Cinema6Service.getAll).toHaveBeenCalledWith('advertisers', jasmine.any(Object));
                });
            });

            describe('properties', function() {
                describe('loading', function() {
                    it('should be true on initialization', function() {
                        expect(PaginatedListCtrl.loading).toBe(true);
                    });

                    it('should be false after all data promises resolve', function() {
                        $scope.$apply(function() {
                            Cinema6Service.getAll.deferred.resolve(mockResponse);
                        });

                        expect(PaginatedListCtrl.loading).toBe(false);
                    });

                    it('should be false even if there are errors loading data', function() {
                        $scope.$apply(function() {
                            Cinema6Service.getAll.deferred.reject();
                        });

                        expect(PaginatedListCtrl.loading).toBe(false);
                    });
                });

                describe('data', function() {
                    it('should be the data from the request', function() {
                        $scope.$apply(function() {
                            Cinema6Service.getAll.deferred.resolve(mockResponse);
                        });

                        expect(PaginatedListCtrl.data).toEqual(mockResponse.data);
                    });
                });
            });

            describe('methods', function() {
                describe('search(query)', function() {
                    it('should set the page to 1', function() {
                        PaginatedListCtrl.page = 2;
                        PaginatedListCtrl.search('Ybrant');
                        expect(PaginatedListCtrl.page).toBe(1);
                    });

                    it('should query for advertisers', function() {
                        PaginatedListCtrl.search('Ybrant');
                        expect(Cinema6Service.getAll).toHaveBeenCalledWith('advertisers', jasmine.objectContaining({text: 'Ybrant'}));
                    });

                    it('should remove the bound query value if page === 1', function() {
                        $scope.query = 'Ybrant';
                        PaginatedListCtrl.page = 1;
                        PaginatedListCtrl.search($scope.query);
                        expect($scope.query).toBe('');
                    });

                    it('should trigger a $digest cycle if page !== 1', function() {
                        PaginatedListCtrl.page = 2;
                        $scope.$digest();

                        $scope.query = 'Ybrant';
                        PaginatedListCtrl.search($scope.query);

                        expect($scope.query).toBe('Ybrant');
                        expect(PaginatedListCtrl.page).toBe(1);

                        $scope.$digest();
                        expect($scope.query).toBe('');
                    });
                });
            });

            describe('$scope.doSort()', function() {
                it('should request sorted advertisers', function() {
                    PaginatedListCtrl.doSort('adtechId');
                    expect($scope.sort).toEqual({column:'adtechId',descending:false});
                    expect(Cinema6Service.getAll).toHaveBeenCalledWith('advertisers', jasmine.objectContaining({sort: 'adtechId,-1'}));

                    PaginatedListCtrl.doSort('adtechId');
                    expect($scope.sort).toEqual({column:'adtechId',descending:true});
                    expect(Cinema6Service.getAll).toHaveBeenCalledWith('advertisers', jasmine.objectContaining({sort: 'adtechId,1'}));

                    PaginatedListCtrl.doSort('name');
                    expect($scope.sort).toEqual({column:'name',descending:false});
                    expect(Cinema6Service.getAll).toHaveBeenCalledWith('advertisers', jasmine.objectContaining({sort: 'name,-1'}));

                    PaginatedListCtrl.doSort('active');
                    expect($scope.sort).toEqual({column:'active',descending:false});
                    expect(Cinema6Service.getAll).toHaveBeenCalledWith('advertisers', jasmine.objectContaining({sort: 'active,-1'}));
                });
            });

            describe('$watch', function() {
                describe('page', function() {
                    it('should query for advertisers when page changes', function() {
                        PaginatedListCtrl.page = 1;
                        PaginatedListCtrl.limit = 10;
                        $scope.$digest();

                        PaginatedListCtrl.page = 2;
                        $scope.$digest();

                        expect(Cinema6Service.getAll).toHaveBeenCalledWith('advertisers', jasmine.objectContaining({limit: 10, skip: 10}));

                        PaginatedListCtrl.page = 3;
                        $scope.$digest();

                        expect(Cinema6Service.getAll).toHaveBeenCalledWith('advertisers', jasmine.objectContaining({limit: 10, skip: 20}));
                    });
                });

                describe('limit', function() {
                    it('should query for advertiser when changed', function() {
                        PaginatedListCtrl.page = 1;
                        PaginatedListCtrl.limit = 10;
                        $scope.$digest();

                        PaginatedListCtrl.limit = 20;
                        $scope.$digest();

                        expect(Cinema6Service.getAll).toHaveBeenCalledWith('advertisers', jasmine.objectContaining({limit: 20}));

                        PaginatedListCtrl.limit = 30;
                        $scope.$digest();

                        expect(Cinema6Service.getAll).toHaveBeenCalledWith('advertisers', jasmine.objectContaining({limit: 30}));
                    });
                });
            });
        });
    });
}());