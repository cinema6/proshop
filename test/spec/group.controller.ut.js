(function() {
    'use strict';

    define(['app'], function(proshop) {
        describe('GroupController', function() {
            var $rootScope,
                $scope,
                $controller,
                $q,
                $log,
                $routeParams,
                $location,
                GroupCtrl,
                GroupsService,
                CategoriesService,
                ConfirmDialogService,
                content,
                account,
                mockGroup,
                mockCategories,
                mockMiniReels,
                mockUsers,
                mockOrgs;

            var copy = angular.copy;

            function compileCtrl(id) {
                $routeParams = { id: id };

                $scope = $rootScope.$new();

                GroupCtrl = $controller('GroupController', {
                    $log: $log,
                    $scope: $scope,
                    $routeParams: $routeParams,
                    GroupsService: GroupsService,
                    CategoriesService: CategoriesService,
                    content: content,
                    account: account,
                    ConfirmDialogService: ConfirmDialogService
                });
            }

            beforeEach(function() {
                module(proshop.name);

                ConfirmDialogService = {
                    display: jasmine.createSpy('ConfirmDialogService.display()'),
                    close: jasmine.createSpy('ConfirmDialogService.close()')
                };

                GroupsService = {
                    getGroup: jasmine.createSpy('GroupsService.getGroup'),
                    putGroup: jasmine.createSpy('GroupsService.putGroup'),
                    postGroup: jasmine.createSpy('GroupsService.postGroup'),
                    deleteGroup: jasmine.createSpy('GroupsService.deleteGroup')
                };

                CategoriesService = {
                    getCategories: jasmine.createSpy('CategoriesService.getCategories')
                };

                content = {
                    getExperiences: jasmine.createSpy('content.getExperiences')
                };

                account = {
                    getOrgs: jasmine.createSpy('account.getOrgs'),
                    getUsers: jasmine.createSpy('account.getUsers')
                };

                /* jsHint quotmark:false */
                mockGroup = {
                    "id": "g-111",
                    "name": "Group Number 1",
                    "categories": [
                        "sports",
                        "people_blogs"
                    ],
                    "miniReels": [
                        "e-111",
                        "e-112"
                    ],
                    "created": "2014-06-13T19:28:39.408Z",
                    "lastUpdated": "2014-06-13T19:28:39.408Z"
                };

                mockCategories = [
                    {
                        "id": "c-111",
                        "name": "sports",
                        "label": "Sports",
                        "created": "2014-06-13T19:28:39.408Z",
                        "lastUpdated": "2014-06-13T19:28:39.408Z",
                        "status": "active"
                    },
                    {
                        "id": "c-112",
                        "name": "technology",
                        "label": "Technology",
                        "created": "2014-06-13T19:28:39.408Z",
                        "lastUpdated": "2014-06-13T19:28:39.408Z",
                        "status": "active"
                    },
                    {
                        "id": "c-113",
                        "name": "people_blogs",
                        "label": "People & Blogs",
                        "created": "2014-06-13T19:28:39.408Z",
                        "lastUpdated": "2014-06-13T19:28:39.408Z",
                        "status": "active"
                    }
                ];

                mockMiniReels = [
                    {
                        "id": "e-111",
                        "title": "The 7 Most Legendary Pro Wrestling Intros Of All Time",
                        "user": "u-111",
                        "org": "o-111",
                        "status": "pending",
                        "access": "public",
                        "created": "2014-02-08T10:42:51+00:00",
                        "lastUpdated": "2014-08-21T17:44:48.063Z",
                        "type": "minireel",
                        "sort": "lastUpdated,-1",
                        "categories": ["people_blogs","technology"],
                        "data": {
                            "title": "The 7 Most Legendary Pro Wrestling Intros Of All Time",
                            "mode": "full",
                            "branding": "elitedaily",
                            "collateral": {},
                            "splash": {},
                            "adConfig": {},
                            "deck": []
                        }
                    },
                    {
                        "id": "e-112",
                        "title": "The 15 Most Amazing GoPro Videos Ever Recorded",
                        "user": "u-112",
                        "org": "o-112",
                        "status": "active",
                        "access": "public",
                        "created": "2014-02-08T10:42:51+00:00",
                        "lastUpdated": "2014-08-27T19:10:00.063Z",
                        "type": "minireel",
                        "sort": "lastUpdated,-1",
                        "categories": ["music","technology"],
                        "data": {
                            "title": "The 15 Most Amazing GoPro Videos Ever Recorded",
                            "mode": "light",
                            "branding": "elitedaily",
                            "splash": {},
                            "deck": [],
                        }
                    },
                    {
                        "id": "e-113",
                        "title": "Rumble Video Mock 3",
                        "user": "u-111",
                        "org": "o-111",
                        "status": "pending",
                        "access": "public",
                        "created": "2014-02-08T10:42:51+00:00",
                        "lastUpdated": "2014-04-18T14:07:20+00:00",
                        "type": "minireel",
                        "sort": "lastUpdated,-1",
                        "categories": ["music"],
                        "data": {
                            "title": "Rumble Video Mock 3",
                            "mode": "light",
                            "branding": "elitedaily",
                            "collateral": {},
                            "splash": {},
                            "deck": []
                        }
                    },
                    {
                        "id": "e-114",
                        "title": "Rumble Video",
                        "user": "u-112",
                        "org": "o-112",
                        "status": "pending",
                        "access": "public",
                        "created": "2014-02-08T10:42:51+00:00",
                        "lastUpdated": "2014-12-15T16:56:59.229Z",
                        "type": "minireel",
                        "sort": "lastUpdated,-1",
                        "categories": ["music", "technology"],
                        "data": {
                            "title": "Rumble Video",
                            "mode": "light",
                            "branding": "elitedaily",
                            "sponsored": false,
                            "collateral": {},
                            "splash": {},
                            "deck": []
                        }
                    }
                ];

                mockOrgs = [
                    {
                        "id": "o-111",
                        "name": "Organization 1",
                        "minAdCount": 0,
                        "created": "2014-06-13T19:28:39.408Z",
                        "lastUpdated": "2014-06-13T19:28:39.408Z",
                        "status": "active",
                        "tag": "foo",
                        "config": {},
                        "waterfalls": {}
                    },
                    {
                        "id": "o-112",
                        "name": "Test Org 2",
                        "minAdCount": 1,
                        "created": "2014-06-13T19:28:39.408Z",
                        "lastUpdated": "2014-06-13T19:28:39.408Z",
                        "status": "active",
                        "config":{},
                        "adConfig": {},
                        "waterfalls": {}
                    },
                    {
                        "id": "o-113",
                        "name": "Example Org 3",
                        "created": "2014-06-13T19:28:39.408Z",
                        "lastUpdated": "2014-09-03T20:32:02.211Z",
                        "status": "active",
                        "config": {},
                        "waterfalls": {},
                        "adConfig": {}
                    }
                ];

                mockUsers = [
                    {
                        "id": "u-111",
                        "email": "saxguy@cinema6.com",
                        "status": "active",
                        "org": "o-115",
                        "config": {},
                        "applications": [],
                        "permissions": {},
                        "lastName": "sdfsdf",
                        "firstName": "sfdsf",
                        "branding": "khaki",
                        "type": "Publisher",
                        "lastUpdated": "2014-09-03T20:27:41.370Z"
                    },
                    {
                        "id": "u-112",
                        "email": "test1@example.com",
                        "firstName": "Johnny",
                        "lastName": "Testmonkey",
                        "branding": "elitedaily",
                        "created": "2014-06-13T19:28:39.408Z",
                        "lastUpdated": "2015-01-20T19:30:41.961Z",
                        "applications": [],
                        "org": "o-111",
                        "status": "active",
                        "config": {},
                        "permissions": {},
                        "type": "Publisher"
                    },
                    {
                        "id": "u-113",
                        "email": "email2@sample.com",
                        "firstName": "Emailio",
                        "lastName": "Addresstevez",
                        "branding": "specialtheme",
                        "created": "2014-06-13T19:28:39.408Z",
                        "lastUpdated": "2014-06-13T19:28:39.408Z",
                        "applications": ["e-51ae37625cb57f"],
                        "org": "o-112",
                        "status": "active",
                        "config": {},
                        "permissions": {}
                    }
                ];
                /* jshint quotmark:single */

                inject(function($injector) {
                    $rootScope = $injector.get('$rootScope');
                    $controller = $injector.get('$controller');
                    $location = $injector.get('$location');
                    $log = $injector.get('$log');
                    $q = $injector.get('$q');

                    spyOn($location, 'path');
                    $log.context = function(){ return $log; }

                    GroupsService.getGroup.deferred = $q.defer();
                    GroupsService.getGroup.and.returnValue(GroupsService.getGroup.deferred.promise);

                    GroupsService.putGroup.deferred = $q.defer();
                    GroupsService.putGroup.and.returnValue(GroupsService.putGroup.deferred.promise);

                    GroupsService.postGroup.deferred = $q.defer();
                    GroupsService.postGroup.and.returnValue(GroupsService.postGroup.deferred.promise);

                    GroupsService.deleteGroup.deferred = $q.defer();
                    GroupsService.deleteGroup.and.returnValue(GroupsService.deleteGroup.deferred.promise);

                    CategoriesService.getCategories.deferred = $q.defer();
                    CategoriesService.getCategories.and.returnValue(CategoriesService.getCategories.deferred.promise);

                    content.getExperiences.deferred = $q.defer();
                    content.getExperiences.and.returnValue(content.getExperiences.deferred.promise);

                    account.getOrgs.deferred = $q.defer();
                    account.getOrgs.and.returnValue(account.getOrgs.deferred.promise);

                    account.getUsers.deferred = $q.defer();
                    account.getUsers.and.returnValue(account.getUsers.deferred.promise);
                });
            });

            describe('initialization', function() {
                describe('when path has /:id', function() {
                    beforeEach(function() {
                        compileCtrl('g-111');
                    });

                    it('should exist', function() {
                        expect(GroupCtrl).toBeDefined();
                    });

                    it('should load the group and all categories', function() {
                        expect(GroupsService.getGroup).toHaveBeenCalled();
                        expect(CategoriesService.getCategories).toHaveBeenCalled();
                    });

                    describe('when categories and group promises resolve', function() {
                        beforeEach(function() {
                            $scope.$apply(function() {
                                CategoriesService.getCategories.deferred.resolve(mockCategories);
                                GroupsService.getGroup.deferred.resolve(copy(mockGroup));
                            });
                        });

                        describe('if group has categories', function() {
                            it('should convert to full category objects', function() {
                                expect(GroupCtrl.group.categories).toEqual([mockCategories[0], mockCategories[2]]);
                                expect(GroupCtrl.categories).toEqual(mockCategories);
                            });
                        });

                        describe('if group has miniReels', function() {
                            it('should call for all experiences by ids', function() {
                                expect(content.getExperiences).toHaveBeenCalledWith({ids: 'e-111,e-112'});
                            });

                            describe('when content promise resolves', function() {
                                it('should call for the experiences\' Org and User to decorate the experience', function() {
                                    $scope.$apply(function() {
                                        content.getExperiences.deferred.resolve(mockMiniReels);
                                    });

                                    expect(account.getOrgs).toHaveBeenCalledWith({ids: 'o-111,o-112'});
                                    expect(account.getUsers).toHaveBeenCalledWith({ids: 'u-111,u-112'});
                                });

                                describe('when the account promises resolve', function() {
                                    it('should attach the correct Org and User objects to each MiniReel', function() {
                                        $scope.$apply(function() {
                                            content.getExperiences.deferred.resolve(mockMiniReels);
                                            account.getOrgs.deferred.resolve(mockOrgs);
                                            account.getUsers.deferred.resolve(mockUsers);
                                        });

                                        expect(GroupCtrl.group.miniReels[0].org).toEqual(mockOrgs[0]);
                                        expect(GroupCtrl.group.miniReels[0].user).toEqual(mockUsers[0]);
                                        expect(GroupCtrl.group.miniReels[1].org).toEqual(mockOrgs[1]);
                                        expect(GroupCtrl.group.miniReels[1].user).toEqual(mockUsers[1]);
                                    });
                                });
                            });
                        });
                    });
                });

                describe('when path is /new', function() {
                    beforeEach(function() {
                        compileCtrl();
                    });

                    it('should exist', function() {
                        expect(GroupCtrl).toBeDefined();
                    });

                    it('should not load a group but should load all categories', function() {
                        expect(CategoriesService.getCategories).toHaveBeenCalled();
                        expect(GroupsService.getGroup).not.toHaveBeenCalled();
                    });

                    describe('when the categories promise resolves', function() {
                        beforeEach(function() {
                            $scope.$apply(function() {
                                CategoriesService.getCategories.deferred.resolve(mockCategories);
                            });
                        });

                        it('should initialize data objects on the controller', function() {
                            expect(GroupCtrl.categories).toEqual(mockCategories);
                            expect(GroupCtrl.group).toEqual({
                                name: '',
                                categories: [],
                                miniReels: []
                            });
                        });

                        it('should not call the content service', function() {
                            expect(content.getExperiences).not.toHaveBeenCalled();
                        });
                    });
                });
            });

            describe('methods', function() {
                describe('filterData(query)', function() {
                    beforeEach(function() {
                        compileCtrl('g-111');

                        $scope.$apply(function() {
                            mockGroup.miniReels = [];
                            CategoriesService.getCategories.deferred.resolve(mockCategories);
                            GroupsService.getGroup.deferred.resolve(copy(mockGroup));
                        });

                        $scope.$apply(function() {
                            account.getOrgs.deferred.resolve(mockOrgs);
                            account.getUsers.deferred.resolve(mockUsers);
                        });

                        $scope.$apply(function() {
                            GroupCtrl.loadMiniReels();
                        });

                        $scope.$apply(function() {
                            content.getExperiences.deferred.resolve(mockMiniReels);
                        });
                    });

                    it('should match case-insensitively against title, user email and name', function() {
                        expect(GroupCtrl.miniReels.length).toBe(4);

                        GroupCtrl.filterData('wrestling'); // miniReel 1's name only
                        expect(GroupCtrl.miniReels.length).toBe(1);
                        expect(GroupCtrl.miniReels[0].id).toBe('e-111');

                        GroupCtrl.filterData('mock'); // miniReel 3's name only
                        expect(GroupCtrl.miniReels.length).toBe(1);
                        expect(GroupCtrl.miniReels[0].id).toBe('e-113');

                        GroupCtrl.filterData('rumble'); // miniReel 1 and 3 name only
                        expect(GroupCtrl.miniReels.length).toBe(2);

                        GroupCtrl.filterData('testmonkey'); // miniReel 2 and 4 user lastname only
                        expect(GroupCtrl.miniReels.length).toBe(2);

                        GroupCtrl.filterData('saxguy'); // miniReel 3's email only
                        expect(GroupCtrl.miniReels.length).toBe(2);
                        expect(GroupCtrl.miniReels[0].id).toBe('e-111');
                        expect(GroupCtrl.miniReels[1].id).toBe('e-113');

                        GroupCtrl.filterData('xxx');
                        expect(GroupCtrl.miniReels.length).toBe(0);

                        GroupCtrl.filterData('');
                        expect(GroupCtrl.miniReels.length).toBe(4);
                    });
                });

                describe('addCategory(category)', function() {
                    it('should only add a category if not already assigned', function() {
                        compileCtrl('g-111');

                        $scope.$apply(function() {
                            CategoriesService.getCategories.deferred.resolve(mockCategories);
                            GroupsService.getGroup.deferred.resolve(copy(mockGroup));
                        });

                        expect(GroupCtrl.group.categories.length).toBe(2);

                        GroupCtrl.addCategory(mockCategories[0]);

                        expect(GroupCtrl.group.categories.length).toBe(2);

                        GroupCtrl.addCategory(mockCategories[1]);

                        expect(GroupCtrl.group.categories.length).toBe(3);
                    });
                });

                describe('removeCategory(category)', function() {
                    var onAffirm, onCancel;

                    beforeEach(function() {
                        compileCtrl('g-111');

                        $scope.$apply(function() {
                            mockGroup.miniReels = ['e-111','e-112','e-113','e-114'];
                            mockGroup.categories = ['technology','sports','people_blogs'];
                            CategoriesService.getCategories.deferred.resolve(mockCategories);
                            GroupsService.getGroup.deferred.resolve(copy(mockGroup));
                        });

                        $scope.$apply(function() {
                            content.getExperiences.deferred.resolve(mockMiniReels);
                        });

                        $scope.$apply(function() {
                            account.getOrgs.deferred.resolve(mockOrgs);
                            account.getUsers.deferred.resolve(mockUsers);
                        });

                        GroupCtrl.removeCategory(mockCategories[1]);

                        onAffirm = ConfirmDialogService.display.calls.mostRecent().args[0].onAffirm;
                        onCancel = ConfirmDialogService.display.calls.mostRecent().args[0].onCancel;
                    });

                    it('should display a dialog', function() {
                        expect(ConfirmDialogService.display).toHaveBeenCalled();
                    });

                    describe('onAffirm()', function() {
                        it('should remove the category and all miniReels that match the category but don\'t also match another category', function() {
                            expect(GroupCtrl.group.categories.length).toBe(3);
                            expect(GroupCtrl.group.miniReels.length).toBe(4);

                            onAffirm();

                            expect(ConfirmDialogService.close).toHaveBeenCalled();
                            expect(GroupCtrl.group.categories.length).toBe(2);
                            expect(GroupCtrl.group.categories[0].id).toBe('c-111');
                            expect(GroupCtrl.group.categories[1].id).toBe('c-113');
                            expect(GroupCtrl.group.miniReels.length).toBe(2);
                            expect(GroupCtrl.group.miniReels[0].id).toBe('e-111');
                            expect(GroupCtrl.group.miniReels[1].id).toBe('e-113');
                        });
                    });

                    describe('onCancel()', function() {
                        it('should remove the category but leave all the miniReels', function() {
                            expect(GroupCtrl.group.categories.length).toBe(3);
                            expect(GroupCtrl.group.miniReels.length).toBe(4);

                            onCancel();

                            expect(ConfirmDialogService.close).toHaveBeenCalled();
                            expect(GroupCtrl.group.categories.length).toBe(2);
                            expect(GroupCtrl.group.categories[0].id).toBe('c-111');
                            expect(GroupCtrl.group.categories[1].id).toBe('c-113');
                            expect(GroupCtrl.group.miniReels.length).toBe(4);
                        });
                    });
                });

                describe('removeMiniReel(miniReel)', function() {
                    it('should remove the specified minireel', function() {
                        compileCtrl('g-111');

                        $scope.$apply(function() {
                            CategoriesService.getCategories.deferred.resolve(mockCategories);
                            GroupsService.getGroup.deferred.resolve(copy(mockGroup));
                        });

                        $scope.$apply(function() {
                            content.getExperiences.deferred.resolve(mockMiniReels);
                        });

                        $scope.$apply(function() {
                            account.getOrgs.deferred.resolve(mockOrgs);
                            account.getUsers.deferred.resolve(mockUsers);
                        });

                        expect(GroupCtrl.group.miniReels.length).toBe(4);
                        expect(GroupCtrl.group.miniReels[0].id).toBe('e-111');

                        GroupCtrl.removeMiniReel(GroupCtrl.group.miniReels[0]);

                        expect(GroupCtrl.group.miniReels.length).toBe(3);
                        expect(GroupCtrl.group.miniReels[0].id).toBe('e-112');
                    });
                });

                describe('loadMiniReels()', function() {
                    beforeEach(function() {
                        compileCtrl('g-111');

                        $scope.$apply(function() {
                            mockGroup.miniReels = [];
                            CategoriesService.getCategories.deferred.resolve(mockCategories);
                            GroupsService.getGroup.deferred.resolve(copy(mockGroup));
                        });

                        $scope.$apply(function() {
                            account.getOrgs.deferred.resolve(mockOrgs);
                            account.getUsers.deferred.resolve(mockUsers);
                        });

                        GroupCtrl.loadMiniReels();
                    });

                    it('should call for miniReels by categories', function() {
                        expect(content.getExperiences).toHaveBeenCalledWith({categories: 'sports,people_blogs'});
                    });

                    describe('when the content promise resolves', function() {
                        it('should filter out minireels that already belong to the Group before calling for the experiences\' Org and User to decorate the experience', function() {
                            GroupCtrl.group.miniReels = [mockMiniReels[0]];

                            $scope.$apply(function() {
                                content.getExperiences.deferred.resolve([mockMiniReels[0], mockMiniReels[1]]);
                            });

                            expect(account.getOrgs).toHaveBeenCalledWith({ids: 'o-112'});
                            expect(account.getUsers).toHaveBeenCalledWith({ids: 'u-112'});
                        });

                        describe('when the account promises resolve', function() {
                            it('should attach the correct Org and User objects to each MiniReel', function() {
                                GroupCtrl.group.miniReels = [mockMiniReels[0]];

                                $scope.$apply(function() {
                                    content.getExperiences.deferred.resolve([mockMiniReels[0], mockMiniReels[1]]);
                                    account.getOrgs.deferred.resolve(mockOrgs);
                                    account.getUsers.deferred.resolve(mockUsers);
                                });

                                expect(GroupCtrl.miniReels.length).toBe(1);
                                expect(GroupCtrl.miniReels[0]).toEqual(mockMiniReels[1]);
                                expect(GroupCtrl.miniReels[0].org).toEqual(mockOrgs[1]);
                                expect(GroupCtrl.miniReels[0].user).toEqual(mockUsers[1]);
                            });
                        });
                    });
                });

                describe('saveMiniReels()', function() {
                    beforeEach(function() {
                        compileCtrl('g-111');

                        $scope.$apply(function() {
                            mockGroup.miniReels = [];
                            CategoriesService.getCategories.deferred.resolve(mockCategories);
                            GroupsService.getGroup.deferred.resolve(copy(mockGroup));
                        });

                        $scope.$apply(function() {
                            account.getOrgs.deferred.resolve(mockOrgs);
                            account.getUsers.deferred.resolve(mockUsers);
                        });

                        GroupCtrl.loadMiniReels();

                        $scope.$apply(function() {
                            content.getExperiences.deferred.resolve(mockMiniReels);
                        });
                    });

                    it('should add all chosen miniReels', function() {
                        GroupCtrl.miniReels[0].chosen = true;
                        GroupCtrl.miniReels[1].chosen = true;
                        GroupCtrl.miniReels[2].chosen = true;

                        expect(GroupCtrl.group.miniReels.length).toBe(0);

                        GroupCtrl.saveMiniReels();

                        expect(GroupCtrl.group.miniReels.length).toBe(3);
                    });
                });

                describe('save()', function() {
                    describe('when /new', function() {
                        beforeEach(function() {
                            compileCtrl();

                            $scope.$apply(function() {
                                CategoriesService.getCategories.deferred.resolve(mockCategories);
                            });

                            GroupCtrl.group.name = 'New Group';
                        });

                        it('should POST the Group', function() {
                            GroupCtrl.save(GroupCtrl.group);

                            expect(GroupsService.postGroup).toHaveBeenCalledWith({
                                name: 'New Group',
                                categories: [],
                                miniReels: []
                            });
                        });

                        it('should convert categories and MiniReels into saveable arrays', function() {
                            GroupCtrl.group.categories = mockCategories;
                            GroupCtrl.group.miniReels = mockMiniReels;

                            GroupCtrl.save(GroupCtrl.group);

                            expect(GroupsService.postGroup).toHaveBeenCalledWith({
                                name: 'New Group',
                                categories: ['sports','technology','people_blogs'],
                                miniReels: ['e-111','e-112','e-113','e-114']
                            });
                        });

                        describe('on success', function() {
                            it('should redirect to /groups', function() {
                                GroupCtrl.save(GroupCtrl.group);

                                $scope.$apply(function() {
                                    GroupsService.postGroup.deferred.resolve();
                                });

                                expect($location.path).toHaveBeenCalledWith('/groups');
                            });
                        });

                        describe('on error', function() {
                            it('should display an error dialog', function() {
                                GroupCtrl.save(GroupCtrl.group);

                                $scope.$apply(function() {
                                    GroupsService.postGroup.deferred.reject('Problem');
                                });

                                expect($location.path).not.toHaveBeenCalled();
                                expect(ConfirmDialogService.display).toHaveBeenCalled();
                                expect(ConfirmDialogService.display.calls.mostRecent().args[0].prompt).toBe('There was a problem saving the Group. Problem.');
                            });
                        });
                    });

                    describe('when /:id', function() {
                        beforeEach(function() {
                            compileCtrl('g-111');

                            $scope.$apply(function() {
                                GroupsService.getGroup.deferred.resolve(copy(mockGroup));
                                CategoriesService.getCategories.deferred.resolve(mockCategories);
                            });

                            $scope.$apply(function() {
                                content.getExperiences.deferred.resolve([mockMiniReels[0], mockMiniReels[1]]);
                            });

                            $scope.$apply(function() {
                                account.getOrgs.deferred.resolve(mockOrgs);
                                account.getUsers.deferred.resolve(mockUsers);
                            });
                        });

                        it('should PUT the Group', function() {
                            GroupCtrl.save(GroupCtrl.group);

                            expect(GroupsService.putGroup).toHaveBeenCalledWith('g-111', {
                                name: 'Group Number 1',
                                categories: ['sports','people_blogs'],
                                miniReels: ['e-111','e-112']
                            });
                        });

                        it('should convert categories and MiniReels into saveable arrays', function() {
                            GroupCtrl.group.categories = mockCategories;
                            GroupCtrl.group.miniReels = mockMiniReels;

                            GroupCtrl.save(GroupCtrl.group);

                            expect(GroupsService.putGroup).toHaveBeenCalledWith('g-111', {
                                name: 'Group Number 1',
                                categories: ['sports','technology','people_blogs'],
                                miniReels: ['e-111','e-112','e-113','e-114']
                            });
                        });

                        describe('on success', function() {
                            it('should redirect to /groups', function() {
                                GroupCtrl.save(GroupCtrl.group);

                                $scope.$apply(function() {
                                    GroupsService.putGroup.deferred.resolve();
                                });

                                expect($location.path).toHaveBeenCalledWith('/groups');
                            });
                        });

                        describe('on error', function() {
                            it('should display an error dialog', function() {
                                GroupCtrl.save(GroupCtrl.group);

                                $scope.$apply(function() {
                                    GroupsService.putGroup.deferred.reject('Problem');
                                });

                                expect($location.path).not.toHaveBeenCalled();
                                expect(ConfirmDialogService.display).toHaveBeenCalled();
                                expect(ConfirmDialogService.display.calls.mostRecent().args[0].prompt).toBe('There was a problem saving the Group. Problem.');
                            });
                        });
                    });
                });

                describe('delete()', function() {
                    var onAffirm, onCancel;

                    beforeEach(function() {
                        compileCtrl('g-111');

                        $scope.$apply(function() {
                            mockGroup.miniReels = [];
                            GroupsService.getGroup.deferred.resolve(copy(mockGroup));
                            CategoriesService.getCategories.deferred.resolve(mockCategories);
                        });

                        GroupCtrl.delete();

                        onAffirm = ConfirmDialogService.display.calls.mostRecent().args[0].onAffirm;
                        onCancel = ConfirmDialogService.display.calls.mostRecent().args[0].onCancel;
                    });

                    it('should display a dialog confirming deletion', function() {
                        expect(ConfirmDialogService.display).toHaveBeenCalled();
                    });

                    describe('onCancel()', function() {
                        it('should close the dialog and stay on the page', function() {
                            onCancel();

                            expect(ConfirmDialogService.close).toHaveBeenCalled();
                            expect($location.path).not.toHaveBeenCalled();
                        });
                    });

                    describe('onAffirm()', function() {
                        beforeEach(function() {
                            onAffirm();
                        });

                        it('should call deleteGroup() and close the dialog', function() {
                            expect(GroupsService.deleteGroup).toHaveBeenCalledWith(GroupCtrl.group.id);
                            expect(ConfirmDialogService.close).toHaveBeenCalled();
                        });

                        describe('on success', function() {
                            it('should redirect to /groups', function() {
                                $scope.$apply(function() {
                                    GroupsService.deleteGroup.deferred.resolve();
                                });

                                expect($location.path).toHaveBeenCalledWith('/groups');
                            });
                        });

                        describe('on error', function() {
                            it('should display an error dialog', function() {
                                $scope.$apply(function() {
                                    GroupsService.deleteGroup.deferred.reject('Sorry');
                                });

                                expect($location.path).not.toHaveBeenCalled();
                                expect(ConfirmDialogService.display.calls.mostRecent().args[0].prompt).toBe('There was a problem deleting the Group. Sorry.');
                            });
                        });
                    });
                });
            });

            describe('$scope.doSort()', function() {
                it('should sort', function() {
                    $scope.doSort('categories');
                    expect($scope.sort).toEqual({column:'categories',descending:false});
                    $scope.doSort('categories');
                    expect($scope.sort).toEqual({column:'categories',descending:true});
                    $scope.doSort('data.title');
                    expect($scope.sort).toEqual({column:'data.title',descending:false});
                    $scope.doSort('mode');
                    expect($scope.sort).toEqual({column:'mode',descending:false});
                });
            });

            describe('$watch()', function() {
                describe('allAreSelected', function() {
                    it('should mark all miniReels as "chosen" if true', function() {
                        GroupCtrl.miniReels = mockMiniReels;

                        GroupCtrl.miniReels.forEach(function(mr) {
                            expect(mr.chosen).toBe(undefined);
                        });

                        $scope.$apply(function() {
                            GroupCtrl.allAreSelected = true;
                        });

                        GroupCtrl.miniReels.forEach(function(mr) {
                            expect(mr.chosen).toBe(true);
                        });
                    });

                    it('should unmark all MiniReels as "chosen" if false', function() {
                        GroupCtrl.miniReels = mockMiniReels;

                        GroupCtrl.miniReels.forEach(function(mr) {
                            expect(mr.chosen).toBe(undefined);
                        });

                        $scope.$apply(function() {
                            GroupCtrl.allAreSelected = true;
                        });

                        $scope.$apply(function() {
                            GroupCtrl.allAreSelected = false;
                        });

                        GroupCtrl.miniReels.forEach(function(mr) {
                            expect(mr.chosen).toBe(false);
                        });
                    });
                });
            });
        });
    });
}());