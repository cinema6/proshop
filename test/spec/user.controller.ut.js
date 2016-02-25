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
                Cinema6Service,
                AccountService,
                appData,
                mockOrgs,
                mockUser,
                mockPolicies,
                mockRoles,
                ConfirmDialogService;

            function compileCtrl(id) {
                $routeParams = {id: id};

                UserCtrl = $controller('UserController', {
                    $log: $log,
                    $scope: $scope,
                    $location: $location,
                    $routeParams: $routeParams,
                    Cinema6Service: Cinema6Service,
                    AccountService: AccountService,
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

                Cinema6Service = {
                    get: jasmine.createSpy('Cinema6Service.get'),
                    getAll: jasmine.createSpy('Cinema6Service.getAll'),
                    put: jasmine.createSpy('Cinema6Service.put'),
                    post: jasmine.createSpy('Cinema6Service.post'),
                    delete: jasmine.createSpy('Cinema6Service.delete')
                };

                AccountService = {
                    freezeUser: jasmine.createSpy('AccountService.freezeUser')
                }

                mockOrgs = {
                    meta: {
                        items: {
                            start: 1,
                            end: 3,
                            total: 3
                        }
                    },
                    data: [
                        {
                            id: 'o-1',
                            name: 'Org1'
                        },
                        {
                            id: 'o-2',
                            name: 'Org2'
                        }
                    ]
                };

                // user id decoarted with org, this happens in UserService
                mockUser = {
                    id: 'u-1',
                    email: 'e@mail.com',
                    firstName: 'J',
                    lastName: 'F',
                    org: {
                        id: 'o-1'
                    },
                    type: 'Publisher',
                    status: 'active'
                };

                /* jsHint quotmark:false */
                mockRoles = {
                    meta: {
                        items: {
                            start: 1,
                            end: 3,
                            total: 3
                        }
                    },
                    data: [
                        {
                            "id": "r-111",
                            "name": "StudioRole",
                            "created": "2015-06-13T19:28:39.408Z",
                            "lastUpdated": "2015-06-13T19:28:39.408Z",
                            "status": "active",
                            "policies": ["MiniReelCreator"]
                        },
                        {
                            "id": "r-112",
                            "name": "Creator",
                            "created": "2015-06-13T19:28:39.408Z",
                            "lastUpdated": "2015-06-13T19:28:39.408Z",
                            "status": "active",
                            "policies": ["MiniReelCreator","SelfieUser"]
                        },
                        {
                            "id": "r-113",
                            "name": "AdminRole",
                            "created": "2015-06-13T19:28:39.408Z",
                            "lastUpdated": "2015-06-13T19:28:39.408Z",
                            "status": "active",
                            "policies": ["MiniReelCreator","SelfieUser","CampaignManager"]
                        }
                    ]
                };

                mockPolicies = {
                    meta: {
                        items: {
                            start: 1,
                            end: 3,
                            total: 3
                        }
                    },
                    data: [
                        {
                            "id": "p-111",
                            "name": "Campaign Manager",
                            "created": "2014-06-13T19:28:39.408Z",
                            "lastUpdated": "2014-06-13T19:28:39.408Z",
                            "status": "active",
                            "priority": 1,
                            "permissions": {
                                "campaigns": {
                                    "read": "all",
                                    "create": "all",
                                    "edit": "all",
                                    "delete": "all"
                                }
                            },
                            "applications": [
                                "e-selfie-experience",
                                "e-studio-experience"
                            ],
                            "fieldValidation": {
                                "campaigns": {
                                    "status": {
                                        "__allowed": true
                                    },
                                    "user": {
                                        "__allowed": true
                                    },
                                    "org": {
                                        "__allowed": true
                                    },
                                    "minViewTime": {
                                        "__allowed": true
                                    },
                                    "pricing": {
                                        "cost": {
                                            "__allowed": true
                                        }
                                    },
                                    "cards": {
                                        "__allowed": true,
                                        "__unchangeable": false
                                    }
                                }
                            },
                            "entitlements": {
                                "canEditSomething": true
                            }
                        },
                        {
                            "id": "p-112",
                            "name": "MiniReel Creator",
                            "created": "2015-06-13T19:28:39.408Z",
                            "lastUpdated": "2015-06-13T19:28:39.408Z",
                            "status": "active",
                            "applications": ["e-studio-experience"],
                            "permissions": {},
                            "fieldValidation": {}
                        },
                        {
                            "id": "p-113",
                            "name": "Selfie User",
                            "created": "2015-07-13T19:28:39.408Z",
                            "lastUpdated": "2015-07-13T19:28:39.408Z",
                            "status": "active",
                            "permissions": {
                                "campaigns": {
                                    "read": "org",
                                    "create": "org",
                                    "edit": "org",
                                    "delete": "org"
                                }
                            },
                            "fieldValidation": {
                                "campaigns": {}
                            },
                            "applications": ["e-selfie-experience"]
                        }
                    ]
                }
                /* jshint quotmark:single */

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

                    Cinema6Service.get.deferred = $q.defer();
                    Cinema6Service.get.and.returnValue(Cinema6Service.get.deferred.promise);

                    Cinema6Service.getAll.orgs = $q.defer();
                    Cinema6Service.getAll.roles = $q.defer();
                    Cinema6Service.getAll.policies = $q.defer();
                    Cinema6Service.getAll.and.callFake(function(entity) {
                        return Cinema6Service.getAll[entity].promise;
                    });

                    Cinema6Service.put.deferred = $q.defer();
                    Cinema6Service.put.and.returnValue(Cinema6Service.put.deferred.promise);

                    Cinema6Service.post.deferred = $q.defer();
                    Cinema6Service.post.and.returnValue(Cinema6Service.post.deferred.promise);

                    Cinema6Service.delete.deferred = $q.defer();
                    Cinema6Service.delete.and.returnValue(Cinema6Service.delete.deferred.promise);

                    AccountService.freezeUser.deferred = $q.defer();
                    AccountService.freezeUser.and.returnValue(AccountService.freezeUser.deferred.promise);

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

                    it('should call the Cinema6Service service to get all orgs', function() {
                        expect(Cinema6Service.getAll).toHaveBeenCalledWith('orgs',{});
                        expect(Cinema6Service.getAll).toHaveBeenCalledWith('roles',{});
                        expect(Cinema6Service.getAll).toHaveBeenCalledWith('policies',{});
                    });

                    it('should not call Cinema6Service.get', function() {
                        expect(Cinema6Service.get).not.toHaveBeenCalled();
                    });

                    it('should put the orgs, roles, policies and a new user with default config on the Ctrl', function() {
                        $scope.$apply(function() {
                            Cinema6Service.getAll.orgs.resolve(angular.copy(mockOrgs));
                            Cinema6Service.getAll.roles.resolve(angular.copy(mockRoles));
                            Cinema6Service.getAll.policies.resolve(angular.copy(mockPolicies));
                        });

                        expect(UserCtrl.orgs).toEqual(mockOrgs.data);
                        expect(UserCtrl.roles).toEqual(mockRoles.data);
                        expect(UserCtrl.policies).toEqual(mockPolicies.data);
                        expect(UserCtrl.user).toEqual({
                            status: 'active',
                            org: {},
                            roles: [],
                            policies: [],
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

                    it('should call the Cinema6Service service to get all orgs', function() {
                        expect(Cinema6Service.getAll).toHaveBeenCalledWith('orgs',{});
                        expect(Cinema6Service.getAll).toHaveBeenCalledWith('roles',{});
                        expect(Cinema6Service.getAll).toHaveBeenCalledWith('policies',{});
                    });

                    it('should call Cinema6Service.get', function() {
                        expect(Cinema6Service.get).toHaveBeenCalledWith('users','u-1');
                    });

                    it('should put the orgs, roles and policies on the Ctrl', function() {
                        $scope.$apply(function() {
                            Cinema6Service.get.deferred.resolve(angular.copy(mockUser));
                            Cinema6Service.getAll.orgs.resolve(angular.copy(mockOrgs));
                            Cinema6Service.getAll.roles.resolve(angular.copy(mockRoles));
                            Cinema6Service.getAll.policies.resolve(angular.copy(mockPolicies));
                        });

                        expect(UserCtrl.orgs).toEqual(mockOrgs.data);
                        expect(UserCtrl.roles).toEqual(mockRoles.data);
                        expect(UserCtrl.policies).toEqual(mockPolicies.data);
                    });

                    it('should put the User\'s Org on the Ctrl', function() {
                        $scope.$apply(function() {
                            Cinema6Service.get.deferred.resolve(angular.copy(mockUser));
                            Cinema6Service.getAll.orgs.resolve(angular.copy(mockOrgs));
                            Cinema6Service.getAll.roles.resolve(angular.copy(mockRoles));
                            Cinema6Service.getAll.policies.resolve(angular.copy(mockPolicies));
                        });

                        expect(UserCtrl.org).toEqual(mockOrgs.data[0]);
                    });

                    it('should handle a User with no Org', function() {
                        delete mockUser.org;
                        $scope = $rootScope.$new();
                        compileCtrl('u-1');

                        $scope.$apply(function() {
                            Cinema6Service.get.deferred.resolve(angular.copy(mockUser));
                            Cinema6Service.getAll.orgs.resolve(angular.copy(mockOrgs));
                            Cinema6Service.getAll.roles.resolve(angular.copy(mockRoles));
                            Cinema6Service.getAll.policies.resolve(angular.copy(mockPolicies));
                        });

                        expect(UserCtrl.org).toEqual(undefined);
                        expect(UserCtrl.orgs).toEqual(mockOrgs.data);
                        expect(UserCtrl.roles).toEqual(mockRoles.data);
                        expect(UserCtrl.policies).toEqual(mockPolicies.data);
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
                                Cinema6Service.get.deferred.resolve(angular.copy(_user));
                                Cinema6Service.getAll.orgs.resolve(angular.copy(mockOrgs));
                                Cinema6Service.getAll.roles.resolve(angular.copy(mockRoles));
                                Cinema6Service.getAll.policies.resolve(angular.copy(mockPolicies));
                            });

                            expect(UserCtrl.user.config).toEqual(_user.config);
                        });
                    });

                    describe('if user does not have config', function() {
                        describe('if org has config', function() {
                            it('should use the Org config', function() {
                                var _org = angular.extend(mockOrgs.data[0], {
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

                                var _orgs = {
                                    meta:{},
                                    data: [_org]
                                };

                                $scope.$apply(function() {
                                    Cinema6Service.get.deferred.resolve(angular.copy(mockUser));
                                    Cinema6Service.getAll.orgs.resolve(angular.copy(_orgs));
                                    Cinema6Service.getAll.roles.resolve(angular.copy(mockRoles));
                                    Cinema6Service.getAll.policies.resolve(angular.copy(mockPolicies));
                                });

                                expect(UserCtrl.user.config).toEqual(_org.config);
                            });
                        });

                        describe('if org does not have config', function() {
                            it('should set defaults', function() {
                                $scope.$apply(function() {
                                    Cinema6Service.get.deferred.resolve(angular.copy(mockUser));
                                    Cinema6Service.getAll.orgs.resolve(angular.copy(mockOrgs));
                                    Cinema6Service.getAll.roles.resolve(angular.copy(mockRoles));
                                    Cinema6Service.getAll.policies.resolve(angular.copy(mockPolicies));
                                });

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
            });

            describe('methods', function() {
                describe('add(prop, item)', function() {
                    beforeEach(function() {
                        compileCtrl();

                        $scope.$apply(function() {
                            Cinema6Service.getAll.orgs.resolve(angular.copy(mockOrgs));
                            Cinema6Service.getAll.roles.resolve(angular.copy(mockRoles));
                            Cinema6Service.getAll.policies.resolve(angular.copy(mockPolicies));
                        });
                    });

                    describe('when the item already exists', function() {
                        it('should not add it', function() {
                            expect(UserCtrl.user.roles).toEqual([]);
                            expect(UserCtrl.user.policies).toEqual([]);

                            UserCtrl.add('roles', mockRoles.data[0].name);
                            UserCtrl.add('roles', mockRoles.data[0].name);
                            UserCtrl.add('roles', mockRoles.data[0].name);
                            UserCtrl.add('roles', mockRoles.data[0].name);

                            expect(UserCtrl.user.roles).toEqual([mockRoles.data[0].name]);
                        });
                    });

                    describe('when the item does not exist', function() {
                        it('should add it to the array', function() {
                            expect(UserCtrl.user.roles).toEqual([]);
                            expect(UserCtrl.user.policies).toEqual([]);

                            UserCtrl.add('policies', mockPolicies.data[1].name);

                            expect(UserCtrl.user.policies).toEqual([mockPolicies.data[1].name]);
                        });
                    });
                });

                describe('remove(prop, index)', function() {
                    it('should remove the item at the provided index', function() {
                        compileCtrl();

                        $scope.$apply(function() {
                            Cinema6Service.getAll.orgs.resolve(angular.copy(mockOrgs));
                            Cinema6Service.getAll.roles.resolve(angular.copy(mockRoles));
                            Cinema6Service.getAll.policies.resolve(angular.copy(mockPolicies));
                        });

                        UserCtrl.add('roles', mockRoles.data[0].name);
                        UserCtrl.add('roles', mockRoles.data[1].name);
                        UserCtrl.add('roles', mockRoles.data[2].name);

                        expect(UserCtrl.user.roles).toEqual([mockRoles.data[0].name, mockRoles.data[1].name, mockRoles.data[2].name]);

                        UserCtrl.remove('roles',1);

                        expect(UserCtrl.user.roles).toEqual([mockRoles.data[0].name, mockRoles.data[2].name]);
                    });
                });

                describe('save()', function() {
                    describe('when updating a user', function() {
                        beforeEach(function() {
                            compileCtrl('u-1');

                            $scope.$apply(function() {
                                Cinema6Service.get.deferred.resolve(angular.copy(mockUser));
                                Cinema6Service.getAll.orgs.resolve(angular.copy(mockOrgs));
                                Cinema6Service.getAll.roles.resolve(angular.copy(mockRoles));
                                Cinema6Service.getAll.policies.resolve(angular.copy(mockPolicies));
                            });
                        });

                        it('should PUT the user', function() {
                            UserCtrl.save();

                            expect(Cinema6Service.put).toHaveBeenCalledWith('users',UserCtrl.user.id, {
                                firstName: UserCtrl.user.firstName,
                                lastName: UserCtrl.user.lastName,
                                org: UserCtrl.user.org.id,
                                config: UserCtrl.user.config,
                                policies: [],
                                roles: [],
                                status: 'active'
                            });
                        });

                        it('on success should redirect to /users page', function() {
                            UserCtrl.save();

                            $scope.$apply(function() {
                                Cinema6Service.put.deferred.resolve(UserCtrl.user);
                            });

                            expect($location.path).toHaveBeenCalledWith('/users');
                        });

                        it('on error should stay on the edit page and display an error dialog', function() {
                            UserCtrl.save();

                            expect($scope.message).toBe(null);

                            $scope.$apply(function() {
                                Cinema6Service.put.deferred.reject();
                            });

                            expect($location.path).not.toHaveBeenCalledWith('/users');
                            expect(ConfirmDialogService.display).toHaveBeenCalled();
                        });
                    });

                    describe('when creating a user', function() {
                        beforeEach(function() {
                            compileCtrl();

                            $scope.$apply(function() {
                                Cinema6Service.get.deferred.resolve(angular.copy(mockUser));
                                Cinema6Service.getAll.orgs.resolve(angular.copy(mockOrgs));
                                Cinema6Service.getAll.roles.resolve(angular.copy(mockRoles));
                                Cinema6Service.getAll.policies.resolve(angular.copy(mockPolicies));
                            });

                            UserCtrl.org = UserCtrl.orgs[0];
                            $scope.$digest();

                            UserCtrl.user.email = 'foo@bar.com';
                            UserCtrl.user.password = 'secret';
                            UserCtrl.user.firstName = 'Test';
                            UserCtrl.user.lastName = 'Name';
                        });

                        it('should POST the user', function() {
                            UserCtrl.save();

                            expect(Cinema6Service.post).toHaveBeenCalledWith('users', {
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
                                policies: [],
                                roles: [],
                                status: 'active'
                            });
                        });

                        it('on success should put a message on the scope, set the action, and reload org and user data', function() {
                            UserCtrl.save();

                            $scope.$apply(function() {
                                Cinema6Service.post.deferred.resolve(UserCtrl.user);
                            });

                            expect($location.path).toHaveBeenCalledWith('/users');
                        });

                        it('on error should stay on the edit page and display an error message', function() {
                            UserCtrl.save();

                            expect($scope.message).toBe(null);

                            $scope.$apply(function() {
                                Cinema6Service.post.deferred.reject();
                            });

                            expect(ConfirmDialogService.display).toHaveBeenCalled();
                        });
                    });
                });

                describe('delete()', function() {
                    beforeEach(function() {
                        compileCtrl('u-1');

                        $scope.$apply(function() {
                            Cinema6Service.get.deferred.resolve(angular.copy(mockUser));
                            Cinema6Service.getAll.orgs.resolve(angular.copy(mockOrgs));
                            Cinema6Service.getAll.roles.resolve(angular.copy(mockRoles));
                            Cinema6Service.getAll.policies.resolve(angular.copy(mockPolicies));
                        });
                    });

                    it('should DELETE the user when confirmed', function() {
                        UserCtrl.delete();

                        ConfirmDialogService.display.calls.mostRecent().args[0].onAffirm();

                        expect(Cinema6Service.delete).toHaveBeenCalledWith('users',UserCtrl.user.id);
                    });

                    it('should not DELETE the user if canceled', function() {
                        UserCtrl.delete();

                        ConfirmDialogService.display.calls.mostRecent().args[0].onCancel();

                        expect(Cinema6Service.delete).not.toHaveBeenCalled();
                    });

                    it('on success should', function() {
                        UserCtrl.delete();

                        ConfirmDialogService.display.calls.mostRecent().args[0].onAffirm();

                        $scope.$apply(function() {
                            Cinema6Service.delete.deferred.resolve();
                        });

                        expect($location.path).toHaveBeenCalledWith('/users');
                    });

                    it('on error', function() {
                        UserCtrl.delete();

                        ConfirmDialogService.display.calls.mostRecent().args[0].onAffirm();

                        $scope.$apply(function() {
                            Cinema6Service.delete.deferred.reject();
                        });

                        expect(ConfirmDialogService.display.calls.count()).toBe(2);
                    });
                });

                describe('freeze()', function() {
                    beforeEach(function() {
                        compileCtrl('u-1');

                        $scope.$apply(function() {
                            Cinema6Service.get.deferred.resolve(angular.copy(mockUser));
                            Cinema6Service.getAll.orgs.resolve(angular.copy(mockOrgs));
                            Cinema6Service.getAll.roles.resolve(angular.copy(mockRoles));
                            Cinema6Service.getAll.policies.resolve(angular.copy(mockPolicies));
                        });
                    });

                    it('should Freeze the user when confirmed', function() {
                        UserCtrl.freeze();

                        ConfirmDialogService.display.calls.mostRecent().args[0].onAffirm();

                        expect(AccountService.freezeUser).toHaveBeenCalledWith(UserCtrl.user.id);
                    });

                    it('should not Freeze the user if canceled', function() {
                        UserCtrl.freeze();

                        ConfirmDialogService.display.calls.mostRecent().args[0].onCancel();

                        expect(AccountService.freezeUser).not.toHaveBeenCalledWith(UserCtrl.user.id);
                    });

                    it('on success should', function() {
                        UserCtrl.freeze();

                        ConfirmDialogService.display.calls.mostRecent().args[0].onAffirm();

                        expect($scope.message).toBe(null);

                        $scope.$apply(function() {
                            AccountService.freezeUser.deferred.resolve();
                        });

                        expect($scope.message).toBe('Successfully froze user: ' + UserCtrl.user.email + '.');
                    });

                    it('on error', function() {
                        UserCtrl.freeze();

                        ConfirmDialogService.display.calls.mostRecent().args[0].onAffirm();

                        $scope.$apply(function() {
                            AccountService.freezeUser.deferred.reject();
                        });

                        expect(ConfirmDialogService.display.calls.count()).toBe(2);
                    });
                });
            });

            describe('properties', function() {
                describe('emailPattern', function() {
                    beforeEach(function() {
                        compileCtrl('u-1');
                    });
                    it('should return true when valid', function() {
                        expect('josh@reelcontent.com').toMatch(UserCtrl.emailPattern);
                        expect('josh.o\'minzner@minzner.exposed').toMatch(UserCtrl.emailPattern);
                        expect('123@blah.co').toMatch(UserCtrl.emailPattern);
                    });

                    it('should return false when not valid', function() {
                        expect(' josh@blah.com').not.toMatch(UserCtrl.emailPattern);
                        expect('hello').not.toMatch(UserCtrl.emailPattern);
                        expect('josh@reelcontent.c').not.toMatch(UserCtrl.emailPattern);
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
                            Cinema6Service.get.deferred.resolve(angular.copy(mockUser));
                            Cinema6Service.getAll.orgs.resolve(angular.copy(mockOrgs));
                            Cinema6Service.getAll.roles.resolve(angular.copy(mockRoles));
                            Cinema6Service.getAll.policies.resolve(angular.copy(mockPolicies));
                        });

                        expect(UserCtrl.loading).toBe(false);
                    });

                    it('should be false even if there are errors loading data', function() {
                        $scope.$apply(function() {
                            Cinema6Service.get.deferred.reject();
                            Cinema6Service.getAll.orgs.reject();
                            Cinema6Service.getAll.roles.reject();
                            Cinema6Service.getAll.policies.reject();
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
                                Cinema6Service.get.deferred.resolve(angular.copy(mockUser));
                                Cinema6Service.getAll.orgs.resolve(angular.copy(mockOrgs));
                                Cinema6Service.getAll.roles.resolve(angular.copy(mockRoles));
                                Cinema6Service.getAll.policies.resolve(angular.copy(mockPolicies));
                            });

                            UserCtrl.org = mockOrgs.data[1];
                            $scope.$digest();

                            onAffirm = ConfirmDialogService.display.calls.mostRecent().args[0].onAffirm;
                            onCancel = ConfirmDialogService.display.calls.mostRecent().args[0].onCancel;
                        });

                        it('should warn about minireels staying with the Org', function() {
                            expect(ConfirmDialogService.display).toHaveBeenCalled();
                        });

                        describe('onAffirm()', function() {
                            it('should put the new org on the user', function() {
                                onAffirm();
                                expect(UserCtrl.user.org).toEqual(mockOrgs.data[1]);
                            });

                            describe('when the new Org has config', function() {
                                it('should add the Org config to the user', function() {
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

                                    mockOrgs.data[1].config = {
                                        minireelinator: {
                                            minireelDefaults: {
                                                splash: {
                                                    ratio: '6-5',
                                                    theme: 'img-only'
                                                }
                                            }
                                        }
                                    };

                                    onAffirm();

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
                                });
                            });
                        });

                        describe('onCancel()', function() {
                            it('should call cancelOrgChange()', function() {
                                onCancel();
                                expect(UserCtrl.user.org.id).toEqual(mockOrgs.data[0].id);
                                expect(UserCtrl.org).toEqual(mockOrgs.data[0]);
                            });
                        });
                    });

                    describe('when creating a User', function() {
                        it('should reset the branding and change the config to match the new Org', function() {
                            mockOrgs.data[1].config = {
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
                                Cinema6Service.get.deferred.resolve(angular.copy(mockUser));
                                Cinema6Service.getAll.orgs.resolve(angular.copy(mockOrgs));
                                Cinema6Service.getAll.roles.resolve(angular.copy(mockRoles));
                                Cinema6Service.getAll.policies.resolve(angular.copy(mockPolicies));
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

                            UserCtrl.org = mockOrgs.data[1];
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