(function() {
    'use strict';

    define(['app'], function(proshop) {
        describe('GroupsController', function() {
            var $rootScope,
                $scope,
                $controller,
                $log,
                $q,
                $location,
                GroupsCtrl,
                GroupsService,
                mockGroups;

            beforeEach(function() {
                module(proshop.name);

                GroupsService = {
                    getGroups: jasmine.createSpy('GroupsService.getGroups')
                };

                /* jsHint quotmark:false */
                mockGroups = [
                    {
                        "id": "g-111",
                        "name": "Group Number 1",
                        "categories": [
                            "sports",
                            "people_blogs"
                        ],
                        "miniReels": [
                            "e-111",
                            "e-112"
                        ],
                        "created": "2014-06-13T19:28:39.408Z",
                        "lastUpdated": "2014-06-13T19:28:39.408Z"
                    },
                    {
                        "id": "g-112",
                        "name": "Tech Group",
                        "categories": [
                            "technology"
                        ],
                        "miniReels": [],
                        "created": "2014-06-13T19:28:39.408Z",
                        "lastUpdated": "2014-06-13T19:28:39.408Z"
                    },
                    {
                        "id": "g-113",
                        "name": "Another Group",
                        "categories": [
                            "music",
                            "people_blogs"
                        ],
                        "miniReels": [
                            "e-114",
                            "e-113",
                            "e-111"
                        ],
                        "created": "2014-06-13T19:28:39.408Z",
                        "lastUpdated": "2014-06-13T19:28:39.408Z"
                    }
                ];
                /* jshint quotmark:single */

                inject(function($injector) {
                    $rootScope = $injector.get('$rootScope');
                    $controller = $injector.get('$controller');
                    $location = $injector.get('$location');
                    $log = $injector.get('$log');
                    $q = $injector.get('$q');
                });

                GroupsService.getGroups.deferred = $q.defer();
                GroupsService.getGroups.and.returnValue(GroupsService.getGroups.deferred.promise);

                $log.context = function() { return $log; }

                $scope = $rootScope.$new();

                GroupsCtrl = $controller('GroupsController', {
                    $log: $log,
                    $scope: $scope,
                    GroupsService: GroupsService
                });
            });

            describe('initialization', function() {
                it('should exist', function() {
                    expect(GroupsCtrl).toBeDefined();
                });

                it('should load all groups', function() {
                    expect(GroupsService.getGroups).toHaveBeenCalled();
                });
            });

            describe('properties', function() {
                describe('loading', function() {
                    it('should be true on initialization', function() {
                        expect(GroupsCtrl.loading).toBe(true);
                    });

                    it('should be false after all data promises resolve', function() {
                        $scope.$apply(function() {
                            GroupsService.getGroups.deferred.resolve(angular.copy(mockGroups));
                        });

                        expect(GroupsCtrl.loading).toBe(false);
                    });

                    it('should be false even if there are errors loading data', function() {
                        $scope.$apply(function() {
                            GroupsService.getGroups.deferred.reject();
                        });

                        expect(GroupsCtrl.loading).toBe(false);
                    });
                });
            });

            describe('methods', function() {
                describe('filterData(query)', function() {
                    it('should match case-insensitively against name, domain, and org name', function() {
                        $scope.$apply(function() {
                            GroupsService.getGroups.deferred.resolve(angular.copy(mockGroups));
                        });

                        expect(GroupsCtrl.groups.length).toBe(3);

                        GroupsCtrl.filterData('B'); // group 1's name only
                        expect(GroupsCtrl.groups.length).toBe(1);
                        expect(GroupsCtrl.groups[0].id).toBe('g-111');

                        GroupsCtrl.filterData('a'); // group 3's name only
                        expect(GroupsCtrl.groups.length).toBe(1);
                        expect(GroupsCtrl.groups[0].id).toBe('g-113');

                        GroupsCtrl.filterData('n'); // group 1 and 3 name only
                        expect(GroupsCtrl.groups.length).toBe(2);

                        GroupsCtrl.filterData('xxx');
                        expect(GroupsCtrl.groups.length).toBe(0);

                        GroupsCtrl.filterData('');
                        expect(GroupsCtrl.groups.length).toBe(3);
                    });
                });
            });

            describe('$scope.doSort()', function() {
                it('should sort', function() {
                    $scope.doSort('categories');
                    expect($scope.sort).toEqual({column:'categories',descending:false});
                    $scope.doSort('categories');
                    expect($scope.sort).toEqual({column:'categories',descending:true});
                    $scope.doSort('name');
                    expect($scope.sort).toEqual({column:'name',descending:false});
                    $scope.doSort('miniReels.length');
                    expect($scope.sort).toEqual({column:'miniReels.length',descending:false});
                });
            });
        });
    });
}());