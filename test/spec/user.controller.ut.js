(function() {
    'use strict';

    define(['users'], function() {
        describe('UserController', function() {
            var $rootScope,
                $scope,
                $controller,
                $routeParams,
                $location,
                $log,
                $q,
                UserCtrl,
                account,
                appData,
                mockOrgs,
                mockUser,
                ConfirmDialogService;

            function compileCtrl(id) {
                $routeParams = {id: id};

                UserCtrl = $controller('UserController', {
                    $log: $log,
                    $scope: $scope,
                    $location: $location,
                    $routeParams: $routeParams,
                    account: account,
                    appData: appData,
                    ConfirmDialogService: ConfirmDialogService
                });
            }

            beforeEach(function() {
                module('c6.proshop');

                appData = {
                    'mini-reel-maker': {
                        id: 'e-MRinator'
                    },
                    proshop: {
                        id: 'e-Proshop',
                        data: {
                            userRoles: {
                                admin: {
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
                                        editAdConfig: 'all',
                                        editSponsorships: 'all'
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
                                    },
                                    sites: {
                                        read    : 'all',
                                        create  : 'all',
                                        edit    : 'all',
                                        delete  : 'all'
                                    },
                                    cards: {
                                        read    : 'all',
                                        create  : 'all',
                                        edit    : 'all',
                                        delete  : 'all'
                                    },
                                    categories: {
                                        read    : 'all',
                                        create  : 'all',
                                        edit    : 'all',
                                        delete  : 'all'
                                    }
                                },
                                publisher: {
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
                                    },
                                    sites: {
                                        read    : 'org'
                                    }
                                }
                            }
                        }
                    }
                };

                account = {
                    getOrg: jasmine.createSpy('account.getOrg'),
                    getOrgs: jasmine.createSpy('account.getOrgs'),
                    getUser: jasmine.createSpy('account.getUser'),
                    putUser: jasmine.createSpy('account.putUser'),
                    postUser: jasmine.createSpy('account.postUser'),
                    deleteUser: jasmine.createSpy('account.deleteUser'),
                    logoutUser: jasmine.createSpy('account.logoutUser')
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

                mockUser = {
                    id: 'u-1',
                    email: 'e@mail.com',
                    firstName: 'J',
                    lastName: 'F',
                    org: 'o-1',
                    type: 'Publisher',
                    status: 'active'
                };

                ConfirmDialogService = {
                    display: jasmine.createSpy('ConfirmDialogService.display()'),
                    close: jasmine.createSpy('ConfirmDialogService.close()')
                };

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

                    account.getUser.deferred = $q.defer();
                    account.getUser.and.returnValue(account.getUser.deferred.promise);

                    account.putUser.deferred = $q.defer();
                    account.putUser.and.returnValue(account.putUser.deferred.promise);

                    account.postUser.deferred = $q.defer();
                    account.postUser.and.returnValue(account.postUser.deferred.promise);

                    account.deleteUser.deferred = $q.defer();
                    account.deleteUser.and.returnValue(account.deleteUser.deferred.promise);

                    account.logoutUser.deferred = $q.defer();
                    account.logoutUser.and.returnValue(account.logoutUser.deferred.promise);

                    $log.context = function(){ return $log; }

                    $scope = $rootScope.$new();
                });
            });

            describe('initialization', function() {
                describe('when creating a new User', function() {
                    beforeEach(function() {
                        compileCtrl();
                    });

                    it('should exist', function() {
                        expect(UserCtrl).toBeDefined();
                    });

                    it('should call the account service to get all orgs', function() {
                        expect(account.getOrgs).toHaveBeenCalled();
                    });

                    it('should not call account.getUser', function() {
                        expect(account.getUser).not.toHaveBeenCalled();
                    });

                    it('should put the orgs and a new user with default config on the Ctrl', function() {
                        $scope.$apply(function() {
                            account.getOrgs.deferred.resolve(angular.copy(mockOrgs));
                        });

                        expect(UserCtrl.orgs).toEqual(mockOrgs);
                        expect(UserCtrl.user).toEqual({
                            status: 'active',
                            type: 'Publisher',
                            config: {
                                minireelinator: {
                                    minireelDefaults: {
                                        splash: {
                                            ratio: '3-2',
                                            theme: 'img-text-overlay'
                                        }
                                    }
                                }
                            }
                        });
                    });
                });

                describe('when editing an existing User', function() {
                    beforeEach(function() {
                        compileCtrl('u-1');
                    });

                    it('should exist', function() {
                        expect(UserCtrl).toBeDefined();
                    });

                    it('should call the account service to get all orgs', function() {
                        expect(account.getOrgs).toHaveBeenCalled();
                    });

                    it('should call account.getUser', function() {
                        expect(account.getUser).toHaveBeenCalledWith('u-1');
                    });

                    it('should put the orgs on the Ctrl', function() {
                        $scope.$apply(function() {
                            account.getUser.deferred.resolve(angular.copy(mockUser));
                            account.getOrgs.deferred.resolve(angular.copy(mockOrgs));
                        });

                        expect(UserCtrl.orgs).toEqual(mockOrgs);
                    });

                    it('should put the User\'s Org on the Ctrl', function() {
                        $scope.$apply(function() {
                            account.getUser.deferred.resolve(angular.copy(mockUser));
                            account.getOrgs.deferred.resolve(angular.copy(mockOrgs));
                        });

                        expect(UserCtrl.org).toEqual(mockOrgs[0]);
                    });

                    it('should enable the adConfig checkboxes if the user permissions indicate', function() {
                        var _user = angular.extend(mockUser, {
                            permissions: {
                                orgs: {
                                    editAdConfig: 'own'
                                },
                                experiences: {
                                    editAdConfig: 'org'
                                }
                            }
                        });

                        $scope.$apply(function() {
                            account.getUser.deferred.resolve(angular.copy(_user));
                            account.getOrgs.deferred.resolve(angular.copy(mockOrgs));
                        });

                        expect(UserCtrl.editAdConfigOptions[0].enabled).toBe(true);
                        expect(UserCtrl.editAdConfigOptions[1].enabled).toBe(true);
                    });

                    describe('if user has config', function() {
                        it('should use it', function() {
                            var _user = angular.extend(mockUser, {
                                config: {
                                    minireelinator: {
                                        minireelDefaults: {
                                            splash: {
                                                ratio: '6-5',
                                                theme: 'img-only'
                                            }
                                        }
                                    }
                                }
                            });

                            $scope.$apply(function() {
                                account.getUser.deferred.resolve(angular.copy(_user));
                                account.getOrgs.deferred.resolve(angular.copy(mockOrgs));
                            });

                            expect(UserCtrl.user).toEqual(_user);
                        });
                    });

                    describe('if user does not have config', function() {
                        describe('if org has config', function() {
                            it('should use the Org config', function() {
                                var _org = angular.extend(mockOrgs[0], {
                                    config: {
                                        minireelinator: {
                                            minireelDefaults: {
                                                splash: {
                                                    ratio: '6-5',
                                                    theme: 'img-only'
                                                }
                                            }
                                        }
                                    }
                                });

                                $scope.$apply(function() {
                                    account.getUser.deferred.resolve(angular.copy(mockUser));
                                    account.getOrgs.deferred.resolve(angular.copy([_org]));
                                });

                                expect(UserCtrl.user.config).toEqual(_org.config);
                            });
                        });

                        describe('if org does not have config', function() {
                            it('should set defaults', function() {
                                $scope.$apply(function() {
                                    account.getUser.deferred.resolve(angular.copy(mockUser));
                                    account.getOrgs.deferred.resolve(angular.copy(mockOrgs));
                                });

                                expect(UserCtrl.user).toEqual(angular.extend(mockUser, {
                                    config: {
                                        minireelinator: {
                                            minireelDefaults: {
                                                splash: {
                                                    ratio: '3-2',
                                                    theme: 'img-text-overlay'
                                                }
                                            }
                                        }
                                    }
                                }));
                            });
                        });
                    });
                });
            });

            describe('methods', function() {
                describe('saveUser()', function() {
                    describe('when updating a user', function() {
                        beforeEach(function() {
                            compileCtrl('u-1');

                            $scope.$apply(function() {
                                account.getOrgs.deferred.resolve(angular.copy(mockOrgs));
                                account.getUser.deferred.resolve(angular.copy(mockUser));
                            });
                        });

                        it('should PUT the user', function() {
                            UserCtrl.saveUser();

                            expect(account.putUser).toHaveBeenCalledWith(UserCtrl.user.id, {
                                firstName: UserCtrl.user.firstName,
                                lastName: UserCtrl.user.lastName,
                                org: UserCtrl.user.org,
                                config: UserCtrl.user.config,
                                type: UserCtrl.user.type,
                                status: 'active',
                                applications: ['e-MRinator'],
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
                                    },
                                    sites: {
                                        read    : 'org'
                                    }
                                }
                            });
                        });

                        describe('when role is Admin', function() {
                            it('should POST permissions with scope of "all" and enable the editaAdConfig settings', function() {
                                UserCtrl.role = 'Admin';

                                UserCtrl.saveUser();

                                expect(account.putUser.calls.mostRecent().args[1].type).toEqual('Publisher');
                                expect(account.putUser.calls.mostRecent().args[1].applications).toEqual(['e-Proshop','e-MRinator']);
                                expect(account.putUser.calls.mostRecent().args[1].permissions).toEqual({
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
                                        editAdConfig: 'all',
                                        editSponsorships: 'all'
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
                                    },
                                    sites: {
                                        read    : 'all',
                                        create  : 'all',
                                        edit    : 'all',
                                        delete  : 'all'
                                    },
                                    cards: {
                                        read    : 'all',
                                        create  : 'all',
                                        edit    : 'all',
                                        delete  : 'all'
                                    },
                                    categories: {
                                        read    : 'all',
                                        create  : 'all',
                                        edit    : 'all',
                                        delete  : 'all'
                                    }
                                });
                            });
                        });

                        describe('when role is Publisher', function() {
                            it('should POST the editAdConfig settings if set', function() {
                                UserCtrl.role = 'Publisher';

                                UserCtrl.editAdConfigOptions[0].enabled = true;
                                UserCtrl.editAdConfigOptions[1].enabled = true;

                                UserCtrl.saveUser();

                                expect(account.putUser.calls.mostRecent().args[1].permissions.experiences.editAdConfig).toEqual('org');
                                expect(account.putUser.calls.mostRecent().args[1].permissions.orgs.editAdConfig).toEqual('own');
                                expect(account.putUser.calls.mostRecent().args[1].type).toEqual('Publisher');

                                UserCtrl.editAdConfigOptions[0].enabled = false;
                                UserCtrl.editAdConfigOptions[1].enabled = false;

                                UserCtrl.saveUser();

                                expect(account.putUser.calls.mostRecent().args[1].permissions.experiences.editAdConfig).toBeUndefined();
                                expect(account.putUser.calls.mostRecent().args[1].permissions.orgs.editAdConfig).toBeUndefined();
                                expect(account.putUser.calls.mostRecent().args[1].type).toEqual('Publisher');
                            });
                        });

                        describe('when role is ContentProvider', function() {
                            it('should POST default user permissions and disable editAdConfig settings', function() {
                                UserCtrl.role = 'ContentProvider';

                                UserCtrl.editAdConfigOptions[0].enabled = true;
                                UserCtrl.editAdConfigOptions[1].enabled = true;

                                UserCtrl.saveUser();

                                expect(account.putUser.calls.mostRecent().args[1].permissions.experiences.editAdConfig).toBeUndefined();
                                expect(account.putUser.calls.mostRecent().args[1].permissions.orgs.editAdConfig).toBeUndefined();
                                expect(account.putUser.calls.mostRecent().args[1].type).toEqual('ContentProvider');
                            });
                        });

                        it('on success should redirect to /users page', function() {
                            UserCtrl.saveUser();

                            $scope.$apply(function() {
                                account.putUser.deferred.resolve(UserCtrl.user);
                            });

                            expect($location.path).toHaveBeenCalledWith('/users');
                        });

                        it('on error should stay on the edit page and display an error dialog', function() {
                            UserCtrl.saveUser();

                            expect($scope.message).toBe(null);

                            $scope.$apply(function() {
                                account.putUser.deferred.reject();
                            });

                            expect($location.path).not.toHaveBeenCalledWith('/users');
                            expect(ConfirmDialogService.display).toHaveBeenCalled();
                        });
                    });

                    describe('when creating a user', function() {
                        beforeEach(function() {
                            compileCtrl();

                            $scope.$apply(function() {
                                account.getOrgs.deferred.resolve(angular.copy(mockOrgs));
                                account.getUser.deferred.resolve(angular.copy(mockUser));
                            });

                            UserCtrl.org = UserCtrl.orgs[0];
                            $scope.$digest();

                            UserCtrl.user.email = 'foo@bar.com';
                            UserCtrl.user.password = 'secret';
                            UserCtrl.user.firstName = 'Test';
                            UserCtrl.user.lastName = 'Name';

                            UserCtrl.role = 'Publisher';
                        });

                        it('should POST the user', function() {
                            UserCtrl.saveUser();

                            expect(account.postUser).toHaveBeenCalledWith({
                                email: 'foo@bar.com',
                                password: 'secret',
                                firstName: 'Test',
                                lastName: 'Name',
                                org: 'o-1',
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
                                status: 'active',
                                applications: ['e-MRinator'],
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
                                    },
                                    sites: {
                                        read    : 'org'
                                    }
                                }
                            });
                        });

                        describe('when role is Admin', function() {
                            it('should POST permissions with scope of "all" and enable the editaAdConfig settings', function() {
                                UserCtrl.role = 'Admin';

                                UserCtrl.saveUser();

                                expect(account.postUser.calls.mostRecent().args[0].type).toEqual('Publisher');
                                expect(account.postUser.calls.mostRecent().args[0].applications).toEqual(['e-Proshop','e-MRinator']);
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
                                        editAdConfig: 'all',
                                        editSponsorships: 'all'
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
                                    },
                                    sites: {
                                        read    : 'all',
                                        create  : 'all',
                                        edit    : 'all',
                                        delete  : 'all'
                                    },
                                    cards: {
                                        read    : 'all',
                                        create  : 'all',
                                        edit    : 'all',
                                        delete  : 'all'
                                    },
                                    categories: {
                                        read    : 'all',
                                        create  : 'all',
                                        edit    : 'all',
                                        delete  : 'all'
                                    }
                                });
                            });
                        });

                        describe('when role is Publisher', function() {
                            it('should POST the editAdConfig settings if set', function() {
                                UserCtrl.role = 'Publisher';

                                UserCtrl.editAdConfigOptions[0].enabled = true;
                                UserCtrl.editAdConfigOptions[1].enabled = true;

                                UserCtrl.saveUser();

                                expect(account.postUser.calls.mostRecent().args[0].permissions.experiences.editAdConfig).toEqual('org');
                                expect(account.postUser.calls.mostRecent().args[0].permissions.orgs.editAdConfig).toEqual('own');
                                expect(account.postUser.calls.mostRecent().args[0].type).toEqual('Publisher');

                                UserCtrl.editAdConfigOptions[0].enabled = false;
                                UserCtrl.editAdConfigOptions[1].enabled = false;

                                UserCtrl.saveUser();

                                expect(account.postUser.calls.mostRecent().args[0].permissions.experiences.editAdConfig).toBeUndefined();
                                expect(account.postUser.calls.mostRecent().args[0].permissions.orgs.editAdConfig).toBeUndefined();
                                expect(account.postUser.calls.mostRecent().args[0].type).toEqual('Publisher');
                            });
                        });

                        describe('when role is ContentProvider', function() {
                            it('should POST default user permissions and disable editAdConfig settings', function() {
                                UserCtrl.role = 'ContentProvider';

                                UserCtrl.editAdConfigOptions[0].enabled = true;
                                UserCtrl.editAdConfigOptions[1].enabled = true;

                                UserCtrl.saveUser();

                                expect(account.postUser.calls.mostRecent().args[0].permissions.experiences.editAdConfig).toBeUndefined();
                                expect(account.postUser.calls.mostRecent().args[0].permissions.orgs.editAdConfig).toBeUndefined();
                                expect(account.postUser.calls.mostRecent().args[0].type).toEqual('ContentProvider');
                            });
                        });

                        it('on success should put a message on the scope, set the action, and reload org and user data', function() {
                            UserCtrl.saveUser();

                            $scope.$apply(function() {
                                account.postUser.deferred.resolve(UserCtrl.user);
                            });

                            expect($location.path).toHaveBeenCalledWith('/users');
                        });

                        it('on error should stay on the edit page and display an error message', function() {
                            UserCtrl.saveUser();

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
                        compileCtrl('u-1');

                        $scope.$apply(function() {
                            account.getOrgs.deferred.resolve(angular.copy(mockOrgs));
                            account.getUser.deferred.resolve(angular.copy(mockUser));
                        });
                    });

                    it('should DELETE the user when confirmed', function() {
                        UserCtrl.confirmDelete();

                        ConfirmDialogService.display.calls.mostRecent().args[0].onAffirm();

                        expect(account.deleteUser).toHaveBeenCalledWith(UserCtrl.user);
                    });

                    it('should not DELETE the user if canceled', function() {
                        UserCtrl.confirmDelete();

                        ConfirmDialogService.display.calls.mostRecent().args[0].onCancel();

                        expect(account.deleteUser).not.toHaveBeenCalled();
                    });

                    it('on success should', function() {
                        UserCtrl.confirmDelete();

                        ConfirmDialogService.display.calls.mostRecent().args[0].onAffirm();

                        $scope.$apply(function() {
                            account.deleteUser.deferred.resolve();
                        });

                        expect($location.path).toHaveBeenCalledWith('/users');
                    });

                    it('on error', function() {
                        UserCtrl.confirmDelete();

                        ConfirmDialogService.display.calls.mostRecent().args[0].onAffirm();

                        $scope.$apply(function() {
                            account.deleteUser.deferred.reject();
                        });

                        expect(ConfirmDialogService.display.calls.count()).toBe(2);
                    });
                });

                describe('confirmFreeze()', function() {
                    beforeEach(function() {
                        compileCtrl('u-1');

                        $scope.$apply(function() {
                            account.getOrgs.deferred.resolve(angular.copy(mockOrgs));
                            account.getUser.deferred.resolve(angular.copy(mockUser));
                        });
                    });

                    it('should Freeze the user when confirmed', function() {
                        UserCtrl.confirmFreeze();

                        ConfirmDialogService.display.calls.mostRecent().args[0].onAffirm();

                        expect(account.putUser).toHaveBeenCalledWith(UserCtrl.user.id, {status:'inactive'});
                        expect(account.logoutUser).toHaveBeenCalledWith(UserCtrl.user.id);
                    });

                    it('should not Freeze the user if canceled', function() {
                        UserCtrl.confirmFreeze();

                        ConfirmDialogService.display.calls.mostRecent().args[0].onCancel();

                        expect(account.putUser).not.toHaveBeenCalled();
                        expect(account.logoutUser).not.toHaveBeenCalled();
                    });

                    it('on success should', function() {
                        UserCtrl.confirmFreeze();

                        ConfirmDialogService.display.calls.mostRecent().args[0].onAffirm();

                        expect($scope.message).toBe(null);

                        $scope.$apply(function() {
                            account.putUser.deferred.resolve();
                            account.logoutUser.deferred.resolve();
                        });

                        expect($scope.message).toBe('Successfully froze user: ' + UserCtrl.user.email + '.');
                    });

                    it('on error', function() {
                        UserCtrl.confirmFreeze();

                        ConfirmDialogService.display.calls.mostRecent().args[0].onAffirm();

                        $scope.$apply(function() {
                            account.putUser.deferred.reject();
                        });

                        expect(ConfirmDialogService.display.calls.count()).toBe(2);
                    });
                });

                describe('cancelOrgChange()', function() {
                    it('should reset the Ctrl.org to match the User\'s Org', function() {
                        compileCtrl('u-1');
                        $scope.$apply(function() {
                            account.getOrgs.deferred.resolve(angular.copy(mockOrgs));
                            account.getUser.deferred.resolve(angular.copy(mockUser));
                        });

                        UserCtrl.org = mockOrgs[1];

                        UserCtrl.cancelOrgChange();

                        expect(UserCtrl.org).toEqual(mockOrgs[0]);
                    });
                });

                describe('confirmOrgChange()', function() {
                    it('should set the User\'s Org', function() {
                        compileCtrl('u-1');
                        $scope.$apply(function() {
                            account.getOrgs.deferred.resolve(angular.copy(mockOrgs));
                            account.getUser.deferred.resolve(angular.copy(mockUser));
                        });

                        UserCtrl.org = mockOrgs[1];

                        UserCtrl.confirmOrgChange();

                        expect(UserCtrl.user.org).toBe(mockOrgs[1].id);
                    });

                    describe('if new Org has a config', function() {
                        it('should set the User\'s config to match', function() {
                            mockOrgs[1].config = {
                                minireelinator: {
                                    minireelDefaults: {
                                        splash: {
                                            ratio: '6-5',
                                            theme: 'img-only'
                                        }
                                    }
                                }
                            };

                            compileCtrl('u-1');
                            $scope.$apply(function() {
                                account.getOrgs.deferred.resolve(angular.copy(mockOrgs));
                                account.getUser.deferred.resolve(angular.copy(mockUser));
                            });

                            UserCtrl.org = mockOrgs[1];

                            UserCtrl.confirmOrgChange();

                            expect(UserCtrl.user.config).toEqual(mockOrgs[1].config);
                        });
                    });

                    describe('if new Org does not have a config', function() {
                        it('should set the User\'s config to match', function() {
                            compileCtrl('u-1');
                            $scope.$apply(function() {
                                account.getOrgs.deferred.resolve(angular.copy(mockOrgs));
                                account.getUser.deferred.resolve(angular.copy(mockUser));
                            });

                            UserCtrl.org = mockOrgs[1];

                            UserCtrl.confirmOrgChange();

                            expect(UserCtrl.user.config).toEqual({
                                minireelinator: {
                                    minireelDefaults: {
                                        splash: {
                                            ratio: '3-2',
                                            theme: 'img-text-overlay'
                                        }
                                    }
                                }
                            });
                        });
                    });
                });
            });

            describe('properties', function() {
                describe('emailPattern', function() {
                    beforeEach(function() {
                        compileCtrl('u-1');
                    });
                    it('should return true when valid', function() {
                        expect('josh@cinema6.com').toMatch(UserCtrl.emailPattern);
                        expect('josh.o\'minzner@minzner.exposed').toMatch(UserCtrl.emailPattern);
                        expect('123@blah.co').toMatch(UserCtrl.emailPattern);
                    });

                    it('should return false when not valid', function() {
                        expect(' josh@blah.com').not.toMatch(UserCtrl.emailPattern);
                        expect('hello').not.toMatch(UserCtrl.emailPattern);
                        expect('josh@cinema6.c').not.toMatch(UserCtrl.emailPattern);
                    });
                });

                describe('role', function() {
                    describe('when editing a user', function() {
                        it('should equal user.type if permissions are not set to "all"', function() {
                            mockUser.type = 'ContentProvider';
                            compileCtrl('u-1');
                            $scope.$apply(function() {
                                account.getOrgs.deferred.resolve(angular.copy(mockOrgs));
                                account.getUser.deferred.resolve(angular.copy(mockUser));
                            });

                            expect(UserCtrl.role).toBe('ContentProvider');
                        });

                        it('should be Admin if all permissions are set to "all"', function() {
                            mockUser.permissions = {
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
                                    editAdConfig: 'all',
                                    editSponsorships: 'all'
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
                                },
                                sites: {
                                    read    : 'all',
                                    create  : 'all',
                                    edit    : 'all',
                                    delete  : 'all',
                                }
                            };

                            compileCtrl('u-1');
                            $scope.$apply(function() {
                                account.getOrgs.deferred.resolve(angular.copy(mockOrgs));
                                account.getUser.deferred.resolve(angular.copy(mockUser));
                            });

                            expect(UserCtrl.role).toBe('Admin');
                        });
                    });
                    describe('when creating a user', function() {
                        it('should default to "Publisher"', function() {
                            compileCtrl();
                            $scope.$apply(function() {
                                account.getOrgs.deferred.resolve(angular.copy(mockOrgs));
                                account.getUser.deferred.resolve(angular.copy(mockUser));
                            });
                            expect(UserCtrl.role).toBe('Publisher');
                        });
                    });
                });

                describe('loading', function() {
                    beforeEach(function() {
                        compileCtrl();
                    });

                    it('should be true on initialization', function() {
                        expect(UserCtrl.loading).toBe(true);
                    });

                    it('should be false after all data promises resolve', function() {
                        $scope.$apply(function() {
                            account.getOrgs.deferred.resolve(angular.copy(mockOrgs));
                            account.getUser.deferred.resolve(angular.copy(mockUser));
                        });

                        expect(UserCtrl.loading).toBe(false);
                    });

                    it('should be false even if there are errors loading data', function() {
                        $scope.$apply(function() {
                            account.getOrgs.deferred.reject();
                            account.getUser.deferred.reject();
                        });

                        expect(UserCtrl.loading).toBe(false);
                    });
                });
            });

            describe('$watch', function() {
                describe('Org', function() {
                    describe('when editing a User', function() {
                        var onAffirm, onCancel;

                        beforeEach(function() {
                            compileCtrl('u-1');
                            $scope.$apply(function() {
                                account.getOrgs.deferred.resolve(angular.copy(mockOrgs));
                                account.getUser.deferred.resolve(angular.copy(mockUser));
                            });

                            UserCtrl.org = mockOrgs[1];
                            $scope.$digest();

                            onAffirm = ConfirmDialogService.display.calls.mostRecent().args[0].onAffirm;
                            onCancel = ConfirmDialogService.display.calls.mostRecent().args[0].onCancel;

                            spyOn(UserCtrl, 'confirmOrgChange');
                            spyOn(UserCtrl, 'cancelOrgChange');
                        });

                        it('should warn about minireels staying with the Org', function() {
                            expect(ConfirmDialogService.display).toHaveBeenCalled();
                        });

                        describe('onAffirm()', function() {
                            it('should call confirmOrgChange()', function() {
                                onAffirm();
                                expect(UserCtrl.confirmOrgChange).toHaveBeenCalled();
                            });
                        });

                        describe('onCancel()', function() {
                            it('should call cancelOrgChange()', function() {
                                onCancel();
                                expect(UserCtrl.cancelOrgChange).toHaveBeenCalled();
                            });
                        });
                    });

                    describe('when creating a User', function() {
                        it('should reset the branding and change the config to match the new Org', function() {
                            mockOrgs[1].config = {
                                minireelinator: {
                                    minireelDefaults: {
                                        splash: {
                                            ratio: '6-5',
                                            theme: 'img-only'
                                        }
                                    }
                                }
                            };

                            compileCtrl();
                            $scope.$apply(function() {
                                account.getOrgs.deferred.resolve(angular.copy(mockOrgs));
                                account.getUser.deferred.resolve(angular.copy(mockUser));
                            });
                            UserCtrl.user.branding = 'test_branding';

                            expect(UserCtrl.user.config).toEqual({
                                minireelinator: {
                                    minireelDefaults: {
                                        splash: {
                                            ratio: '3-2',
                                            theme: 'img-text-overlay'
                                        }
                                    }
                                }
                            });

                            UserCtrl.org = mockOrgs[1];
                            $scope.$digest();

                            expect(UserCtrl.user.config).toEqual({
                                minireelinator: {
                                    minireelDefaults: {
                                        splash: {
                                            ratio: '6-5',
                                            theme: 'img-only'
                                        }
                                    }
                                }
                            });
                            expect(UserCtrl.user.branding).toBe(null);
                        });
                    });
                });
            });
        });
    });
}());