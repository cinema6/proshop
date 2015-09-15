(function() {
    'use strict';

    define(['app'], function(proshop) {
        describe('PolicyController', function() {
            var $rootScope,
                $scope,
                $controller,
                $q,
                $log,
                $routeParams,
                $location,
                PolicyCtrl,
                ConfirmDialogService,
                Cinema6Service,
                mockPolicy,
                mockExperiences,
                appData,
                content;

            var annotations;

            function compileCtrl(id) {
                $routeParams = { id: id };

                $scope = $rootScope.$new();

                PolicyCtrl = $controller('PolicyController', {
                    $log: $log,
                    $scope: $scope,
                    $routeParams: $routeParams,
                    appData: appData,
                    ConfirmDialogService: ConfirmDialogService,
                    Cinema6Service: Cinema6Service,
                    content: content
                });
            }

            function ACEEditor(id) {
                this.session = {
                    getAnnotations: function() {
                        return annotations;
                    },
                    on: function(eventName, handler) {
                        this.handleAnnotationChange = handler;
                    }
                };

                this.container = {
                    id: id
                };

                this.getSession = function() {
                    return this.session;
                };

                this.handleAnnotationChange = function() {};
            }

            beforeEach(function() {
                module(proshop.name);

                appData = {
                    appUser: {
                        fieldValidation: {}
                    },
                    proshop: {
                        data: {
                            allApplications: [
                                'e-proshop-experience',
                                'e-selfie-experience',
                                'e-studio-experience'
                            ]
                        }
                    }
                };

                annotations = [];

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
                };

                content = {
                    getExperiences: jasmine.createSpy('content.getExperiences')
                };

                /* jshint quotmark:false */
                // the 'advertisers' property has been decorated.
                // In the real app this takes place in the CustomerAdapter
                mockPolicy = {
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
                        "e-proshop-experience",
                        "e-selfie-experience"
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
                };

                mockExperiences = {
                    meta: {
                        items: {
                            start: 1,
                            end: 3,
                            total: 3
                        }
                    },
                    data: [
                        {
                            "id": "e-proshop-experience",
                            "title": "ProShop",
                            "created": "2014-06-13T19:28:39.408Z",
                            "lastUpdated": "2015-01-12T18:06:52.877Z",
                            "status": "active"
                        },
                        {
                            "id": "e-selfie-experience",
                            "title": "Selfie",
                            "created": "2014-06-13T19:28:39.408Z",
                            "lastUpdated": "2014-06-13T19:28:39.408Z",
                            "status": "active"
                        },
                        {
                            "id": "e-studio-experience",
                            "title": "Studio",
                            "created": "2014-06-13T19:28:39.408Z",
                            "lastUpdated": "2014-06-13T19:28:39.408Z",
                            "status": "active"
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

                    content.getExperiences.deferred = $q.defer();
                    content.getExperiences.and.returnValue(content.getExperiences.deferred.promise);
                });
            });

            describe('initialization', function() {
                describe('when path has /:id', function() {
                    beforeEach(function() {
                        compileCtrl('p-111');
                    });

                    it('should exist', function() {
                        expect(PolicyCtrl).toBeDefined();
                    });

                    it('should load the policy', function() {
                        expect(Cinema6Service.get).toHaveBeenCalledWith('policies','p-111');
                        expect(content.getExperiences).not.toHaveBeenCalled();
                    });
                });

                describe('when path is /new', function() {
                    beforeEach(function() {
                        compileCtrl();
                    });

                    it('should exist', function() {
                        expect(PolicyCtrl).toBeDefined();
                    });

                    it('should not load a policy', function() {
                        expect(Cinema6Service.get).not.toHaveBeenCalled();
                        expect(content.getExperiences).not.toHaveBeenCalled();
                    });
                });

                describe('when app user has some enabled policy applications', function() {
                    it('should load only those application experiences that are enabled', function() {
                        appData.appUser.fieldValidation.policies = {
                            applications: {
                                __entries: {
                                    __acceptableValues: ['e-proshop-experience','e-studio-experience']
                                }
                            }
                        };

                        compileCtrl();

                        expect(content.getExperiences).toHaveBeenCalledWith({ ids: 'e-proshop-experience,e-studio-experience'});
                    });
                });

                describe('when app user has wilcard (*) policy applications', function() {
                    it('should load all applications', function() {
                        appData.appUser.fieldValidation.policies = {
                            applications: {
                                __entries: {
                                    __acceptableValues: '*'
                                }
                            }
                        };

                        compileCtrl();

                        expect(content.getExperiences).toHaveBeenCalledWith({ ids: 'e-proshop-experience,e-selfie-experience,e-studio-experience'});
                    })
                });
            });

            describe('properties', function() {
                describe('loading', function() {
                    describe('/new', function() {
                        beforeEach(function() {
                            compileCtrl();
                        });

                        it('should be false on initialization', function() {
                            $scope.$digest();
                            expect(PolicyCtrl.loading).toBe(false);
                        });
                    });

                    describe('/:id', function() {
                        beforeEach(function() {
                            compileCtrl('cus-111');
                        });

                        it('should be true on initialization', function() {
                            expect(PolicyCtrl.loading).toBe(true);
                        });

                        it('should be false after all data promises resolve', function() {
                            $scope.$apply(function() {
                                Cinema6Service.get.deferred.resolve(angular.copy(mockPolicy));
                            });

                            expect(PolicyCtrl.loading).toBe(false);
                        });

                        it('should be false even if there are errors loading data', function() {
                            $scope.$apply(function() {
                                Cinema6Service.get.deferred.reject();
                            });

                            expect(PolicyCtrl.loading).toBe(false);
                        });
                    });
                });

                describe('sessions', function() {
                    var permissionsEditor, fieldValidationEditor;

                    beforeEach(function() {
                        permissionsEditor = new ACEEditor('permissions'),
                        fieldValidationEditor = new ACEEditor('fieldValidation');

                        compileCtrl();

                        PolicyCtrl.aceLoaded(permissionsEditor);
                        PolicyCtrl.aceLoaded(fieldValidationEditor);
                    });

                    it('should have a session for each ACE instance', function() {
                        expect(PolicyCtrl.sessions.permissions).toEqual(jasmine.any(Object));
                        expect(PolicyCtrl.sessions.fieldValidation).toEqual(jasmine.any(Object));
                    });

                    describe('error', function() {
                        it('should be false on initialization', function() {
                            expect(PolicyCtrl.sessions.permissions.error).toEqual(false);
                            expect(PolicyCtrl.sessions.fieldValidation.error).toEqual(false);
                        });

                        describe('on annotation change', function() {
                            it('should call for annotations and be true if an error annotation is found, and false otherwise', function() {
                                annotations.push({type: 'error'});

                                spyOn(permissionsEditor.session, 'getAnnotations').and.callThrough();

                                permissionsEditor.session.handleAnnotationChange();

                                expect(permissionsEditor.session.getAnnotations).toHaveBeenCalled();
                                expect(PolicyCtrl.sessions.permissions.error).toBe(true);

                                annotations = [];

                                permissionsEditor.session.handleAnnotationChange();
                                expect(PolicyCtrl.sessions.permissions.error).toBe(false);
                            });
                        });
                    });
                });
            });

            describe('methods', function() {
                beforeEach(function() {
                    appData.appUser.fieldValidation.policies = {
                        applications: {
                            __entries: {
                                __acceptableValues: ['e-proshop-experience','e-selfie-experience','e-studio-experience']
                            }
                        }
                    };
                });

                describe('aceLoaded(editor)', function() {
                    it('should add a new ACE session to the controller', function() {
                        var permissionsEditor = new ACEEditor('permissions'),
                            fieldValidationEditor = new ACEEditor('fieldValidation');

                        spyOn(permissionsEditor, 'getSession').and.callThrough();
                        spyOn(fieldValidationEditor, 'getSession').and.callThrough();

                        spyOn(permissionsEditor.session, 'on').and.callThrough();
                        spyOn(fieldValidationEditor.session, 'on').and.callThrough();

                        PolicyCtrl.aceLoaded(permissionsEditor);
                        PolicyCtrl.aceLoaded(fieldValidationEditor);

                        expect(permissionsEditor.getSession).toHaveBeenCalled();
                        expect(PolicyCtrl.sessions.permissions.handleAnnotationChange).toEqual(jasmine.any(Function));
                        expect(PolicyCtrl.sessions.permissions.session).toEqual(permissionsEditor.session);
                        expect(permissionsEditor.session.on).toHaveBeenCalledWith('changeAnnotation', PolicyCtrl.sessions.permissions.handleAnnotationChange);

                        expect(fieldValidationEditor.getSession).toHaveBeenCalled();
                        expect(PolicyCtrl.sessions.fieldValidation.handleAnnotationChange).toEqual(jasmine.any(Function));
                        expect(PolicyCtrl.sessions.fieldValidation.session).toEqual(fieldValidationEditor.session);
                        expect(fieldValidationEditor.session.on).toHaveBeenCalledWith('changeAnnotation', PolicyCtrl.sessions.fieldValidation.handleAnnotationChange);
                    });
                });

                describe('addApplication(application)', function() {
                    it('should add the application', function() {
                        compileCtrl();

                        $scope.$apply(function() {
                            content.getExperiences.deferred.resolve(mockExperiences);
                        });

                        expect(PolicyCtrl.policy.applications.length).toBe(0);

                        PolicyCtrl.addApplication(mockExperiences.data[0]);
                        PolicyCtrl.addApplication(mockExperiences.data[1]);
                        PolicyCtrl.addApplication(mockExperiences.data[2]);

                        expect(PolicyCtrl.policy.applications.length).toBe(3);
                        expect(PolicyCtrl.policy.applications[0]).toEqual(mockExperiences.data[0]);
                        expect(PolicyCtrl.policy.applications[1]).toEqual(mockExperiences.data[1]);
                        expect(PolicyCtrl.policy.applications[2]).toEqual(mockExperiences.data[2]);
                    });
                });

                describe('removeApplication(index)', function() {
                    it('should remove the advertiser', function() {
                        compileCtrl('p-111');

                        $scope.$apply(function() {
                            Cinema6Service.get.deferred.resolve(angular.copy(mockPolicy));
                            content.getExperiences.deferred.resolve(mockExperiences);
                        });

                        expect(PolicyCtrl.policy.applications.length).toBe(2);

                        PolicyCtrl.removeApplication(0);

                        expect(PolicyCtrl.policy.applications.length).toBe(1);

                        PolicyCtrl.removeApplication(0);

                        expect(PolicyCtrl.policy.applications.length).toBe(0);
                    });
                });

                describe('save(policy)', function() {
                    describe('when /new', function() {
                        beforeEach(function() {
                            compileCtrl();

                            $scope.$apply(function() {
                                content.getExperiences.deferred.resolve(mockExperiences);
                            });

                            PolicyCtrl.policy.name = 'New Policy';
                        });

                        it('should POST the policy', function() {
                            PolicyCtrl.save(PolicyCtrl.policy);

                            expect(Cinema6Service.post).toHaveBeenCalledWith('policies', {
                                name: 'New Policy',
                                priority: 1,
                                applications: [],
                                fieldValidation: {},
                                permissions: {},
                                entitlements: {}
                            });

                            PolicyCtrl.fieldValidation = '{"campaigns":{}}';
                            PolicyCtrl.permissions = '{"miniReels":{}}';
                            PolicyCtrl.entitlements = '{"canSave":true}';

                            PolicyCtrl.save(PolicyCtrl.policy);

                            expect(Cinema6Service.post).toHaveBeenCalledWith('policies', {
                                name: 'New Policy',
                                priority: 1,
                                applications: [],
                                fieldValidation: {
                                    campaigns: {}
                                },
                                permissions: {
                                    miniReels: {}
                                },
                                entitlements: {
                                    canSave: true
                                }
                            });
                        });

                        it('should return to /policies on successful save', function() {
                            PolicyCtrl.save(PolicyCtrl.policy);

                            $scope.$apply(function() {
                                Cinema6Service.post.deferred.resolve(PolicyCtrl.policy);
                            });

                            expect($location.path).toHaveBeenCalledWith('/policies');
                        });

                        it('should display an error dialog on failure', function() {
                            PolicyCtrl.save(PolicyCtrl.policy);

                            $scope.$apply(function() {
                                Cinema6Service.post.deferred.reject('Error message');
                            });

                            expect(ConfirmDialogService.display).toHaveBeenCalled();
                            expect(ConfirmDialogService.display.calls.mostRecent().args[0].prompt).toBe('There was a problem saving the Policy. Error message.');
                        });
                    });

                    describe('when /:id', function() {
                        beforeEach(function() {
                            compileCtrl('p-111');

                            $scope.$apply(function() {
                                Cinema6Service.get.deferred.resolve(mockPolicy);
                                content.getExperiences.deferred.resolve(mockExperiences);
                            });
                        });

                        it('should PUT the policy', function() {
                            PolicyCtrl.save(PolicyCtrl.policy);

                            expect(Cinema6Service.put).toHaveBeenCalledWith('policies', 'p-111', jasmine.any(Object));

                            PolicyCtrl.policy.name = 'New Name';
                            PolicyCtrl.fieldValidation = '{"campaigns":{}}';
                            PolicyCtrl.permissions = '{"miniReels":{}}';
                            PolicyCtrl.entitlements = '{"canSave":true}';

                            PolicyCtrl.save(PolicyCtrl.policy);

                            expect(Cinema6Service.put).toHaveBeenCalledWith('policies', 'p-111', jasmine.objectContaining({
                                name: 'New Name',
                                fieldValidation: {
                                    campaigns: {}
                                },
                                permissions: {
                                    miniReels: {}
                                },
                                entitlements: {
                                    canSave: true
                                }
                            }));
                        });

                        it('should return to /policies on successful save', function() {
                            PolicyCtrl.save(PolicyCtrl.policy);

                            $scope.$apply(function() {
                                Cinema6Service.put.deferred.resolve(PolicyCtrl.policy);
                            });

                            expect($location.path).toHaveBeenCalledWith('/policies');
                        });

                        it('should display an error dialog on failure', function() {
                            PolicyCtrl.save(PolicyCtrl.policy);

                            $scope.$apply(function() {
                                Cinema6Service.put.deferred.reject('Error message');
                            });

                            expect(ConfirmDialogService.display).toHaveBeenCalled();
                            expect(ConfirmDialogService.display.calls.mostRecent().args[0].prompt).toBe('There was a problem saving the Policy. Error message.');
                        });
                    });
                });

                describe('delete(policy)', function() {
                    var onAffirm, onCancel;

                    beforeEach(function() {
                        compileCtrl('p-111');

                        $scope.$apply(function() {
                            Cinema6Service.get.deferred.resolve(mockPolicy);
                            content.getExperiences.deferred.resolve(mockExperiences);
                        });

                        PolicyCtrl.delete();

                        onAffirm = ConfirmDialogService.display.calls.mostRecent().args[0].onAffirm;
                        onCancel = ConfirmDialogService.display.calls.mostRecent().args[0].onCancel;
                    });

                    it('should display a confirmation dialog', function() {
                        expect(ConfirmDialogService.display).toHaveBeenCalled();
                    });

                    describe('onAffirm()', function() {
                        it('should close the dialog and delete policy', function() {
                            onAffirm();

                            expect(ConfirmDialogService.close).toHaveBeenCalled();
                            expect(Cinema6Service.delete).toHaveBeenCalled();
                        });

                        describe('when delete is successful', function() {
                            it('should show redirect back to full policy list', function() {
                                onAffirm();

                                $scope.$apply(function() {
                                    Cinema6Service.delete.deferred.resolve();
                                });

                                expect($location.path).toHaveBeenCalledWith('/policies');
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
                                expect(ConfirmDialogService.display.calls.mostRecent().args[0].prompt).toBe('There was a problem deleting the Policy. Error message.');
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