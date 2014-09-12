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
                        type: 'Publisher',
                    },
                    {
                        id: 'u-2',
                        email: 'mail@e.net',
                        firstName: 'B',
                        lastName: 'D',
                        org: 'o-2',
                        branding: 'theme2',
                        type: 'Publisher',
                    }
                ];

                ConfirmDialogService = {
                    display: jasmine.createSpy('ConfirmDialogService.display()'),
                    close: jasmine.createSpy('ConfirmDialogService.close()')
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
                    });

                    it('should set the editAdConfigOptions if user permissions are set', function() {
                        $scope.$apply(function() {
                            account.getOrgs.deferred.resolve(angular.copy(mockOrgs));
                            account.getUsers.deferred.resolve(angular.copy(mockUsers));
                        });

                        $scope.data.users[0].permissions = {
                            orgs: {
                                editAdConfig: 'own'
                            },
                            experiences: {
                                editAdConfig: 'org'
                            }
                        };

                        UsersCtrl.editUser($scope.data.users[0]);

                        expect(UsersCtrl.editAdConfigOptions[0].enabled).toBe(true);
                        expect(UsersCtrl.editAdConfigOptions[1].enabled).toBe(true);
                    });
                });

                describe('addNewUser()', function() {
                    it('should set the action to edit and and clear any user or org data', function() {
                        UsersCtrl.addNewUser();

                        expect(UsersCtrl.action).toBe('new');
                        expect(UsersCtrl.role).toBe(null);
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
                                type: $scope.data.users[0].type,
                                permissions: {
                                    elections: {
                                        read    : 'org',
                                        create  : 'org',
                                        edit    : 'org',
                                        delete  : 'org'
                                    },
                                    experiences: {
                                        read    : 'org',
                                        create  : 'org',
                                        edit    : 'org',
                                        delete  : 'org'
                                    },
                                    users: {
                                        read    : 'org',
                                        edit    : 'own'
                                    },
                                    orgs: {
                                        read    : 'own',
                                        edit    : 'own'
                                    }
                                }
                            });
                        });

                        describe('when role is Admin', function() {
                            it('should POST permissions with scope of "all" and enable the editaAdConfig settings', function() {
                                UsersCtrl.role = 'Admin';

                                UsersCtrl.saveUser();

                                expect(account.putUser.calls.mostRecent().args[0].type).toEqual('Publisher');
                                expect(account.putUser.calls.mostRecent().args[0].permissions).toEqual({
                                    elections: {
                                        read    : 'all',
                                        create  : 'all',
                                        edit    : 'all',
                                        delete  : 'all'
                                    },
                                    experiences: {
                                        read    : 'all',
                                        create  : 'all',
                                        edit    : 'all',
                                        delete  : 'all',
                                        editAdConfig: 'all'
                                    },
                                    users: {
                                        read    : 'all',
                                        create  : 'all',
                                        edit    : 'all',
                                        delete  : 'all'
                                    },
                                    orgs: {
                                        read    : 'all',
                                        create  : 'all',
                                        edit    : 'all',
                                        delete  : 'all',
                                        editAdConfig: 'all'
                                    }
                                });
                            });
                        });

                        describe('when role is Publisher', function() {
                            it('should POST the editAdConfig settings if set', function() {
                                UsersCtrl.role = 'Publisher';

                                UsersCtrl.editAdConfigOptions[0].enabled = true;
                                UsersCtrl.editAdConfigOptions[1].enabled = true;

                                UsersCtrl.saveUser();

                                expect(account.putUser.calls.mostRecent().args[0].permissions.experiences.editAdConfig).toEqual('org');
                                expect(account.putUser.calls.mostRecent().args[0].permissions.orgs.editAdConfig).toEqual('own');
                                expect(account.putUser.calls.mostRecent().args[0].type).toEqual('Publisher');

                                UsersCtrl.editAdConfigOptions[0].enabled = false;
                                UsersCtrl.editAdConfigOptions[1].enabled = false;

                                UsersCtrl.saveUser();

                                expect(account.putUser.calls.mostRecent().args[0].permissions.experiences.editAdConfig).toBeUndefined();
                                expect(account.putUser.calls.mostRecent().args[0].permissions.orgs.editAdConfig).toBeUndefined();
                                expect(account.putUser.calls.mostRecent().args[0].type).toEqual('Publisher');
                            });
                        });

                        describe('when role is ContentProvider', function() {
                            it('should POST default user permissions and disable editAdConfig settings', function() {
                                UsersCtrl.role = 'ContentProvider';

                                UsersCtrl.editAdConfigOptions[0].enabled = true;
                                UsersCtrl.editAdConfigOptions[1].enabled = true;

                                UsersCtrl.saveUser();

                                expect(account.putUser.calls.mostRecent().args[0].permissions.experiences.editAdConfig).toBeUndefined();
                                expect(account.putUser.calls.mostRecent().args[0].permissions.orgs.editAdConfig).toBeUndefined();
                                expect(account.putUser.calls.mostRecent().args[0].type).toEqual('ContentProvider');
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

                            $scope.data.org = $scope.data.orgs[0];
                            $scope.$digest();

                            $scope.data.user.email = 'foo@bar.com';
                            $scope.data.user.password = 'secret';
                            $scope.data.user.firstName = 'Test';
                            $scope.data.user.lastName = 'Name';
                            $scope.data.user.branding = 'brand';

                            UsersCtrl.role = 'Publisher';
                        });

                        it('should POST the user', function() {
                            UsersCtrl.saveUser();

                            expect(account.postUser).toHaveBeenCalledWith({
                                email: 'foo@bar.com',
                                password: 'secret',
                                firstName: 'Test',
                                lastName: 'Name',
                                org: 'o-1',
                                branding: 'brand',
                                config: {
                                    minireelinator: {
                                        minireelDefaults: {
                                            splash: {
                                                ratio: '3-2',
                                                theme: 'img-text-overlay'
                                            }
                                        }
                                    }
                                },
                                type: 'Publisher',
                                permissions: {
                                    elections: {
                                        read    : 'org',
                                        create  : 'org',
                                        edit    : 'org',
                                        delete  : 'org'
                                    },
                                    experiences: {
                                        read    : 'org',
                                        create  : 'org',
                                        edit    : 'org',
                                        delete  : 'org'
                                    },
                                    users: {
                                        read    : 'org',
                                        edit    : 'own'
                                    },
                                    orgs: {
                                        read    : 'own',
                                        edit    : 'own'
                                    }
                                }
                            });
                        });

                        describe('when role is Admin', function() {
                            it('should POST permissions with scope of "all" and enable the editaAdConfig settings', function() {
                                UsersCtrl.role = 'Admin';

                                UsersCtrl.saveUser();

                                expect(account.postUser.calls.mostRecent().args[0].type).toEqual('Publisher');
                                expect(account.postUser.calls.mostRecent().args[0].permissions).toEqual({
                                    elections: {
                                        read    : 'all',
                                        create  : 'all',
                                        edit    : 'all',
                                        delete  : 'all'
                                    },
                                    experiences: {
                                        read    : 'all',
                                        create  : 'all',
                                        edit    : 'all',
                                        delete  : 'all',
                                        editAdConfig: 'all'
                                    },
                                    users: {
                                        read    : 'all',
                                        create  : 'all',
                                        edit    : 'all',
                                        delete  : 'all'
                                    },
                                    orgs: {
                                        read    : 'all',
                                        create  : 'all',
                                        edit    : 'all',
                                        delete  : 'all',
                                        editAdConfig: 'all'
                                    }
                                });
                            });
                        });

                        describe('when role is Publisher', function() {
                            it('should POST the editAdConfig settings if set', function() {
                                UsersCtrl.role = 'Publisher';

                                UsersCtrl.editAdConfigOptions[0].enabled = true;
                                UsersCtrl.editAdConfigOptions[1].enabled = true;

                                UsersCtrl.saveUser();

                                expect(account.postUser.calls.mostRecent().args[0].permissions.experiences.editAdConfig).toEqual('org');
                                expect(account.postUser.calls.mostRecent().args[0].permissions.orgs.editAdConfig).toEqual('own');
                                expect(account.postUser.calls.mostRecent().args[0].type).toEqual('Publisher');

                                UsersCtrl.editAdConfigOptions[0].enabled = false;
                                UsersCtrl.editAdConfigOptions[1].enabled = false;

                                UsersCtrl.saveUser();

                                expect(account.postUser.calls.mostRecent().args[0].permissions.experiences.editAdConfig).toBeUndefined();
                                expect(account.postUser.calls.mostRecent().args[0].permissions.orgs.editAdConfig).toBeUndefined();
                                expect(account.postUser.calls.mostRecent().args[0].type).toEqual('Publisher');
                            });
                        });

                        describe('when role is ContentProvider', function() {
                            it('should POST default user permissions and disable editAdConfig settings', function() {
                                UsersCtrl.role = 'ContentProvider';

                                UsersCtrl.editAdConfigOptions[0].enabled = true;
                                UsersCtrl.editAdConfigOptions[1].enabled = true;

                                UsersCtrl.saveUser();

                                expect(account.postUser.calls.mostRecent().args[0].permissions.experiences.editAdConfig).toBeUndefined();
                                expect(account.postUser.calls.mostRecent().args[0].permissions.orgs.editAdConfig).toBeUndefined();
                                expect(account.postUser.calls.mostRecent().args[0].type).toEqual('ContentProvider');
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

                describe('confirmDelete()', function() {
                    beforeEach(function() {
                        $scope.$apply(function() {
                            account.getOrgs.deferred.resolve(angular.copy(mockOrgs));
                            account.getUsers.deferred.resolve(angular.copy(mockUsers));
                        });

                        UsersCtrl.editUser($scope.data.users[0]);
                    });

                    it('should DELETE the user when confirmed', function() {
                        UsersCtrl.confirmDelete();

                        ConfirmDialogService.display.calls.mostRecent().args[0].onAffirm();

                        expect(account.deleteUser).toHaveBeenCalledWith($scope.data.users[0]);
                    });

                    it('should not DELETE the user if canceled', function() {
                        UsersCtrl.confirmDelete();

                        ConfirmDialogService.display.calls.mostRecent().args[0].onCancel();

                        expect(account.deleteUser).not.toHaveBeenCalled();
                    });

                    it('on success should', function() {
                        UsersCtrl.confirmDelete();

                        ConfirmDialogService.display.calls.mostRecent().args[0].onAffirm();

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
                        UsersCtrl.confirmDelete();

                        ConfirmDialogService.display.calls.mostRecent().args[0].onAffirm();

                        $scope.$apply(function() {
                            account.deleteUser.deferred.reject();
                        });

                        expect(UsersCtrl.action).toBe('edit');
                        expect(ConfirmDialogService.display.calls.count()).toBe(2);
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
                        $scope.data.users = [{},{},{}];

                        expect(UsersCtrl.total).toBe(1);

                        $scope.data.users = [{},{},{},{},{},{},{}];

                        expect(UsersCtrl.total).toBe(2);

                        UsersCtrl.limit = 10;
                        expect(UsersCtrl.total).toBe(1);
                    });
                });

                describe('role', function() {
                    describe('when editing a user', function() {
                        it('should be set to user type unless all permissions are set to "all"', function() {
                            $scope.$apply(function() {
                                account.getOrgs.deferred.resolve(angular.copy(mockOrgs));
                                account.getUsers.deferred.resolve(angular.copy(mockUsers));
                            });

                            $scope.data.users[0].type = 'ContentProvider';

                            UsersCtrl.editUser($scope.data.users[0]);

                            expect(UsersCtrl.role).toBe('ContentProvider');

                            $scope.data.users[0].type = 'Publisher';

                            UsersCtrl.editUser($scope.data.users[0]);

                            expect(UsersCtrl.role).toBe('Publisher');

                            $scope.data.users[0].permissions = {
                                elections: {
                                    read    : 'all',
                                    create  : 'all',
                                    edit    : 'all',
                                    delete  : 'all'
                                },
                                experiences: {
                                    read    : 'all',
                                    create  : 'all',
                                    edit    : 'all',
                                    delete  : 'all',
                                    editAdConfig: 'all'
                                },
                                users: {
                                    read    : 'all',
                                    create  : 'all',
                                    edit    : 'all',
                                    delete  : 'all'
                                },
                                orgs: {
                                    read    : 'all',
                                    create  : 'all',
                                    edit    : 'all',
                                    delete  : 'all',
                                    editAdConfig: 'all'
                                }
                            };

                            UsersCtrl.editUser($scope.data.users[0]);

                            expect(UsersCtrl.role).toBe('Admin');
                        });
                    });
                    describe('when creating a user', function() {
                        it('should be initialized to null', function() {
                            UsersCtrl.addNewUser();

                            expect(UsersCtrl.role).toBe(null);
                        });
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

                describe('action', function() {
                    it('should reset the editAdConfigOptions when making a new user', function() {
                        UsersCtrl.editAdConfigOptions[0].enabled = true;
                        UsersCtrl.editAdConfigOptions[1].enabled = true;

                        $scope.$apply(function() {
                            UsersCtrl.action = 'new';
                        });

                        expect(UsersCtrl.editAdConfigOptions[0].enabled).toBe(false);
                        expect(UsersCtrl.editAdConfigOptions[1].enabled).toBe(false);
                    });
                });
            });
        });
    });
}());