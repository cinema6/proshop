(function() {
    'user strict';

    define(['orgs','account'], function(orgs, account) {
        describe('OrgsController', function() {
            var $rootScope,
                $scope,
                $log,
                $q,
                OrgsCtrl,
                account,
                appData,
                mockOrgs,
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
                        waterfalls: {
                            video: ['cinema6'],
                            display: ['cinema6']
                        }
                    },
                    {
                        id: 'o-2',
                        name: 'Org2',
                        status: 'active',
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
                        org: 'o-1'
                    },
                    {
                        id: 'u-2',
                        email: 'mail@e.net',
                        firstName: 'B',
                        lastName: 'D',
                        org: 'o-2'
                    }
                ];

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
                        account: account
                    });
                });
            });

            describe('initialization', function() {
                it('should exist', function() {
                    expect(OrgsCtrl).toBeDefined();
                });

                it('should set some defaults', function() {
                    expect(OrgsCtrl.action).toBe('all');
                    expect(OrgsCtrl.showWaterfallSettings).toBe(true);
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

            describe('methods', function() {
                describe('editOrg()', function() {
                    it('should reset message, change the action, put the org on the scope, and get users by org', function() {
                        $scope.$apply(function() {
                            account.getOrgs.deferred.resolve(angular.copy(mockOrgs));
                            $scope.message = 'This is a test message';
                        });

                        OrgsCtrl.editOrg($scope.data.orgs[1]);

                        expect($scope.message).toBe(null);
                        expect(OrgsCtrl.action).toBe('edit');
                        expect($scope.data.org).toEqual($scope.data.orgs[1]);
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

                            expect(account.putOrg).toHaveBeenCalledWith({
                                id: $scope.data.orgs[0].id,
                                name: $scope.data.orgs[0].name,
                                status: $scope.data.orgs[0].status,
                                waterfalls: $scope.data.orgs[0].waterfalls,
                                adConfig: {
                                    video: {
                                        firstPlacement: 2,
                                        frequency: 0,
                                        waterfall: 'cinema6',
                                        skip: 6
                                    },
                                    display: {
                                        waterfall: 'cinema6'
                                    }
                                }
                            });
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

                            expect($scope.message).toBe('There was a problem saving the org.');
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

                            expect(account.postOrg).toHaveBeenCalledWith({
                                name: $scope.data.org.name,
                                status: 'active',
                                waterfalls: {
                                    video: ['cinema6'],
                                    display: ['cinema6']
                                },
                                adConfig: {
                                    video: {
                                        firstPlacement: 2,
                                        frequency: 0,
                                        waterfall: 'cinema6',
                                        skip: 6
                                    },
                                    display: {
                                        waterfall: 'cinema6'
                                    }
                                }
                            });
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

                            expect($scope.message).toBe('There was a problem saving the org.');
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

                        OrgsCtrl.deleteOrg();

                        expect($scope.message).toBe('You must delete or move the Users belonging to this Org before deleting it.');
                        expect(account.deleteOrg).not.toHaveBeenCalled();
                    });

                    it('should DELETE the org', function() {
                        OrgsCtrl.deleteOrg();

                        expect(account.deleteOrg).toHaveBeenCalledWith($scope.data.orgs[0]);
                    });

                    it('on success should put a message on the scope, set the action, reload all the orgs data', function() {
                        OrgsCtrl.deleteOrg();

                        expect(account.getOrgs.calls.count()).toBe(1);

                        $scope.$apply(function() {
                            account.deleteOrg.deferred.resolve($scope.data.org);
                        });

                        expect($scope.message).toBe('Successfully deleted org: ' + $scope.data.org.name);
                        expect(account.getOrgs.calls.count()).toBe(2);
                        expect(OrgsCtrl.action).toBe('all');
                    });

                    it('on error should stay on the edit page and display an error message', function() {
                        OrgsCtrl.deleteOrg();

                        $scope.$apply(function() {
                            account.deleteOrg.deferred.reject();
                        });

                        expect($scope.message).toBe('There was a problem deleting this org.');
                    });
                });
            });
        });
    });
}());