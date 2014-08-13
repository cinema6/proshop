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
                        user: 'u-1'
                    },
                    {
                        id: 'e-2',
                        title: 'Awesome Minireel',
                        user: 'u-2'
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

                    account = $injector.get('account');
                    content = $injector.get('content');

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
                    spyOn(content, 'convertExperienceForCopy');

                    content.getExperiencesByOrg.deferred = $q.defer();
                    content.getExperiencesByOrg.and.returnValue(content.getExperiencesByOrg.deferred.promise);

                    content.convertExperienceForCopy.deferred = $q.defer();
                    content.convertExperienceForCopy.and.returnValue(content.convertExperienceForCopy.deferred.promise);

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
                        MinireelsCtrl.getExperiences(mockOrgs[0]);

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

                describe('getExperiences()', function() {
                    it('should call the content service', function() {
                        MinireelsCtrl.getExperiences(mockOrgs[0]);

                        expect(content.getExperiencesByOrg).toHaveBeenCalledWith(mockOrgs[0].id);
                    });

                    it('should make data available on the scope if experience call is successful', function() {
                        MinireelsCtrl.getExperiences(mockOrgs[0]);

                        $scope.$apply(function() {
                            content.getExperiencesByOrg.deferred.resolve(angular.copy(mockExperiences));
                        });

                        expect(MinireelsCtrl.action).toBe('experiences');
                        expect($scope.data.query).toBe(null);
                        expect($scope.data.appData.experiences).toEqual(mockExperiences);
                        expect($scope.data.experiences).toEqual(mockExperiences);
                        expect(account.getUser).toHaveBeenCalledWith(mockExperiences[0].user);
                        expect(account.getUser).toHaveBeenCalledWith(mockExperiences[1].user);
                    });

                    it('should replace the experience.user with the returned user object if successful', function() {
                        MinireelsCtrl.getExperiences(mockOrgs[0]);

                        $scope.$apply(function() {
                            content.getExperiencesByOrg.deferred.resolve(angular.copy(mockExperiences));
                            account.getUser.deferred.resolve(angular.copy(mockUser));
                        });

                        expect($scope.data.experiences[0].user).toEqual(mockUser);
                        expect($scope.data.experiences[1].user).toEqual(mockUser);
                    });
                });

                describe('startExperienceCopy()', function() {
                    it('should set the action to "copy", null out any org data on the scope, and convert the experience for copying', function() {
                        MinireelsCtrl.startExperienceCopy(mockExperiences[0]);

                        expect(MinireelsCtrl.action).toBe('copy');
                        expect($scope.data.org).toBe(null);
                        expect(content.convertExperienceForCopy).toHaveBeenCalledWith(mockExperiences[0]);
                    });
                });

                describe('saveCopy()', function() {
                    it('should convert the experience and save it', function() {

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
                    it('should add org data to experience for copying', function() {
                        MinireelsCtrl.startExperienceCopy(mockExperiences[0]);

                        $scope.$apply(function() {
                            content.convertExperienceForCopy.deferred.resolve(angular.copy(mockExperiences[0]));
                            $scope.data.org = mockOrgs[0];
                        });

                        expect(account.getUsers).toHaveBeenCalled();
                        expect($scope.data.experience._data).toEqual({
                            org: mockOrgs[0].id,
                            branding: undefined,
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
                            content.convertExperienceForCopy.deferred.resolve(angular.copy(mockExperiences[0]));
                            account.getUsers.deferred.resolve(angular.copy(mockUsers));
                            $scope.data.org = mockOrgs[0];
                        });

                        expect($scope.data.users).toEqual(mockUsers);
                    });
                });

                describe('data.user', function() {
                    it('should add the user data to the experience for copying', function() {
                        MinireelsCtrl.startExperienceCopy(mockExperiences[0]);

                        $scope.$apply(function() {
                            content.convertExperienceForCopy.deferred.resolve(angular.copy(mockExperiences[0]));
                            $scope.data.org = mockOrgs[0];
                            $scope.data.user = mockUsers[0];
                        });

                        expect($scope.data.experience._data.user).toEqual(mockUsers[0]);
                    });
                });

                describe('self.action', function() {
                    it('should reset the org whenever action is "orgs"', function() {
                        MinireelsCtrl.action = 'orgs';
                        $scope.data.org = mockOrgs[0];
                        $scope.$digest();

                        MinireelsCtrl.action = 'experiences';
                        $scope.$digest();

                        MinireelsCtrl.action = 'orgs';
                        $scope.$digest();

                        expect($scope.data.org).toBe(null);
                    });
                });
            });
        });
    });
}());