(function() {
    'use strict';

    define(['app'], function(proshop) {
        describe('RoleController', function() {
            var $rootScope,
                $scope,
                $controller,
                $q,
                $log,
                $routeParams,
                $location,
                RoleCtrl,
                ConfirmDialogService,
                Cinema6Service,
                mockRole,
                mockPolicies;

            function compileCtrl(id) {
                $routeParams = { id: id };

                $scope = $rootScope.$new();

                RoleCtrl = $controller('RoleController', {
                    $log: $log,
                    $scope: $scope,
                    $routeParams: $routeParams,
                    ConfirmDialogService: ConfirmDialogService,
                    Cinema6Service: Cinema6Service
                });
            }

            beforeEach(function() {
                module(proshop.name);

                ConfirmDialogService = {
                    display: jasmine.createSpy('ConfirmDialogService.display()'),
                    close: jasmine.createSpy('ConfirmDialogService.close()')
                };

                Cinema6Service = {
                    getAll: jasmine.createSpy('Cinema6Service.getAll'),
                    get: jasmine.createSpy('Cinema6Service.get'),
                    put: jasmine.createSpy('Cinema6Service.put'),
                    post: jasmine.createSpy('Cinema6Service.post'),
                    delete: jasmine.createSpy('Cinema6Service.delete')
                }

                /* jshint quotmark:false */
                mockRole = {
                    "id": "r-111",
                    "name": "StudioRole",
                    "created": "2015-06-13T19:28:39.408Z",
                    "lastUpdated": "2015-06-13T19:28:39.408Z",
                    "status": "active",
                    "policies": ["MiniReelCreator"]
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
                            "name": "CampaignManager",
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
                            "name": "MiniReelCreator",
                            "created": "2015-06-13T19:28:39.408Z",
                            "lastUpdated": "2015-06-13T19:28:39.408Z",
                            "status": "active",
                            "applications": ["e-studio-experience"],
                            "permissions": {},
                            "fieldValidation": {}
                        },
                        {
                            "id": "p-113",
                            "name": "SelfieUser",
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
                };
                /* jshint quotmark:single */

                inject(function($injector) {
                    $rootScope = $injector.get('$rootScope');
                    $controller = $injector.get('$controller');
                    $location = $injector.get('$location');
                    $log = $injector.get('$log');
                    $q = $injector.get('$q');

                    spyOn($location, 'path');
                    $log.context = function(){ return $log; }

                    Cinema6Service.getAll.deferred = $q.defer();
                    Cinema6Service.getAll.and.returnValue(Cinema6Service.getAll.deferred.promise);

                    Cinema6Service.get.deferred = $q.defer();
                    Cinema6Service.get.and.returnValue(Cinema6Service.get.deferred.promise);

                    Cinema6Service.put.deferred = $q.defer();
                    Cinema6Service.put.and.returnValue(Cinema6Service.put.deferred.promise);

                    Cinema6Service.post.deferred = $q.defer();
                    Cinema6Service.post.and.returnValue(Cinema6Service.post.deferred.promise);

                    Cinema6Service.delete.deferred = $q.defer();
                    Cinema6Service.delete.and.returnValue(Cinema6Service.delete.deferred.promise);
                });
            });

            describe('initialization', function() {
                describe('when path has /:id', function() {
                    beforeEach(function() {
                        compileCtrl('r-111');
                    });

                    it('should exist', function() {
                        expect(RoleCtrl).toBeDefined();
                    });

                    it('should load the customer and all advertisers', function() {
                        expect(Cinema6Service.get).toHaveBeenCalledWith('roles','r-111');
                        expect(Cinema6Service.getAll).toHaveBeenCalledWith('policies',{});
                    });
                });

                describe('when path is /new', function() {
                    beforeEach(function() {
                        compileCtrl();
                    });

                    it('should exist', function() {
                        expect(RoleCtrl).toBeDefined();
                    });

                    it('should not load a customer', function() {
                        expect(Cinema6Service.get).not.toHaveBeenCalled();
                    });

                    it('should load all advertisers', function() {
                        expect(Cinema6Service.getAll).toHaveBeenCalledWith('policies',{});
                    });
                });
            });

            describe('properties', function() {
                describe('loading', function() {
                    describe('/new', function() {
                        beforeEach(function() {
                            compileCtrl();
                        });
                        it('should be true on initialization', function() {
                            expect(RoleCtrl.loading).toBe(true);
                        });

                        it('should be false after all advertiser are loaded', function() {
                            $scope.$apply(function() {
                                Cinema6Service.getAll.deferred.resolve(mockPolicies);
                            });

                            expect(RoleCtrl.loading).toBe(false);
                        });

                        it('should be false even if there are errors loading data', function() {
                            $scope.$apply(function() {
                                Cinema6Service.getAll.deferred.reject();
                            });

                            expect(RoleCtrl.loading).toBe(false);
                        });
                    });

                    describe('/:id', function() {
                        beforeEach(function() {
                            compileCtrl('r-111');
                        });

                        it('should be true on initialization', function() {
                            expect(RoleCtrl.loading).toBe(true);
                        });

                        it('should be false after all data promises resolve', function() {
                            $scope.$apply(function() {
                                Cinema6Service.get.deferred.resolve(angular.copy(mockRole));
                                Cinema6Service.getAll.deferred.resolve(mockPolicies);
                            });

                            expect(RoleCtrl.loading).toBe(false);
                        });

                        it('should be false even if there are errors loading data', function() {
                            $scope.$apply(function() {
                                Cinema6Service.get.deferred.reject();
                                Cinema6Service.getAll.deferred.reject();
                            });

                            expect(RoleCtrl.loading).toBe(false);
                        });
                    });
                });
            });

            describe('methods', function() {
                describe('addPolicy(policy)', function() {
                    it('should add the policy', function() {
                        compileCtrl();

                        $scope.$apply(function() {
                            Cinema6Service.getAll.deferred.resolve(mockPolicies);
                        });

                        expect(RoleCtrl.role.policies.length).toBe(0);

                        RoleCtrl.addPolicy(mockPolicies.data[0]);
                        RoleCtrl.addPolicy(mockPolicies.data[1]);

                        expect(RoleCtrl.role.policies.length).toBe(2);
                        expect(RoleCtrl.role.policies[0]).toEqual(mockPolicies.data[0].name);
                        expect(RoleCtrl.role.policies[1]).toEqual(mockPolicies.data[1].name);
                    });
                });

                describe('removePolicy(index)', function() {
                    it('should remove the policy', function() {
                        compileCtrl('r-111');

                        $scope.$apply(function() {
                            Cinema6Service.get.deferred.resolve(angular.copy(mockRole));
                            Cinema6Service.getAll.deferred.resolve(mockPolicies);
                        });

                        expect(RoleCtrl.role.policies).toEqual([mockPolicies.data[1].name]);
                        expect(RoleCtrl.role.policies.length).toBe(1);

                        RoleCtrl.removePolicy(0);

                        expect(RoleCtrl.role.policies.length).toBe(0);

                        RoleCtrl.role.policies = [mockPolicies.data[0].name, mockPolicies.data[1].name];

                        expect(RoleCtrl.role.policies.length).toBe(2);

                        RoleCtrl.removePolicy(1);

                        expect(RoleCtrl.role.policies.length).toBe(1);
                        expect(RoleCtrl.role.policies[0]).toEqual(mockPolicies.data[0].name);
                    });
                });

                describe('save(role)', function() {
                    describe('when /new', function() {
                        beforeEach(function() {
                            compileCtrl();

                            $scope.$apply(function() {
                                Cinema6Service.getAll.deferred.resolve(mockPolicies);
                            });

                            RoleCtrl.role.name = 'NewRole';
                        });

                        it('should POST the customer', function() {
                            RoleCtrl.save(RoleCtrl.role);

                            expect(Cinema6Service.post).toHaveBeenCalledWith('roles', {
                                name: 'NewRole',
                                policies: []
                            });

                            RoleCtrl.role.policies = [mockPolicies.data[0].name, mockPolicies.data[2].name];

                            RoleCtrl.save(RoleCtrl.role);

                            expect(Cinema6Service.post).toHaveBeenCalledWith('roles', {
                                name: 'NewRole',
                                policies: ['CampaignManager', 'SelfieUser']
                            });
                        });

                        it('should return to /customers on successful save', function() {
                            RoleCtrl.save(RoleCtrl.role);

                            $scope.$apply(function() {
                                Cinema6Service.post.deferred.resolve(RoleCtrl.role);
                            });

                            expect($location.path).toHaveBeenCalledWith('/roles');
                        });

                        it('should display an error dialog on failure', function() {
                            RoleCtrl.save(RoleCtrl.role);

                            $scope.$apply(function() {
                                Cinema6Service.post.deferred.reject('Error message');
                            });

                            expect(ConfirmDialogService.display).toHaveBeenCalled();
                            expect(ConfirmDialogService.display.calls.mostRecent().args[0].prompt).toBe('There was a problem saving the Role. Error message.');
                        });
                    });

                    describe('when /:id', function() {
                        beforeEach(function() {
                            compileCtrl('r-111');

                            $scope.$apply(function() {
                                Cinema6Service.get.deferred.resolve(mockRole);
                                Cinema6Service.getAll.deferred.resolve(mockPolicies);
                            });
                        });

                        it('should PUT the role', function() {
                            RoleCtrl.save(RoleCtrl.role);

                            expect(Cinema6Service.put).toHaveBeenCalledWith('roles', 'r-111', jasmine.objectContaining({
                                name: 'StudioRole',
                                policies: ['MiniReelCreator']
                            }));

                            RoleCtrl.role.name = 'DifferentRole';
                            RoleCtrl.role.policies = [mockPolicies.data[0].name, mockPolicies.data[2].name];

                            RoleCtrl.save(RoleCtrl.role);

                            expect(Cinema6Service.put).toHaveBeenCalledWith('roles', 'r-111', jasmine.objectContaining({
                                name: 'DifferentRole',
                                policies: ['CampaignManager', 'SelfieUser']
                            }));
                        });

                        it('should return to /roles on successful save', function() {
                            RoleCtrl.save(RoleCtrl.role);

                            $scope.$apply(function() {
                                Cinema6Service.put.deferred.resolve(RoleCtrl.role);
                            });

                            expect($location.path).toHaveBeenCalledWith('/roles');
                        });

                        it('should display an error dialog on failure', function() {
                            RoleCtrl.save(RoleCtrl.role);

                            $scope.$apply(function() {
                                Cinema6Service.put.deferred.reject('Error message');
                            });

                            expect(ConfirmDialogService.display).toHaveBeenCalled();
                            expect(ConfirmDialogService.display.calls.mostRecent().args[0].prompt).toBe('There was a problem saving the Role. Error message.');
                        });
                    });
                });

                describe('delete(customer)', function() {
                    var onAffirm, onCancel;

                    beforeEach(function() {
                        compileCtrl('r-111');

                        $scope.$apply(function() {
                            Cinema6Service.get.deferred.resolve(mockRole);
                            Cinema6Service.getAll.deferred.resolve(mockPolicies);
                        });

                        RoleCtrl.delete();

                        onAffirm = ConfirmDialogService.display.calls.mostRecent().args[0].onAffirm;
                        onCancel = ConfirmDialogService.display.calls.mostRecent().args[0].onCancel;
                    });

                    it('should display a confirmation dialog', function() {
                        expect(ConfirmDialogService.display).toHaveBeenCalled();
                    });

                    describe('onAffirm()', function() {
                        it('should close the dialog and delete customer', function() {
                            onAffirm();

                            expect(ConfirmDialogService.close).toHaveBeenCalled();
                            expect(Cinema6Service.delete).toHaveBeenCalled();
                        });

                        describe('when delete is successful', function() {
                            it('should show redirect back to full customer list', function() {
                                onAffirm();

                                $scope.$apply(function() {
                                    Cinema6Service.delete.deferred.resolve();
                                });

                                expect($location.path).toHaveBeenCalledWith('/roles');
                            });
                        });

                        describe('when delete fails', function() {
                            it('should display an error dialog', function() {
                                onAffirm();

                                ConfirmDialogService.display.calls.reset();

                                $scope.$apply(function() {
                                    Cinema6Service.delete.deferred.reject('Error message');
                                });

                                expect(ConfirmDialogService.display).toHaveBeenCalled();
                                expect(ConfirmDialogService.display.calls.mostRecent().args[0].prompt).toBe('There was a problem deleting the Role. Error message.');
                            });
                        });
                    });

                    describe('onCancel()', function() {
                        it('should close the dialog without deleting or changing views', function() {
                            onCancel();

                            expect(ConfirmDialogService.close).toHaveBeenCalled();
                            expect(Cinema6Service.delete).not.toHaveBeenCalled();
                        });
                    });
                });
            });
        });
    });
}());