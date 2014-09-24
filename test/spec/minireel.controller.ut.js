(function() {
    'use strict';

    define(['minireels'], function() {
        describe('MinireelsController', function() {
            var $rootScope,
                $scope,
                $controller,
                $log,
                $q,
                MinireelsCtrl,
                ConfirmDialogService,
                CollateralService,
                account,
                content,
                appData,
                mockOrgs,
                mockExperiences,
                mockUser,
                mockUsers;

            beforeEach(function() {
                module('c6.proshop');

                appData = {
                    appUser : null,
                    user: null, users: null, org: null, orgs: null
                };

                mockOrgs = [
                    {
                        id: 'o-1',
                        name: 'Org1',
                        status: 'active',
                        config: {},
                        waterfalls: {
                            video: ['cinema6'],
                            display: ['cinema6']
                        }
                    },
                    {
                        id: 'o-2',
                        name: 'Org2',
                        status: 'active',
                        config: {},
                        waterfalls: {
                            video: ['cinema6'],
                            display: ['cinema6']
                        }
                    }
                ];

                mockExperiences = [
                    {
                        id: 'e-1',
                        title: 'Great Minireel',
                        user: 'u-1',
                        org: 'o-1',
                        data: {
                            collateral: {
                                splash: '/collateral/e-1/splash'
                            },
                            splash: {},
                            adConfig: {}
                        }
                    },
                    {
                        id: 'e-2',
                        title: 'Awesome Minireel',
                        user: 'u-2',
                        org: 'o-2',
                        data: {
                            collateral: {
                                splash: '/collateral/e-2/splash'
                            },
                            splash: {}
                        }
                    }
                ];

                mockUser = {
                    id: 'u-1',
                    email: 'foo@bar.com'
                };

                mockUsers = [
                    {
                        id: 'u-1',
                        email: 'foo@bar.com'
                    },
                    {
                        id: 'u-2',
                        email: 'user2@mail.com'
                    }
                ];

                inject(function($injector) {
                    $controller = $injector.get('$controller');
                    $log = $injector.get('$log');
                    $q = $injector.get('$q');
                    $rootScope = $injector.get('$rootScope');

                    CollateralService = $injector.get('CollateralService');
                    ConfirmDialogService = $injector.get('ConfirmDialogService');
                    account = $injector.get('account');
                    content = $injector.get('content');

                    spyOn(ConfirmDialogService, 'display');
                    spyOn(ConfirmDialogService, 'close');

                    spyOn(account, 'getOrgs');
                    spyOn(account, 'getUser');
                    spyOn(account, 'getUsers');
                    spyOn(account, 'convertOrgForEditing').and.callThrough();

                    account.getOrgs.deferred = $q.defer();
                    account.getOrgs.and.returnValue(account.getOrgs.deferred.promise);

                    account.getUser.deferred = $q.defer();
                    account.getUser.and.returnValue(account.getUser.deferred.promise);

                    account.getUsers.deferred = $q.defer();
                    account.getUsers.and.returnValue(account.getUsers.deferred.promise);

                    spyOn(content, 'getExperiencesByOrg');
                    spyOn(content, 'convertExperienceForCopy').and.callThrough();
                    spyOn(content, 'postExperience');
                    spyOn(content, 'putExperience');

                    content.getExperiencesByOrg.deferred = $q.defer();
                    content.getExperiencesByOrg.and.returnValue(content.getExperiencesByOrg.deferred.promise);

                    content.postExperience.deferred = $q.defer();
                    content.postExperience.and.returnValue(content.postExperience.deferred.promise);

                    content.putExperience.deferred = $q.defer();
                    content.putExperience.and.returnValue(content.postExperience.deferred.promise);

                    $log.context = function(){ return $log; }

                    $scope = $rootScope.$new();
                    $scope.data = {
                        appData: appData
                    };

                    MinireelsCtrl = $controller('MinireelsController', {
                        $log: $log,
                        $scope: $scope,
                        account: account,
                        content: content
                    });
                });
            });

            describe('initialization', function() {
                it('should exist', function() {
                    expect(MinireelsCtrl).toBeDefined();
                });

                it('should set some defaults', function() {
                    expect(MinireelsCtrl.action).toBe('orgs');
                    expect($scope.data.org).toBe(null);
                });

                it('should fetch all orgs', function() {
                    expect(account.getOrgs).toHaveBeenCalled();
                });
            });

            describe('methods', function() {
                describe('filterOrgs()', function() {
                    it('should filter orgs by name', function() {
                        $scope.$apply(function() {
                            account.getOrgs.deferred.resolve(angular.copy(mockOrgs));
                        });

                        expect($scope.data.orgs.length).toBe(2);

                        $scope.data.query = '1';
                        MinireelsCtrl.filterOrgs();
                        expect($scope.data.orgs.length).toBe(1);

                        $scope.data.query = 'o';
                        MinireelsCtrl.filterOrgs();
                        expect($scope.data.orgs.length).toBe(2);

                        $scope.data.query = 'x';
                        MinireelsCtrl.filterOrgs();
                        expect($scope.data.orgs.length).toBe(0);

                        $scope.data.query = 'ORG';
                        MinireelsCtrl.filterOrgs();
                        expect($scope.data.orgs.length).toBe(2);
                    });
                });

                describe('filterExperiences()', function() {
                    it('should filter experiences by title', function() {
                        $scope.$apply(function() {
                            account.getOrgs.deferred.resolve(angular.copy(mockOrgs));
                        });

                        $scope.data.org = $scope.data.orgs[0];

                        $scope.$apply(function() {
                            content.getExperiencesByOrg.deferred.resolve(angular.copy(mockExperiences));
                        });

                        expect($scope.data.experiences.length).toBe(2);

                        $scope.data.query = 'g';
                        MinireelsCtrl.filterExperiences();
                        expect($scope.data.experiences.length).toBe(1);

                        $scope.data.query = 'A';
                        MinireelsCtrl.filterExperiences();
                        expect($scope.data.experiences.length).toBe(2);

                        $scope.data.query = 'x';
                        MinireelsCtrl.filterExperiences();
                        expect($scope.data.experiences.length).toBe(0);

                        $scope.data.query = 'MINI';
                        MinireelsCtrl.filterExperiences();
                        expect($scope.data.experiences.length).toBe(2);
                    });
                });

                describe('startExperienceCopy()', function() {
                    it('should set the action to "copy", null out any org data on the scope, and convert the experience for copying', function() {
                        $scope.$apply(function() {
                            account.getOrgs.deferred.resolve(angular.copy(mockOrgs));
                        });

                        MinireelsCtrl.startExperienceCopy(mockExperiences[0]);

                        expect(MinireelsCtrl.action).toBe('copy');
                        expect($scope.data.org).toBe(null);
                        expect($scope.data.user).toBe(null);
                        expect($scope.data.orgs).toEqual(mockOrgs);
                        expect(content.convertExperienceForCopy).toHaveBeenCalled();
                    });
                });

                describe('confirmCopy()', function() {
                    var onAffirm, onCancel;

                    beforeEach(function() {
                        $scope.$apply(function() {
                            // resolve initial Orgs load
                            account.getOrgs.deferred.resolve(angular.copy(mockOrgs));
                        });

                        // select an Org to see experiences
                        $scope.data.org = $scope.data.orgs[0];

                        $scope.$apply(function() {
                            // resolve with Org's experiences
                            content.getExperiencesByOrg.deferred.resolve(angular.copy(mockExperiences));
                            account.getUser.deferred.resolve(angular.copy(mockUsers[0]));
                        });

                        // select an experience to copy
                        MinireelsCtrl.startExperienceCopy($scope.data.experiences[0]);

                        // select a different Org to copy to
                        $scope.data.org = $scope.data.orgs[1];

                        $scope.$apply(function() {
                            // resolve with Org's experiences
                            account.getUsers.deferred.resolve(angular.copy(mockUsers));
                        });

                        $scope.data.user = $scope.data.users[0];

                        $scope.$digest();

                        MinireelsCtrl.confirmCopy();

                        onAffirm = ConfirmDialogService.display.calls.mostRecent().args[0].onAffirm;
                        onCancel = ConfirmDialogService.display.calls.mostRecent().args[0].onCancel;
                    });

                    it('pop up a ConfirmDialog', function() {
                        expect(ConfirmDialogService.display).toHaveBeenCalled();
                    });

                    describe('when affirmed', function() {
                        beforeEach(function() {
                            spyOn(CollateralService, 'generateCollage');
                            spyOn(CollateralService, 'setSplash');

                            CollateralService.generateCollage.deferred = $q.defer();
                            CollateralService.generateCollage.and.returnValue(CollateralService.generateCollage.deferred.promise);

                            CollateralService.setSplash.deferred = $q.defer();
                            CollateralService.setSplash.and.returnValue(CollateralService.setSplash.deferred.promise);

                            onAffirm();
                        });

                        it('should POST the experience without a splash src or adConfig', function() {
                            expect(content.postExperience).toHaveBeenCalledWith({
                                user: 'u-1', // set to target user
                                data: {
                                    collateral: {
                                        splash: null
                                    },
                                    splash: {
                                        ratio: '3-2',
                                        theme: 'img-text-overlay', // set by default from target org
                                    },
                                    title: 'Great Minireel', // copied from exp
                                    mode: 'light', // set by default
                                    autoplay: true, // set by default
                                },
                                origExpId: 'e-1',
                                origOrg: 'o-1',
                                origUser: 'u-1',
                                status: 'active', // set by default in content service
                                access: 'public', // set by default in content service
                                org: 'o-2' // set to target org
                            });
                        });

                        describe('if POST is successful', function() {
                            describe('if splash needs to be generated', function() {
                                var postedExperience;

                                beforeEach(function() {
                                    postedExperience = {
                                        id: 'e-1',
                                        data: {
                                            collateral: {},
                                            splash: {
                                                source: 'generated',
                                                ratio: '3-2'
                                            }
                                        }
                                    };

                                    $scope.$apply(function() {
                                        content.postExperience.deferred.resolve(postedExperience);
                                    });
                                });

                                it('should generate splash image if needed', function() {
                                    expect(CollateralService.generateCollage).toHaveBeenCalledWith({
                                        minireel: postedExperience,
                                        width: 600,
                                        name: 'splash',
                                        cache: false
                                    });

                                    $scope.$apply(function() {
                                        CollateralService.generateCollage.deferred.resolve({'3-2': '/collateral/newfile'});
                                    });

                                    expect(postedExperience.data.collateral.splash).toBe('/collateral/newfile');
                                });

                                it('should popup another ConfirmDialog if error', function() {
                                    $scope.$apply(function() {
                                        CollateralService.generateCollage.deferred.reject('Error generating splash');
                                    });

                                    expect(ConfirmDialogService.display).toHaveBeenCalled();
                                    expect(ConfirmDialogService.display.calls.count()).toBe(2);
                                });
                            });

                            describe('if splash is specified and needs to be copied', function() {
                                var postedExperience;

                                beforeEach(function() {
                                    postedExperience = {
                                        id: 'e-1',
                                        data: {
                                            collateral: {},
                                            splash: {
                                                source: 'specified'
                                            }
                                        }
                                    };

                                     $scope.$apply(function() {
                                        content.postExperience.deferred.resolve(postedExperience);
                                    });
                                });

                                it('should copy specified splash if needed', function() {
                                    expect(CollateralService.setSplash).toHaveBeenCalledWith('/collateral/e-1/splash',postedExperience);

                                    $scope.$apply(function() {
                                        CollateralService.setSplash.deferred.resolve({
                                            data: [{path: 'collateral/newfile'}]
                                        });
                                    });

                                    expect(postedExperience.data.collateral.splash).toBe('/collateral/newfile');
                                });

                                it('should popup another ConfirmDialog if error', function() {
                                    $scope.$apply(function() {
                                        CollateralService.setSplash.deferred.reject('Error generating splash');
                                    });

                                    expect(ConfirmDialogService.display).toHaveBeenCalled();
                                    expect(ConfirmDialogService.display.calls.count()).toBe(2);
                                });
                            });

                            it('should PUT the experience back again after getting splash', function() {
                                var postedExperience = {
                                    id: 'e-1',
                                    data: {
                                        collateral: {},
                                        splash: {
                                            source: 'generated',
                                            ratio: '3-2'
                                        }
                                    }
                                };

                                $scope.$apply(function() {
                                    content.postExperience.deferred.resolve(postedExperience);
                                });

                                $scope.$apply(function() {
                                    CollateralService.generateCollage.deferred.resolve({'3-2': '/collateral/newfile'});
                                });

                                expect(content.putExperience).toHaveBeenCalled();
                            });
                        });

                        describe('if POST throws error', function() {
                            it('should popup another ConfirmDialog if error', function() {
                                $scope.$apply(function() {
                                    content.postExperience.deferred.reject('Error POSTing experience');
                                });

                                expect(ConfirmDialogService.display).toHaveBeenCalled();
                                expect(ConfirmDialogService.display.calls.count()).toBe(2);
                            });
                        });
                    });

                    describe('when canceled', function() {
                        it('should close the dialog', function() {
                            onCancel();
                            expect(ConfirmDialogService.close).toHaveBeenCalled();
                        });
                    });
                });
            });

            describe('properties', function() {
                describe('total', function() {
                    it('should be undefined by default', function() {
                        expect(MinireelsCtrl.total).toBe(undefined);
                    });

                    it('should be 1 if all results fit within the limit', function() {
                        MinireelsCtrl.limit = 5;
                        $scope.data.experiences = [{},{},{}];

                        expect(MinireelsCtrl.total).toBe(1);

                        $scope.data.experiences = [{},{},{},{},{},{},{}];

                        expect(MinireelsCtrl.total).toBe(2);

                        MinireelsCtrl.limit = 10;
                        expect(MinireelsCtrl.total).toBe(1);
                    });
                });

                describe('loading', function() {
                    it('should be true when Org is chosen', function() {
                        $scope.$apply(function() {
                            account.getOrgs.deferred.resolve(angular.copy(mockOrgs));
                        });

                        $scope.data.org = $scope.data.orgs[0];

                        $scope.$digest();

                        expect(MinireelsCtrl.loading).toBe(true);
                    });

                    it('should be false when data has loaded', function() {
                        $scope.$apply(function() {
                            account.getOrgs.deferred.resolve(angular.copy(mockOrgs));
                        });

                        $scope.data.org = $scope.data.orgs[0];

                        $scope.$apply(function() {
                            content.getExperiencesByOrg.deferred.resolve(angular.copy(mockExperiences));
                            account.getUser.deferred.resolve(angular.copy(mockUser));
                        });

                        expect(MinireelsCtrl.loading).toBe(false);
                    });
                });

                describe('brandingSource', function() {
                    it('should be none by default', function() {
                        expect(MinireelsCtrl.brandingSource).toBe('none');
                    });

                    it('should save branding from different models depending on setting', function() {
                        var onAffirm, onCancel;

                        $scope.$apply(function() {
                            // resolve initial Orgs load
                            account.getOrgs.deferred.resolve(angular.copy(mockOrgs));
                        });
                        // select an Org to see experiences
                        $scope.data.org = $scope.data.orgs[0];
                        $scope.$apply(function() {
                            // resolve with Org's experiences
                            content.getExperiencesByOrg.deferred.resolve(angular.copy(mockExperiences));
                            account.getUser.deferred.resolve(angular.copy(mockUsers[0]));
                        });
                        // select an experience to copy
                        MinireelsCtrl.startExperienceCopy($scope.data.experiences[0]);
                        // select a different Org to copy to
                        $scope.data.org = $scope.data.orgs[1];
                        $scope.$apply(function() {
                            // resolve with Org's users
                            account.getUsers.deferred.resolve(angular.copy(mockUsers));
                        });
                        $scope.data.user = $scope.data.users[0];
                        $scope.$digest();
                        MinireelsCtrl.confirmCopy();
                        onAffirm = ConfirmDialogService.display.calls.mostRecent().args[0].onAffirm;
                        onCancel = ConfirmDialogService.display.calls.mostRecent().args[0].onCancel;

                        onAffirm();
                        expect(content.postExperience.calls.mostRecent().args[0].data.branding).toBe(undefined);

                        MinireelsCtrl.brandingSource = 'custom';
                        $scope.data.experience._data.branding.custom = 'custom_branding';

                        onAffirm();
                        expect(content.postExperience.calls.mostRecent().args[0].data.branding).toBe('custom_branding');

                        MinireelsCtrl.brandingSource = 'publisher';
                        $scope.data.experience._data.branding.publisher = 'publisher_branding';

                        onAffirm();
                        expect(content.postExperience.calls.mostRecent().args[0].data.branding).toBe('publisher_branding');

                        MinireelsCtrl.brandingSource = 'current';
                        $scope.data.experience.data.branding = 'current_branding';

                        onAffirm();
                        expect(content.postExperience.calls.mostRecent().args[0].data.branding).toBe('current_branding');
                    });
                });
            });

            describe('$scope.doSort()', function() {
                it('should sort org and/or experience headers', function() {
                    $scope.doSort('status');
                    expect($scope.sort).toEqual({column:'status',descending:false});
                    $scope.doSort('status');
                    expect($scope.sort).toEqual({column:'status',descending:true});
                    $scope.doSort('data.mode');
                    expect($scope.sort).toEqual({column:'data.mode',descending:false});
                    $scope.doSort('title');
                    expect($scope.sort).toEqual({column:'title',descending:false});
                });
            });

            describe('$watcher', function() {
                describe('data.org', function() {
                    beforeEach(function() {
                        $scope.$apply(function() {
                            account.getOrgs.deferred.resolve(angular.copy(mockOrgs));
                        });

                        $scope.data.org = $scope.data.orgs[0];
                        $scope.$digest();
                    });

                    it('should load experiences if in "orgs" or "experiences" view', function() {
                        expect(content.getExperiencesByOrg).toHaveBeenCalledWith('o-1');

                        $scope.$apply(function() {
                            content.getExperiencesByOrg.deferred.resolve(angular.copy(mockExperiences));
                        });

                        expect(MinireelsCtrl.action).toBe('experiences');
                        expect($scope.data.query).toBe(null);
                        expect($scope.data.appData.experiences).toEqual(mockExperiences);
                        expect($scope.data.experiences).toEqual(mockExperiences);
                        expect(account.getUser).toHaveBeenCalledWith('u-1');
                        expect(account.getUser).toHaveBeenCalledWith('u-2');
                    });

                    it('should replace the experience.user with the returned user object if successful', function() {
                        $scope.$apply(function() {
                            content.getExperiencesByOrg.deferred.resolve(angular.copy(mockExperiences));
                            account.getUser.deferred.resolve(angular.copy(mockUser));
                        });

                        expect($scope.data.experiences[0].user).toEqual(mockUser);
                        expect($scope.data.experiences[1].user).toEqual(mockUser);
                    });

                    it('should add org data to experience for copying', function() {
                        MinireelsCtrl.startExperienceCopy(mockExperiences[0]);

                        $scope.$apply(function() {
                            $scope.data.org = mockOrgs[0];
                        });

                        expect(account.getUsers).toHaveBeenCalled();
                        expect($scope.data.experience._data).toEqual({
                            org: mockOrgs[0].id,
                            branding: {
                                publisher: undefined,
                                custom: null
                            },
                            config: {
                                minireelinator: {
                                    minireelDefaults: {
                                        mode: 'light',
                                        autoplay: true,
                                        splash: {
                                            ratio: '3-2',
                                            theme: 'img-text-overlay'
                                        }
                                    }
                                }
                            }
                        });
                    });

                    it('should add users to the scope if call is successful', function() {
                        MinireelsCtrl.startExperienceCopy(mockExperiences[0]);

                        $scope.$apply(function() {
                            account.getUsers.deferred.resolve(angular.copy(mockUsers));
                            $scope.data.org = mockOrgs[0];
                        });

                        expect($scope.data.users).toEqual(mockUsers);
                    });

                    it('should set brandingSource to none', function() {
                        MinireelsCtrl.startExperienceCopy(mockExperiences[0]);

                        $scope.$apply(function() {
                            account.getUsers.deferred.resolve(angular.copy(mockUsers));
                            $scope.data.org = mockOrgs[0];
                        });

                        expect(MinireelsCtrl.brandingSource).toBe('none');
                    });

                    it('should go to first page of results', function() {
                        MinireelsCtrl.page = 2;

                        $scope.$apply(function() {
                            $scope.data.org = mockOrgs[0];
                        });

                        expect(MinireelsCtrl.page).toBe(1);
                    });
                });

                describe('data.user', function() {
                    it('should add the user data to the experience for copying', function() {
                        MinireelsCtrl.startExperienceCopy(mockExperiences[0]);

                        $scope.$apply(function() {
                            $scope.data.org = mockOrgs[0];
                            $scope.data.user = mockUsers[0];
                        });

                        expect($scope.data.experience._data.user).toEqual(mockUsers[0]);
                    });
                });

                describe('page + limit', function() {
                    it('should set page to 1 if limit changes', function() {
                        MinireelsCtrl.limit = 50;
                        MinireelsCtrl.page = 2;

                        $scope.$digest();
                        expect(MinireelsCtrl.page).toBe(2);

                        MinireelsCtrl.limit = 10;
                        $scope.$digest();

                        expect(MinireelsCtrl.page).toBe(1);
                    });
                });
            });
        });
    });
}());