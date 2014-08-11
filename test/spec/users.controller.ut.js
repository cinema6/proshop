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
                mockUsers,
                ConfirmDialogService;

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
                    postUser: jasmine.createSpy('account.postUser'),
                    deleteUser: jasmine.createSpy('account.deleteUser')
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
                        branding: 'theme1',
                        type: 'Publisher'
                    },
                    {
                        id: 'u-2',
                        email: 'mail@e.net',
                        firstName: 'B',
                        lastName: 'D',
                        org: 'o-2',
                        branding: 'theme2',
                        type: 'Publisher'
                    }
                ];

                ConfirmDialogService = {
                    display: jasmine.createSpy('ConfirmDialogService.display()')
                };

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

                    account.deleteUser.deferred = $q.defer();
                    account.deleteUser.and.returnValue(account.deleteUser.deferred.promise);


                    $log.context = function(){ return $log; }

                    $scope = $rootScope.$new();
                    $scope.data = {
                        appData: appData
                    };

                    UsersCtrl = $controller('UsersController', {
                        $log: $log,
                        $scope: $scope,
                        account: account,
                        ConfirmDialogService: ConfirmDialogService
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

                    it('should handle defaults', function() {
                        $scope.$apply(function() {
                            account.getOrgs.deferred.resolve(angular.copy(mockOrgs));
                            account.getUsers.deferred.resolve(angular.copy(mockUsers));
                        });

                        var userWithNoConfig = angular.copy($scope.data.users[0]),
                            userWithConfig = angular.copy($scope.data.users[0]),
                            userWithNoBranding = angular.copy($scope.data.users[0]),
                            userWithBranding = angular.copy($scope.data.users[0]),
                            userWithType = angular.copy($scope.data.users[0]),
                            userWithNoType = angular.copy($scope.data.users[0]),
                            defaultConfig = {
                                minireelinator: {
                                    minireelDefaults: {
                                        splash: {
                                            ratio: '3-2',
                                            theme: 'img-text-overlay'
                                        }
                                    }
                                }
                            };

                        // user with no config block
                        UsersCtrl.editUser(userWithNoConfig);
                        expect($scope.data.user.config).toEqual(defaultConfig);

                        delete userWithNoConfig.config;
                        $scope.data.org.config = {
                            minireelinator: {
                                minireelDefaults: {
                                    splash: {
                                        ratio: '6-5',
                                        theme: 'img-only'
                                    }
                                }
                            }
                        };
                        UsersCtrl.editUser(userWithNoConfig);
                        expect($scope.data.user.config).toEqual({
                            minireelinator: {
                                minireelDefaults: {
                                    splash: {
                                        ratio: '6-5',
                                        theme: 'img-only'
                                    }
                                }
                            }
                        });

                        // user with config block and minireelinator block
                        userWithConfig.config = {
                            minireelinator: {
                                minireelDefaults: {
                                    splash: {
                                        ratio: '16-9',
                                        theme: 'text-only'
                                    }
                                }
                            }
                        };
                        UsersCtrl.editUser(userWithConfig);
                        expect($scope.data.user.config).toEqual({
                            minireelinator: {
                                minireelDefaults: {
                                    splash: {
                                        ratio: '16-9',
                                        theme: 'text-only'
                                    }
                                }
                            }
                        });

                        // userWithNoBranding
                        delete userWithNoBranding.branding;
                        delete $scope.data.org.branding;
                        UsersCtrl.editUser(userWithNoBranding);
                        expect($scope.data.user.branding).toBe(undefined);

                        $scope.data.org.branding = 'test_brand';
                        UsersCtrl.editUser(userWithNoBranding);
                        expect($scope.data.user.branding).toBe('test_brand');

                        // user with branding (from mockUser above)
                        userWithBranding.branding = 'different_brand';
                        $scope.data.org.branding = 'some_org_brand';
                        UsersCtrl.editUser(userWithBranding);
                        expect($scope.data.user.branding).toBe('different_brand');

                        // user with type
                        userWithType.type = 'ContentPublisher';
                        UsersCtrl.editUser(userWithType);
                        expect($scope.data.user.type).toBe('ContentPublisher');

                        delete userWithNoType.type;
                        UsersCtrl.editUser(userWithNoType);
                        expect($scope.data.user.type).toBe('Publisher');
                    });
                });

                describe('addNewUser()', function() {
                    it('should set the action to edit and and clear any user or org data', function() {
                        UsersCtrl.addNewUser();

                        expect(UsersCtrl.action).toBe('new');
                        expect($scope.data.user).toEqual({});
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
                                branding: $scope.data.users[0].branding,
                                config: $scope.data.users[0].config,
                                type: $scope.data.users[0].type
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

                        it('on error should stay on the edit page and display an error dialog', function() {
                            UsersCtrl.saveUser();

                            expect($scope.message).toBe(null);

                            $scope.$apply(function() {
                                account.putUser.deferred.reject();
                            });

                            expect(ConfirmDialogService.display).toHaveBeenCalled();
                        });
                    });

                    describe('when creating a user', function() {
                        beforeEach(function() {
                            $scope.$apply(function() {
                                account.getOrgs.deferred.resolve(angular.copy(mockOrgs));
                                account.getUsers.deferred.resolve(angular.copy(mockUsers));
                            });

                            UsersCtrl.addNewUser();

                            $scope.data.user.email = 'foo@bar.com';
                            $scope.data.user.password = 'secret';
                            $scope.data.user.firstName = 'Test';
                            $scope.data.user.lastName = 'Name';
                            $scope.data.org = $scope.data.orgs[0];
                            $scope.$digest();
                        });

                        it('should POST the user', function() {
                            UsersCtrl.saveUser();

                            expect(account.postUser).toHaveBeenCalledWith({
                                email: $scope.data.user.email,
                                password: $scope.data.user.password,
                                firstName: $scope.data.user.firstName,
                                lastName: $scope.data.user.lastName,
                                org: $scope.data.org.id,
                                branding: $scope.data.user.branding,
                                config: $scope.data.user.config,
                                type: $scope.data.users[0].type
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

                            expect(ConfirmDialogService.display).toHaveBeenCalled();
                        });
                    });
                });

                describe('deleteUser(user)', function() {
                    beforeEach(function() {
                        $scope.$apply(function() {
                            account.getOrgs.deferred.resolve(angular.copy(mockOrgs));
                            account.getUsers.deferred.resolve(angular.copy(mockUsers));
                        });

                        UsersCtrl.editUser($scope.data.users[0]);
                    });

                    it('should DELETE the user', function() {
                        UsersCtrl.deleteUser();

                        expect(account.deleteUser).toHaveBeenCalledWith($scope.data.users[0]);
                    });

                    it('on success should', function() {
                        UsersCtrl.deleteUser();

                        expect($scope.message).toBe(null);
                        expect(account.getOrgs.calls.count()).toBe(1);
                        expect(account.getUsers.calls.count()).toBe(1);

                        $scope.$apply(function() {
                            account.deleteUser.deferred.resolve();
                        });

                        expect($scope.message).toBe('Successfully deleted user: ' + $scope.data.user.email);
                        expect(account.getOrgs.calls.count()).toBe(2);
                        expect(account.getUsers.calls.count()).toBe(2);
                        expect(UsersCtrl.action).toBe('all');
                    });

                    it('on error', function() {
                        UsersCtrl.deleteUser();

                        $scope.$apply(function() {
                            account.deleteUser.deferred.reject();
                        });

                        expect(UsersCtrl.action).toBe('edit');
                        expect($scope.message).toBe('There was a problem deleting this user.');
                    });
                });
            });
        });
    });
}());