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
                    getUsers: jasmine.createSpy('account.getUsers'),
                    putUser: jasmine.createSpy('account.putUser'),
                    postUser: jasmine.createSpy('account.postUser')
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
                        branding: 'theme1'
                    },
                    {
                        id: 'u-2',
                        email: 'mail@e.net',
                        firstName: 'B',
                        lastName: 'D',
                        org: 'o-2',
                        branding: 'theme2'
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

                    account.getUsers.deferred = $q.defer();
                    account.getUsers.and.returnValue(account.getUsers.deferred.promise);

                    account.putUser.deferred = $q.defer();
                    account.putUser.and.returnValue(account.putUser.deferred.promise);

                    account.postUser.deferred = $q.defer();
                    account.postUser.and.returnValue(account.postUser.deferred.promise);


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

                describe('saveUser()', function() {
                    describe('when updating a user', function() {
                        beforeEach(function() {
                            $scope.$apply(function() {
                                account.getOrgs.deferred.resolve(angular.copy(mockOrgs));
                                account.getUsers.deferred.resolve(angular.copy(mockUsers));
                            });

                            UsersCtrl.editUser($scope.data.users[0]);
                        });

                        it('should PUT the user', function() {
                            UsersCtrl.saveUser();

                            expect(account.putUser).toHaveBeenCalledWith({
                                id: $scope.data.users[0].id,
                                firstName: $scope.data.users[0].firstName,
                                lastName: $scope.data.users[0].lastName,
                                org: $scope.data.users[0].org.id,
                                branding: $scope.data.users[0].branding
                            });
                        });

                        it('on success should put a message on the scope, set the action, and reload org and user data', function() {
                            UsersCtrl.saveUser();

                            expect($scope.message).toBe(null);
                            expect(account.getOrgs.calls.count()).toBe(1);
                            expect(account.getUsers.calls.count()).toBe(1);

                            $scope.$apply(function() {
                                account.putUser.deferred.resolve($scope.data.users[0]);
                            });

                            expect($scope.message).toBe('Successfully saved user: ' + $scope.data.user.email);
                            expect(account.getOrgs.calls.count()).toBe(2);
                            expect(account.getUsers.calls.count()).toBe(2);
                            expect(UsersCtrl.action).toBe('all');
                        });

                        it('on error should stay on the edit page and display an error message', function() {
                            UsersCtrl.saveUser();

                            expect($scope.message).toBe(null);

                            $scope.$apply(function() {
                                account.putUser.deferred.reject();
                            });

                            expect($scope.message).toBe('There was a problem creating this user.');
                        });
                    });

                    describe('when creating a user', function() {
                        beforeEach(function() {
                            $scope.$apply(function() {
                                account.getOrgs.deferred.resolve(angular.copy(mockOrgs));
                                account.getUsers.deferred.resolve(angular.copy(mockUsers));
                            });

                            UsersCtrl.addNewUser();

                            $scope.data.user = {};
                            $scope.data.user.email = 'foo@bar.com';
                            $scope.data.user.password = 'secret';
                            $scope.data.user.firstName = 'Test';
                            $scope.data.user.lastName = 'Name';
                            $scope.data.org = $scope.data.orgs[0];
                        });

                        it('should POST the user', function() {
                            UsersCtrl.saveUser();

                            expect(account.postUser).toHaveBeenCalledWith({
                                email: $scope.data.user.email,
                                password: $scope.data.user.password,
                                firstName: $scope.data.user.firstName,
                                lastName: $scope.data.user.lastName,
                                org: $scope.data.org.id,
                                branding: $scope.data.user.branding
                            });
                        });

                        it('on success should put a message on the scope, set the action, and reload org and user data', function() {
                            UsersCtrl.saveUser();

                            expect($scope.message).toBe(null);
                            expect(account.getOrgs.calls.count()).toBe(1);
                            expect(account.getUsers.calls.count()).toBe(1);

                            $scope.$apply(function() {
                                account.postUser.deferred.resolve($scope.data.user);
                            });

                            expect($scope.message).toBe('Successfully saved user: ' + $scope.data.user.email);
                            expect(account.getOrgs.calls.count()).toBe(2);
                            expect(account.getUsers.calls.count()).toBe(2);
                            expect(UsersCtrl.action).toBe('all');
                        });

                        it('on error should stay on the edit page and display an error message', function() {
                            UsersCtrl.saveUser();

                            expect($scope.message).toBe(null);

                            $scope.$apply(function() {
                                account.postUser.deferred.reject();
                            });

                            expect($scope.message).toBe('There was a problem creating this user.');
                        });
                    });
                });
            });
        });
    });
}());