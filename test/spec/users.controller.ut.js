(function() {
    'use strict';

    define(['users'], function() {
        describe('UsersController', function() {
            var $rootScope,
                $scope,
                $controller,
                $log,
                $q,
                UsersCtrl,
                account,
                appData,
                mockOrgs,
                mockUsers;

            beforeEach(function() {
                module('c6.proshop');

                appData = {
                    appUser : null,
                    user: null, users: null, org: null, orgs: null
                };

                account = {
                    getOrg: jasmine.createSpy('account.getOrg'),
                    getOrgs: jasmine.createSpy('account.getOrgs'),
                    getUsers: jasmine.createSpy('account.getUsers')
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
                        org: 'o-1'
                    },
                    {
                        id: 'u-2',
                        email: 'mail@e.net',
                        firstName: 'B',
                        lastName: 'D',
                        org: 'o-2'
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
                    // account.getOrgs.and.returnValue($q.when(angular.copy(mockOrgs)));

                    account.getUsers.deferred = $q.defer();
                    account.getUsers.and.returnValue(account.getUsers.deferred.promise);
                    // account.getUsers.and.returnValue($q.when(angular.copy(mockUsers)));

                    $log.context = function(){ return $log; }

                    $scope = $rootScope.$new();
                    $scope.data = {
                        appData: appData
                    };

                    UsersCtrl = $controller('UsersController', {
                        $log: $log,
                        $scope: $scope,
                        account: account
                    });
                });
            });

            describe('initialization', function() {
                it('should exist', function() {
                    expect(UsersCtrl).toBeDefined();
                });

                it('should set some defaults', function() {
                    expect(UsersCtrl.action).toBe('all');
                    expect(UsersCtrl.showUserSettings).toBe(false);
                });

                it('should call the account service to get all users and orgs', function() {
                    expect(account.getOrgs).toHaveBeenCalled();
                    expect(account.getUsers).toHaveBeenCalled();
                });

                it('should put the orgs and users data on the scope and appData', function() {
                    $scope.$apply(function() {
                        account.getUsers.deferred.resolve(angular.copy(mockUsers));
                        account.getOrgs.deferred.resolve(angular.copy(mockOrgs));
                    });

                    expect($scope.data.orgs).toEqual(mockOrgs);
                    expect($scope.data.appData.orgs).toEqual(mockOrgs);

                    expect($scope.data.users[0].org).toEqual(mockOrgs[0]);
                    expect($scope.data.appData.users[0].org).toEqual(mockOrgs[0]);
                });

                it('should add the org document to the user object', function() {
                    $scope.$apply(function() {
                        account.getUsers.deferred.resolve(angular.copy(mockUsers));
                        account.getOrgs.deferred.resolve(angular.copy(mockOrgs));
                    });

                    expect($scope.data.users[0].org).toEqual(mockOrgs[0]);
                    expect($scope.data.appData.users[0].org).toEqual(mockOrgs[0]);

                    expect($scope.data.users[1].org).toEqual(mockOrgs[1]);
                    expect($scope.data.appData.users[1].org).toEqual(mockOrgs[1]);
                });
            });

            describe('methods', function() {
                describe('editUser(user)', function() {
                    it('should set the action to edit and put the user and org on the scope', function() {
                        $scope.$apply(function() {
                            account.getOrgs.deferred.resolve(angular.copy(mockOrgs));
                            account.getUsers.deferred.resolve(angular.copy(mockUsers));
                        });

                        UsersCtrl.editUser($scope.data.users[0]);

                        expect(UsersCtrl.action).toBe('edit');
                        expect($scope.data.user).toBe($scope.data.users[0]);
                        expect($scope.data.org).toEqual($scope.data.users[0].org);
                    });
                });

                describe('addNewUser()', function() {
                    it('should set the action to edit and and clear any user or org data', function() {
                        UsersCtrl.addNewUser();

                        expect(UsersCtrl.action).toBe('edit');
                        expect($scope.data.user).toBe(null);
                        expect($scope.data.org).toBe(null);
                    });
                });

                describe('filterData()', function() {
                    it('should match case-insensitively against email, first & last name, and org name', function() {
                        $scope.$apply(function() {
                            account.getOrgs.deferred.resolve(angular.copy(mockOrgs));
                            account.getUsers.deferred.resolve(angular.copy(mockUsers));
                        });

                        expect($scope.data.users.length).toBe(2);

                        $scope.data.query = 'j'; // user1's firstname only
                        UsersCtrl.filterData();
                        expect($scope.data.users.length).toBe(1);
                        expect($scope.data.users[0].id).toBe('u-1');

                        $scope.data.query = 'N'; // user2's email only
                        UsersCtrl.filterData();
                        expect($scope.data.users.length).toBe(1);
                        expect($scope.data.users[0].id).toBe('u-2');

                        $scope.data.query = 'f'; // user2's lastname only
                        UsersCtrl.filterData();
                        expect($scope.data.users.length).toBe(1);
                        expect($scope.data.users[0].id).toBe('u-1');

                        $scope.data.query = 'Org2'; // user2's lastname only
                        UsersCtrl.filterData();
                        expect($scope.data.users.length).toBe(1);
                        expect($scope.data.users[0].id).toBe('u-2');

                        $scope.data.query = 'xxx';
                        UsersCtrl.filterData();
                        expect($scope.data.users.length).toBe(0);

                        $scope.data.query = '';
                        UsersCtrl.filterData();
                        expect($scope.data.users.length).toBe(2);
                    });
                });
            });
        });
    });
}());