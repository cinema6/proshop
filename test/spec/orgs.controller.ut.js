(function() {
    'user strict';

    define(['orgs'], function() {
        describe('OrgsController', function() {
            var $rootScope,
                $scope,
                $log,
                $q,
                OrgsCtrl,
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

                mockUsers = [
                    {
                        id: 'u-1',
                        email: 'e@mail.com',
                        firstName: 'J',
                        lastName: 'F',
                        org: 'o-1',
                        config: {}
                    },
                    {
                        id: 'u-2',
                        email: 'mail@e.net',
                        firstName: 'B',
                        lastName: 'D',
                        org: 'o-2',
                        config: {}
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

                    account = $injector.get('account');

                    spyOn(account, 'getOrgs');
                    spyOn(account, 'getUsers');
                    spyOn(account, 'putOrg');
                    spyOn(account, 'postOrg');
                    spyOn(account, 'deleteOrg');
                    spyOn(account, 'convertOrgForEditing').and.callThrough();

                    account.getOrgs.deferred = $q.defer();
                    account.getOrgs.and.returnValue(account.getOrgs.deferred.promise);

                    account.getUsers.deferred = $q.defer();
                    account.getUsers.and.returnValue(account.getUsers.deferred.promise);

                    account.putOrg.deferred = $q.defer();
                    account.putOrg.and.returnValue(account.putOrg.deferred.promise);

                    account.postOrg.deferred = $q.defer();
                    account.postOrg.and.returnValue(account.postOrg.deferred.promise);

                    account.deleteOrg.deferred = $q.defer();
                    account.deleteOrg.and.returnValue(account.deleteOrg.deferred.promise);


                    $log.context = function(){ return $log; }

                    $scope = $rootScope.$new();
                    $scope.data = {
                        appData: appData
                    };

                    OrgsCtrl = $controller('OrgsController', {
                        $log: $log,
                        $scope: $scope,
                        account: account,
                        ConfirmDialogService: ConfirmDialogService
                    });
                });
            });

            describe('initialization', function() {
                it('should exist', function() {
                    expect(OrgsCtrl).toBeDefined();
                });

                it('should set some defaults', function() {
                    expect(OrgsCtrl.action).toBe('all');
                });

                it('should call the account service to get all Orgs', function() {
                    expect(account.getOrgs).toHaveBeenCalled();
                });

                it('should put the orgs data on the scope and appData', function() {
                    $scope.$apply(function() {
                        account.getOrgs.deferred.resolve(angular.copy(mockOrgs));
                    });

                    expect($scope.data.orgs).toEqual(mockOrgs);
                    expect($scope.data.appData.orgs).toEqual(mockOrgs);
                });
            });

            describe('$scope.doSort()', function() {
                it('should sort', function() {
                    $scope.doSort('status');
                    expect($scope.sort).toEqual({column:'status',descending:false});
                    $scope.doSort('status');
                    expect($scope.sort).toEqual({column:'status',descending:true});
                    $scope.doSort('minAdCount');
                    expect($scope.sort).toEqual({column:'minAdCount',descending:false});
                    $scope.doSort('name');
                    expect($scope.sort).toEqual({column:'name',descending:false});
                });
            });

            describe('properties', function() {
                describe('total', function() {
                    it('should be undefined by default', function() {
                        expect(OrgsCtrl.total).toBe(undefined);
                    });

                    it('should be 1 if all results fit within the limit', function() {
                        OrgsCtrl.limit = 5;
                        $scope.data.orgs = [{},{},{}];

                        expect(OrgsCtrl.total).toBe(1);

                        $scope.data.orgs = [{},{},{},{},{},{},{}];

                        expect(OrgsCtrl.total).toBe(2);

                        OrgsCtrl.limit = 10;
                        expect(OrgsCtrl.total).toBe(1);
                    });
                });

                describe('loading', function() {
                    it('should be true on initialization', function() {
                        expect(OrgsCtrl.loading).toBe(true);
                    });

                    it('should be false after all data promises resolve', function() {
                        $scope.$apply(function() {
                            account.getOrgs.deferred.resolve(angular.copy(mockOrgs));
                        });

                        expect(OrgsCtrl.loading).toBe(false);
                    });
                });
            });

            describe('methods', function() {
                describe('formIsValid()', function() {
                    beforeEach(function() {
                        $scope.$apply(function() {
                            account.getOrgs.deferred.resolve(angular.copy(mockOrgs));
                        });

                        OrgsCtrl.editOrg($scope.data.orgs[0]);
                    });

                    it('should be true by default because the defualts should be set!', function() {
                        expect(OrgsCtrl.formIsValid()).toBe(true);
                    });

                    it('should be false if video or display waterfalls or embedTypes are not set', function() {
                        $scope.data.org._data.videoWaterfalls = [];
                        expect(OrgsCtrl.formIsValid()).toBe(false);

                        $scope.data.org._data.videoWaterfalls = [{enabled: true}];
                        expect(OrgsCtrl.formIsValid()).toBe(true);

                        $scope.data.org._data.displayWaterfalls = [];
                        expect(OrgsCtrl.formIsValid()).toBe(false);

                        $scope.data.org._data.displayWaterfalls = [{enabled: true}];
                        expect(OrgsCtrl.formIsValid()).toBe(true);

                        $scope.data.org._data.config.minireelinator.embedTypes = [];
                        expect(OrgsCtrl.formIsValid()).toBe(false);

                        $scope.data.org._data.config.minireelinator.embedTypes = [{enabled: true}];
                        expect(OrgsCtrl.formIsValid()).toBe(true);

                        $scope.data.org.config.minireelinator.embedDefaults.size = { width: '100px', height: '200px'};
                        expect(OrgsCtrl.formIsValid()).toBe(true);

                        $scope.data.org.config.minireelinator.embedDefaults.size = { width: '100px', height: ''};
                        expect(OrgsCtrl.formIsValid()).toBe(false);

                        $scope.data.org.config.minireelinator.embedDefaults.size = { width: '', height: ''};
                        expect(OrgsCtrl.formIsValid()).toBe(true);
                    });
                });

                describe('editOrg()', function() {
                    it('should reset message, change the action, put the org on the scope, and get users by org', function() {
                        $scope.$apply(function() {
                            account.getOrgs.deferred.resolve(angular.copy(mockOrgs));
                            $scope.message = 'This is a test message';
                        });

                        OrgsCtrl.editOrg($scope.data.orgs[1]);

                        expect($scope.message).toBe(null);
                        expect(OrgsCtrl.action).toBe('edit');
                        expect($scope.data.org).toEqual(jasmine.any(Object));
                        expect(account.getUsers).toHaveBeenCalledWith($scope.data.orgs[1]);

                        expect($scope.data.users).toBe(null);

                        $scope.$apply(function() {
                            account.getUsers.deferred.resolve(mockUsers[1]);
                        });

                        expect($scope.data.users).toBe(mockUsers[1]);
                    });
                });

                describe('addNewOrg()', function() {
                    it('should reset message, change action, reset org data', function() {
                        $scope.message = 'This is a test message';
                        $scope.data.org = { name: 'Test', status: 'pending' };

                        OrgsCtrl.addNewOrg();

                        expect($scope.message).toBe(null);
                        expect(OrgsCtrl.action).toBe('new');
                        expect($scope.data.org.name).toBe(null);
                        expect($scope.data.org.status).toBe('active');
                        expect(account.convertOrgForEditing).toHaveBeenCalled();
                    });
                });

                describe('filterData()', function() {
                    it('should filter orgs by name', function() {
                        $scope.$apply(function() {
                            account.getOrgs.deferred.resolve(angular.copy(mockOrgs));
                        });

                        expect($scope.data.orgs.length).toBe(2);

                        $scope.data.query = '1';
                        OrgsCtrl.filterData();
                        expect($scope.data.orgs.length).toBe(1);

                        $scope.data.query = 'o';
                        OrgsCtrl.filterData();
                        expect($scope.data.orgs.length).toBe(2);

                        $scope.data.query = 'x';
                        OrgsCtrl.filterData();
                        expect($scope.data.orgs.length).toBe(0);

                        $scope.data.query = 'ORG';
                        OrgsCtrl.filterData();
                        expect($scope.data.orgs.length).toBe(2);
                    });
                });

                describe('saveOrg()', function() {
                    describe('when updating an org', function() {
                        beforeEach(function() {
                            $scope.$apply(function() {
                                account.getOrgs.deferred.resolve(angular.copy(mockOrgs));
                            });

                            OrgsCtrl.editOrg($scope.data.orgs[0]);
                        });

                        it('should PUT the org', function() {
                            OrgsCtrl.saveOrg();

                            expect(account.putOrg).toHaveBeenCalledWith($scope.data.org);
                        });

                        it('on success should put a message on the scope, set the action, reload all the orgs data', function() {
                            OrgsCtrl.saveOrg();

                            expect(account.getOrgs.calls.count()).toBe(1);

                            $scope.$apply(function() {
                                account.putOrg.deferred.resolve($scope.data.org);
                            });

                            expect($scope.message).toBe('Successfully saved org: ' + $scope.data.org.name);
                            expect(account.getOrgs.calls.count()).toBe(2);
                            expect(OrgsCtrl.action).toBe('all');
                        });

                        it('on error should stay on the edit page and display an error message', function() {
                            OrgsCtrl.saveOrg();

                            $scope.$apply(function() {
                                account.putOrg.deferred.reject();
                            });

                            expect(ConfirmDialogService.display).toHaveBeenCalled();
                        });
                    });

                    describe('when creating an org', function() {
                        beforeEach(function() {
                            $scope.$apply(function() {
                                account.getOrgs.deferred.resolve(angular.copy(mockOrgs));
                            });

                            OrgsCtrl.addNewOrg();

                            $scope.data.org.name = 'New Org';
                        });

                        it('should reset the message and the org data', function() {
                            OrgsCtrl.saveOrg();

                            expect(account.postOrg).toHaveBeenCalledWith($scope.data.org);
                        });

                        it('on success should put a message on the scope, set the action, reload all the orgs data', function() {
                            OrgsCtrl.saveOrg();

                            expect(account.getOrgs.calls.count()).toBe(1);

                            $scope.$apply(function() {
                                account.postOrg.deferred.resolve($scope.data.org);
                            });

                            expect($scope.message).toBe('Successfully saved org: ' + $scope.data.org.name);
                            expect(account.getOrgs.calls.count()).toBe(2);
                            expect(OrgsCtrl.action).toBe('all');
                        });

                        it('on error should stay on the edit page and display an error message', function() {
                            OrgsCtrl.saveOrg();

                            $scope.$apply(function() {
                                account.postOrg.deferred.reject();
                            });

                            expect(ConfirmDialogService.display).toHaveBeenCalled();
                        });
                    });
                });

                describe('deleteOrg()', function() {
                    beforeEach(function() {
                        $scope.$apply(function() {
                            account.getOrgs.deferred.resolve(angular.copy(mockOrgs));
                        });

                        OrgsCtrl.editOrg($scope.data.orgs[0]);
                    });

                    it('should not DELETE the org if there are users belonging to it', function() {
                        $scope.$apply(function() {
                            account.getUsers.deferred.resolve(mockUsers[0]);
                        });

                        OrgsCtrl.confirmDelete();

                        ConfirmDialogService.display.calls.mostRecent().args[0].onAffirm();

                        expect(ConfirmDialogService.display.calls.mostRecent().args[0].prompt).toBe('You must delete or move the Users belonging to this Org before deleting it.');

                        expect(account.deleteOrg).not.toHaveBeenCalled();
                    });

                    it('should DELETE the org', function() {
                        OrgsCtrl.confirmDelete();

                        ConfirmDialogService.display.calls.mostRecent().args[0].onAffirm();

                        expect(account.deleteOrg).toHaveBeenCalled();
                    });

                    it('on success should put a message on the scope, set the action, reload all the orgs data', function() {
                        OrgsCtrl.confirmDelete();

                        ConfirmDialogService.display.calls.mostRecent().args[0].onAffirm();

                        expect(account.getOrgs.calls.count()).toBe(1);

                        $scope.$apply(function() {
                            account.deleteOrg.deferred.resolve($scope.data.org);
                        });

                        expect($scope.message).toBe('Successfully deleted org: ' + $scope.data.org.name);
                        expect(account.getOrgs.calls.count()).toBe(2);
                        expect(OrgsCtrl.action).toBe('all');
                    });

                    it('on error should stay on the edit page and display an error message', function() {
                        OrgsCtrl.confirmDelete();

                        ConfirmDialogService.display.calls.mostRecent().args[0].onAffirm();

                        $scope.$apply(function() {
                            account.deleteOrg.deferred.reject();
                        });

                        expect(OrgsCtrl.action).toBe('edit');
                        expect(ConfirmDialogService.display.calls.count()).toBe(2);
                    });
                });
            });

            describe('$watchers', function() {
                describe('page + limit', function() {
                    it('should set page to 1 if limit changes', function() {
                        OrgsCtrl.limit = 50;
                        OrgsCtrl.page = 2;

                        $scope.$digest();
                        expect(OrgsCtrl.page).toBe(2);

                        OrgsCtrl.limit = 10;
                        $scope.$digest();

                        expect(OrgsCtrl.page).toBe(1);
                    });
                });
            });
        });
    });
}());