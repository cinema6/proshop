(function() {
    'use strict';

    define(['users'], function() {
        describe('UsersController', function() {
            var $rootScope,
                $scope,
                $controller,
                $location,
                $log,
                $q,
                UsersCtrl,
                account,
                mockOrgs,
                mockUsers;

            beforeEach(function() {
                module('c6.proshop');

                account = {
                    getOrg: jasmine.createSpy('account.getOrg'),
                    getOrgs: jasmine.createSpy('account.getOrgs'),
                    getUsers: jasmine.createSpy('account.getUsers'),
                };

                mockOrgs = [
                    {
                        id: 'o-1',
                        name: 'Org1'
                    },
                    {
                        id: 'o-2',
                        name: 'Org2'
                    }
                ];

                mockUsers = [
                    {
                        id: 'u-1',
                        email: 'e@mail.com',
                        firstName: 'J',
                        lastName: 'F',
                        org: 'o-1',
                        type: 'Publisher',
                        status: 'active'
                    },
                    {
                        id: 'u-2',
                        email: 'mail@e.net',
                        firstName: 'B',
                        lastName: 'D',
                        org: 'o-2',
                        type: 'Publisher',
                        status: 'active'
                    }
                ];

                inject(function($injector) {
                    $controller = $injector.get('$controller');
                    $log = $injector.get('$log');
                    $q = $injector.get('$q');
                    $location = $injector.get('$location');
                    $rootScope = $injector.get('$rootScope');

                    spyOn($location, 'path');

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

                    account.getUsers.deferred = $q.defer();
                    account.getUsers.and.returnValue(account.getUsers.deferred.promise);

                    $log.context = function(){ return $log; }

                    $scope = $rootScope.$new();

                    UsersCtrl = $controller('UsersController', {
                        $log: $log,
                        $scope: $scope,
                        $location: $location,
                        account: account
                    });
                });
            });

            describe('initialization', function() {
                it('should exist', function() {
                    expect(UsersCtrl).toBeDefined();
                });

                it('should call the account service to get all users and orgs', function() {
                    expect(account.getOrgs).toHaveBeenCalled();
                    expect(account.getUsers).toHaveBeenCalled();
                });

                it('should put the orgs and users data on the Ctrl', function() {
                    $scope.$apply(function() {
                        account.getUsers.deferred.resolve(angular.copy(mockUsers));
                        account.getOrgs.deferred.resolve(angular.copy(mockOrgs));
                    });

                    expect(UsersCtrl.orgs).toEqual(mockOrgs);
                    expect(UsersCtrl.users[0].org).toEqual(mockOrgs[0]);
                });

                it('should add the org document to the user object', function() {
                    $scope.$apply(function() {
                        account.getUsers.deferred.resolve(angular.copy(mockUsers));
                        account.getOrgs.deferred.resolve(angular.copy(mockOrgs));
                    });

                    expect(UsersCtrl.users[0].org).toEqual(mockOrgs[0]);

                    expect(UsersCtrl.users[1].org).toEqual(mockOrgs[1]);
                });
            });

            describe('$scope.doSort()', function() {
                it('should sort', function() {
                    $scope.doSort('lastName');
                    expect($scope.sort).toEqual({column:'lastName',descending:false});
                    $scope.doSort('lastName');
                    expect($scope.sort).toEqual({column:'lastName',descending:true});
                    $scope.doSort('org.name');
                    expect($scope.sort).toEqual({column:'org.name',descending:false});
                    $scope.doSort('email');
                    expect($scope.sort).toEqual({column:'email',descending:false});
                });
            });

            describe('methods', function() {
                describe('addNewUser()', function() {
                    it('should set the action to edit and and clear any user or org data', function() {
                        UsersCtrl.addNewUser();

                        expect($location.path).toHaveBeenCalledWith('/user/new');
                    });
                });

                describe('filterData()', function() {
                    it('should match case-insensitively against email, first & last name, and org name', function() {
                        $scope.$apply(function() {
                            account.getOrgs.deferred.resolve(angular.copy(mockOrgs));
                            account.getUsers.deferred.resolve(angular.copy(mockUsers));
                        });

                        expect(UsersCtrl.users.length).toBe(2);

                        UsersCtrl.filterData('j'); // user1's firstname only
                        expect(UsersCtrl.users.length).toBe(1);
                        expect(UsersCtrl.users[0].id).toBe('u-1');

                        UsersCtrl.filterData('N'); // user2's email only
                        expect(UsersCtrl.users.length).toBe(1);
                        expect(UsersCtrl.users[0].id).toBe('u-2');

                        UsersCtrl.filterData('f'); // user2's lastname only
                        expect(UsersCtrl.users.length).toBe(1);
                        expect(UsersCtrl.users[0].id).toBe('u-1');

                        UsersCtrl.filterData('Org2'); // user2's lastname only
                        expect(UsersCtrl.users.length).toBe(1);
                        expect(UsersCtrl.users[0].id).toBe('u-2');

                        UsersCtrl.filterData('xxx');
                        expect(UsersCtrl.users.length).toBe(0);

                        UsersCtrl.filterData('');
                        expect(UsersCtrl.users.length).toBe(2);
                    });
                });
            });

            describe('properties', function() {
                describe('total', function() {
                    it('should be undefined by default', function() {
                        expect(UsersCtrl.total).toBe(undefined);
                    });

                    it('should be 1 if all results fit within the limit', function() {
                        UsersCtrl.limit = 5;
                        UsersCtrl.users = [{},{},{}];

                        expect(UsersCtrl.total).toBe(1);

                        UsersCtrl.users = [{},{},{},{},{},{},{}];

                        expect(UsersCtrl.total).toBe(2);

                        UsersCtrl.limit = 10;
                        expect(UsersCtrl.total).toBe(1);
                    });
                });

                describe('loading', function() {
                    it('should be true on initialization', function() {
                        expect(UsersCtrl.loading).toBe(true);
                    });

                    it('should be false after all data promises resolve', function() {
                        $scope.$apply(function() {
                            account.getOrgs.deferred.resolve(angular.copy(mockOrgs));
                            account.getUsers.deferred.resolve(angular.copy(mockUsers));
                        });

                        expect(UsersCtrl.loading).toBe(false);
                    });

                    it('should be false even if there are errors loading data', function() {
                        $scope.$apply(function() {
                            account.getOrgs.deferred.reject();
                            account.getUsers.deferred.reject();
                        });

                        expect(UsersCtrl.loading).toBe(false);
                    });
                });
            });

            describe('$watchers', function() {
                describe('page + limit', function() {
                    it('should set page to 1 if limit changes', function() {
                        UsersCtrl.limit = 50;
                        UsersCtrl.page = 2;

                        $scope.$digest();
                        expect(UsersCtrl.page).toBe(2);

                        UsersCtrl.limit = 10;
                        $scope.$digest();

                        expect(UsersCtrl.page).toBe(1);
                    });
                });
            });
        });
    });
}());