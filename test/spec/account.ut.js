(function() {
    'use strict';

    define(['account'], function() {
        describe('accountService', function() {
            var $httpBackend,
                $timeout,
                account,
                successSpy,
                failureSpy,
                c6UrlMaker,
                mockOrg,
                mockOrgs,
                mockUser,
                mockUsers;

            beforeEach(function() {
                mockOrg = {
                    id: 'o-1',
                    name: 'Org1',
                    status: 'active',
                    config: {},
                    waterfalls: {
                        video: ['cinema6'],
                        display: ['cinema6']
                    }
                };

                mockOrgs = [
                    {
                        name:'Org1'
                    },
                    {
                        name:'Org2'
                    }
                ];

                mockUser = {
                    id: 'u-1',
                    email: 'foo@bar.com',
                    org: 'o-1',
                    firstName: 'Foo',
                    lastName: 'Bar',
                    branding: 'test_brand',
                    config: {},
                };

                mockUsers = [
                    {
                        id:'u-1'
                    },
                    {
                        name:'u-2'
                    }
                ];

                module('c6.ui', function($provide) {
                    $provide.provider('c6UrlMaker', function(){
                        this.location = jasmine.createSpy('urlMaker.location');
                        this.makeUrl = jasmine.createSpy('urlMaker.makeUrl');
                        this.$get = function(){
                            return jasmine.createSpy('urlMaker.get');
                        };
                    });
                });

                module('c6.proshop');

                inject(function($injector){
                    account = $injector.get('account');
                    $timeout = $injector.get('$timeout');
                    $httpBackend = $injector.get('$httpBackend');
                    c6UrlMaker = $injector.get('c6UrlMaker');
                });

                c6UrlMaker.and.callFake(function(path, base) {
                    return '/' + base + '/' + path;
                });
            });

            describe('methods', function() {
                describe('changeEmail()', function() {
                    beforeEach(function(){
                        successSpy = jasmine.createSpy('changeEmail.success');
                        failureSpy = jasmine.createSpy('changeEmail.failure');
                        spyOn($timeout, 'cancel');
                    });

                    it('will resolve promise if successfull',function(){
                        $httpBackend.expectPOST('/api/account/user/email')
                            .respond(200,'Successfully changed email');
                        account.changeEmail('userX','foobar','usery')
                            .then(successSpy,failureSpy);
                        $httpBackend.flush();
                        expect(successSpy).toHaveBeenCalledWith('Successfully changed email');
                        expect(failureSpy).not.toHaveBeenCalled();
                        expect($timeout.cancel).toHaveBeenCalled();
                    });

                    it('will reject promise if not successful',function(){
                        $httpBackend.expectPOST('/api/account/user/email')
                            .respond(400,'Unable to find user.');
                        account.changeEmail('userX','foobar','xx')
                            .then(successSpy,failureSpy);
                        $httpBackend.flush();
                        expect(successSpy).not.toHaveBeenCalled();
                        expect(failureSpy).toHaveBeenCalledWith('Unable to find user.');
                        expect($timeout.cancel).toHaveBeenCalled();
                    });

                    it('will reject promise if times out',function(){
                        $httpBackend.expectPOST('/api/account/user/email')
                            .respond(200,{});
                        account.changeEmail('userX','foobar','x')
                            .then(successSpy,failureSpy);
                        $timeout.flush(60000);
                        expect(successSpy).not.toHaveBeenCalled();
                        expect(failureSpy).toHaveBeenCalledWith('Request timed out.');
                    });
                });

                describe('changePassword()', function() {
                    beforeEach(function(){
                        successSpy = jasmine.createSpy('changePassword.success');
                        failureSpy = jasmine.createSpy('changePassword.failure');
                        spyOn($timeout,'cancel');
                    });

                    it('will resolve promise if successfull',function(){
                        $httpBackend.expectPOST('/api/account/user/password')
                            .respond(200,"Success");
                        account.changePassword('a','b','c')
                            .then(successSpy,failureSpy);
                        $httpBackend.flush();
                        expect(successSpy).toHaveBeenCalledWith("Success");
                        expect(failureSpy).not.toHaveBeenCalled();
                        expect($timeout.cancel).toHaveBeenCalled();
                    });

                    it('will reject promise if not successfull',function(){
                        $httpBackend.expectPOST('/api/account/user/password')
                            .respond(500,'There was an error.');
                        account.changePassword('a','b','c')
                            .then(successSpy,failureSpy);
                        $httpBackend.flush();
                        expect(successSpy).not.toHaveBeenCalled();
                        expect(failureSpy).toHaveBeenCalledWith('There was an error.');
                        expect($timeout.cancel).toHaveBeenCalled();
                    });

                    it('will reject promise if times out',function(){
                        $httpBackend.expectPOST('/api/account/user/password').respond(200,{});
                        account.changePassword('a','b','c')
                            .then(successSpy,failureSpy);
                        $timeout.flush(60000);
                        expect(successSpy).not.toHaveBeenCalled();
                        expect(failureSpy).toHaveBeenCalledWith('Request timed out.');
                    });
                });

                describe('convertOrgForEditing()', function() {
                    var newOrgDefaults;

                    beforeEach(function() {
                        newOrgDefaults = {
                            name: null,
                            status: 'active',
                            config: {
                                minireelinator: {
                                    embedTypes: ['script'],
                                    minireelDefaults: {
                                        mode: 'light',
                                        autoplay: true,
                                        splash: {
                                            ratio: '3-2',
                                            theme: 'img-text-overlay'
                                        }
                                    },
                                    embedDefaults: {
                                        size: null
                                    }
                                }
                            },
                            waterfalls: {
                                video: ['cinema6'],
                                display: ['cinema6']
                            },
                            adConfig: {
                                video: {
                                    firstPlacement: -1,
                                    frequency: 0,
                                    skip: 6,
                                    waterfall: 'cinema6'
                                },
                                display: {
                                    waterfall: 'cinema6'
                                }
                            },
                            _data: {
                                videoWaterfalls: [],
                                displayWaterfall: [],
                                adConfig: {}
                            }
                        };
                    });

                    it('should create a default org if no org is passed in', function() {
                        var org = account.convertOrgForEditing();
                        expect(org.name).toEqual(newOrgDefaults.name);
                        expect(org.status).toEqual(newOrgDefaults.status);
                        expect(org.waterfalls).toEqual(newOrgDefaults.waterfalls);
                        expect(org.adConfig).toEqual(newOrgDefaults.adConfig);
                        expect(org.config).toEqual(newOrgDefaults.config);
                        expect(org._data.videoWaterfalls).toEqual(account.waterfallData.options);
                        expect(org._data.displayWaterfalls).toEqual(account.waterfallData.options);
                        expect(org._data.adConfig).toEqual({
                            firstPlacement: {label: 'No ads', value: -1},
                            frequency: {label:'Only show first ad', value: 0},
                            skip: { label:'After 6 sec.', value:6}
                        });
                    });

                    it('should add waterfall options based on org', function() {
                        var org = newOrgDefaults;
                        org.waterfalls.video.push('cinema6-publisher');
                        org.waterfalls.display.push('publisher');
                        org = account.convertOrgForEditing(org);

                        org._data.videoWaterfalls.forEach(function(option) {
                            if (option.value === 'cinema6' || option.value === 'cinema6-publisher') {
                                expect(option.enabled).toBe(true);
                            } else {
                                expect(option.enabled).toBe(false);
                            }
                        });

                        org._data.displayWaterfalls.forEach(function(option) {
                            if (option.value === 'cinema6' || option.value === 'publisher') {
                                expect(option.enabled).toBe(true);
                            } else {
                                expect(option.enabled).toBe(false);
                            }
                        });
                    });

                    it('should add a config block based on org', function() {
                        var org = newOrgDefaults;
                        org.config.minireelinator.embedTypes = ['script', 'shortcode'];
                        org = account.convertOrgForEditing(org);
                        expect(org._data.config.minireelinator.embedTypes[0]).toEqual({
                            title: 'Script Tag',
                            value: 'script',
                            enabled: true
                        });
                        expect(org._data.config.minireelinator.embedTypes[1]).toEqual({
                            title: 'Wordpress Shortcode',
                            value: 'shortcode',
                            enabled: true
                        });
                    });

                    it('should add adConfig options based on org', function(){
                        var org = newOrgDefaults;
                        org.adConfig = {
                            video: {
                                firstPlacement: 3,
                                frequency: 3,
                                skip: false,
                                waterfall: 'publisher'
                            },
                            display: {
                                waterfall: 'cinema6-publisher'
                            }
                        };
                        org = account.convertOrgForEditing(org);

                        expect(org._data.adConfig.firstPlacement).toEqual({label:3,value:3});
                        expect(org._data.adConfig.frequency).toEqual({label:3,value:3});
                        expect(org._data.adConfig.skip).toEqual({label:'No skipping allowed',value:false});
                        expect(org._data.adConfig.waterfall).toBe(undefined);
                    });
                });

                describe('getOrg()', function() {
                    beforeEach(function(){
                        successSpy = jasmine.createSpy('getOrg.success');
                        failureSpy = jasmine.createSpy('getOrg.failure');
                        spyOn($timeout,'cancel');
                    });

                    it('will resolve promise if successfull',function(){
                        $httpBackend.expectGET('/api/account/org/o-1')
                            .respond(200,mockOrg);
                        account.getOrg(mockOrg.id).then(successSpy,failureSpy);
                        $httpBackend.flush();
                        expect(successSpy).toHaveBeenCalledWith(mockOrg);
                        expect(failureSpy).not.toHaveBeenCalled();
                        expect($timeout.cancel).toHaveBeenCalled();
                    });

                    it('will reject promise if not successful',function(){
                        $httpBackend.expectGET('/api/account/org/o-1')
                            .respond(404,'Unable to find org.');
                        account.getOrg(mockOrg.id).then(successSpy,failureSpy);
                        $httpBackend.flush();
                        expect(successSpy).not.toHaveBeenCalled();
                        expect(failureSpy).toHaveBeenCalledWith('Unable to find org.');
                        expect($timeout.cancel).toHaveBeenCalled();
                    });

                    it('will reject promise if times out',function(){
                        $httpBackend.expectGET('/api/account/org/o-1')
                            .respond(200,'');
                        account.getOrg(mockOrg.id).then(successSpy,failureSpy);
                        $timeout.flush(60000);
                        expect(successSpy).not.toHaveBeenCalled();
                        expect(failureSpy).toHaveBeenCalledWith('Request timed out.');
                    });
                });

                describe('getOrgs()', function() {
                    describe('when querying by field', function() {
                        var mockField;

                        beforeEach(function(){
                            successSpy = jasmine.createSpy('getOrgs.success');
                            failureSpy = jasmine.createSpy('getOrgs.failure');
                            spyOn($timeout,'cancel');
                            mockField = 'name';
                        });

                        it('will resolve promise if successfull',function(){
                            $httpBackend.expectGET('/api/account/orgs?sort=name')
                                .respond(200,mockOrgs);
                            account.getOrgs(mockField).then(successSpy,failureSpy);
                            $httpBackend.flush();
                            expect(successSpy).toHaveBeenCalledWith(mockOrgs);
                            expect(failureSpy).not.toHaveBeenCalled();
                            expect($timeout.cancel).toHaveBeenCalled();
                        });

                        it('will reject promise if not successful',function(){
                            $httpBackend.expectGET('/api/account/orgs?sort=name')
                                .respond(404,'Unable to find orgs.');
                            account.getOrgs(mockField).then(successSpy,failureSpy);
                            $httpBackend.flush();
                            expect(successSpy).not.toHaveBeenCalled();
                            expect(failureSpy).toHaveBeenCalledWith('Unable to find orgs.');
                            expect($timeout.cancel).toHaveBeenCalled();
                        });

                        it('will reject promise if times out',function(){
                            $httpBackend.expectGET('/api/account/orgs?sort=name')
                                .respond(200,'');
                            account.getOrgs(mockField).then(successSpy,failureSpy);
                            $timeout.flush(60000);
                            expect(successSpy).not.toHaveBeenCalled();
                            expect(failureSpy).toHaveBeenCalledWith('Request timed out.');
                        });
                    });

                    describe('when querying all orgs', function() {
                        beforeEach(function(){
                            successSpy = jasmine.createSpy('getOrgs.success');
                            failureSpy = jasmine.createSpy('getOrgs.failure');
                            spyOn($timeout,'cancel');
                        });

                        it('will resolve promise if successfull',function(){
                            $httpBackend.expectGET('/api/account/orgs')
                                .respond(200,mockOrgs);
                            account.getOrgs().then(successSpy,failureSpy);
                            $httpBackend.flush();
                            expect(successSpy).toHaveBeenCalledWith(mockOrgs);
                            expect(failureSpy).not.toHaveBeenCalled();
                            expect($timeout.cancel).toHaveBeenCalled();
                        });

                        it('will reject promise if not successful',function(){
                            $httpBackend.expectGET('/api/account/orgs')
                                .respond(404,'Unable to find orgs.');
                            account.getOrgs().then(successSpy,failureSpy);
                            $httpBackend.flush();
                            expect(successSpy).not.toHaveBeenCalled();
                            expect(failureSpy).toHaveBeenCalledWith('Unable to find orgs.');
                            expect($timeout.cancel).toHaveBeenCalled();
                        });

                        it('will reject promise if times out',function(){
                            $httpBackend.expectGET('/api/account/orgs')
                                .respond(200,'');
                            account.getOrgs().then(successSpy,failureSpy);
                            $timeout.flush(60000);
                            expect(successSpy).not.toHaveBeenCalled();
                            expect(failureSpy).toHaveBeenCalledWith('Request timed out.');
                        });
                    });
                });

                describe('putOrg()', function() {
                    beforeEach(function(){
                        successSpy = jasmine.createSpy('putOrg.success');
                        failureSpy = jasmine.createSpy('putOrg.failure');
                        spyOn($timeout,'cancel');
                    });

                    it('will put the proper edited data', function() {
                        var expectedOrg = {};
                        mockOrg = account.convertOrgForEditing(mockOrg);

                        mockOrg.name = 'Org1 Renames',
                        mockOrg.status = 'pending',
                        mockOrg.adConfig.video.waterfall = 'publisher';
                        mockOrg.adConfig.display.waterfall = 'cinema6-publisher';
                        mockOrg.config.minireelinator.minireelDefaults.mode = 'lightbox-ads';
                        mockOrg.config.minireelinator.minireelDefaults.autoplay = false;
                        mockOrg.config.minireelinator.minireelDefaults.splash.ratio = '16-9';
                        mockOrg.config.minireelinator.minireelDefaults.splash.theme = 'text-only';
                        mockOrg._data.videoWaterfalls[0].enabled = true;
                        mockOrg._data.videoWaterfalls[1].enabled = true;
                        mockOrg._data.videoWaterfalls[2].enabled = true;
                        mockOrg._data.videoWaterfalls[3].enabled = true;
                        mockOrg._data.displayWaterfalls[0].enabled = true;
                        mockOrg._data.displayWaterfalls[1].enabled = true;
                        mockOrg._data.displayWaterfalls[2].enabled = true;
                        mockOrg._data.displayWaterfalls[3].enabled = true;
                        mockOrg._data.adConfig.frequency.value = 3;
                        mockOrg._data.adConfig.firstPlacement.value = -1;
                        mockOrg._data.adConfig.skip.value = 60;
                        mockOrg._data.config.minireelinator.embedTypes[0].enabled = false;
                        mockOrg._data.config.minireelinator.embedTypes[1].enabled = true;

                        expectedOrg.name = 'Org1 Renames';
                        expectedOrg.status = 'pending';
                        expectedOrg.adConfig = {
                            video: {
                                firstPlacement: -1,
                                frequency: 3,
                                skip: 60,
                                waterfall: 'publisher'
                            },
                            display: {
                                waterfall: 'cinema6-publisher'
                            }
                        };
                        expectedOrg.waterfalls = {
                            video: ['cinema6','cinema6-publisher','publisher','publisher-cinema6'],
                            display: ['cinema6','cinema6-publisher','publisher','publisher-cinema6']
                        }
                        expectedOrg.config = {
                            minireelinator: {
                                embedTypes: ['shortcode'],
                                minireelDefaults: {
                                    mode: 'lightbox-ads',
                                    autoplay: false,
                                    splash: {
                                        ratio: '16-9',
                                        theme: 'text-only'
                                    }
                                },
                                embedDefaults: {
                                    size: null
                                }
                            }
                        };

                        $httpBackend.expectPUT('/api/account/org/o-1', expectedOrg)
                            .respond(200);
                        account.putOrg(mockOrg).then(successSpy,failureSpy);
                        $httpBackend.flush();
                    });

                    it('will resolve promise if successfull',function(){
                        $httpBackend.expectPUT('/api/account/org/o-1')
                            .respond(200,mockOrg);
                        mockOrg = account.convertOrgForEditing(mockOrg);
                        account.putOrg(mockOrg).then(successSpy,failureSpy);
                        $httpBackend.flush();
                        expect(successSpy).toHaveBeenCalledWith(mockOrg);
                        expect(failureSpy).not.toHaveBeenCalled();
                        expect($timeout.cancel).toHaveBeenCalled();
                    });

                    it('will reject promise if not successful',function(){
                        $httpBackend.expectPUT('/api/account/org/o-1')
                            .respond(404,'Unable to update org.');
                        mockOrg = account.convertOrgForEditing(mockOrg);
                        account.putOrg(mockOrg).then(successSpy,failureSpy);
                        $httpBackend.flush();
                        expect(successSpy).not.toHaveBeenCalled();
                        expect(failureSpy).toHaveBeenCalledWith('Unable to update org.');
                        expect($timeout.cancel).toHaveBeenCalled();
                    });

                    it('will reject promise if times out',function(){
                        $httpBackend.expectPUT('/api/account/org/o-1')
                            .respond(200,'');
                        mockOrg = account.convertOrgForEditing(mockOrg);
                        account.putOrg(mockOrg).then(successSpy,failureSpy);
                        $timeout.flush(60000);
                        expect(successSpy).not.toHaveBeenCalled();
                        expect(failureSpy).toHaveBeenCalledWith('Request timed out.');
                    });
                });

                describe('postOrg()', function() {
                    beforeEach(function(){
                        successSpy = jasmine.createSpy('postOrg.success');
                        failureSpy = jasmine.createSpy('postOrg.failure');
                        spyOn($timeout,'cancel');
                    });

                    it('will send the proper defaults', function() {
                        var org = {
                            name: 'Org1',
                            status: 'active',
                            adConfig: {
                                video: {
                                    firstPlacement: -1,
                                    frequency: 0,
                                    skip: 6,
                                    waterfall: 'cinema6'
                                },
                                display: {
                                    waterfall: 'cinema6'
                                }
                            },
                            waterfalls: {
                                video: ['cinema6'],
                                display: ['cinema6']
                            },
                            config: {
                                minireelinator: {
                                    embedTypes: ['script'],
                                    minireelDefaults: {
                                        mode: 'light',
                                        autoplay: true,
                                        splash: {
                                            ratio: '3-2',
                                            theme: 'img-text-overlay'
                                        }
                                    },
                                    embedDefaults: {
                                        size: null
                                    }
                                }
                            }
                        };
                        $httpBackend.expectPOST('/api/account/org', org)
                            .respond(200);
                        mockOrg = account.convertOrgForEditing(mockOrg);
                        account.postOrg(mockOrg).then(successSpy,failureSpy);
                        $httpBackend.flush();
                    });

                    it('will send the correct data', function() {
                        var expectedOrg = {};
                        mockOrg = account.convertOrgForEditing(mockOrg);

                        mockOrg.name = 'Org1 Renames',
                        mockOrg.status = 'pending',
                        mockOrg.adConfig.video.waterfall = 'publisher';
                        mockOrg.adConfig.display.waterfall = 'cinema6-publisher';
                        mockOrg.config.minireelinator.minireelDefaults.mode = 'lightbox-ads';
                        mockOrg.config.minireelinator.minireelDefaults.autoplay = false;
                        mockOrg.config.minireelinator.minireelDefaults.splash.ratio = '16-9';
                        mockOrg.config.minireelinator.minireelDefaults.splash.theme = 'text-only';
                        mockOrg._data.videoWaterfalls[0].enabled = true;
                        mockOrg._data.videoWaterfalls[1].enabled = true;
                        mockOrg._data.videoWaterfalls[2].enabled = true;
                        mockOrg._data.videoWaterfalls[3].enabled = true;
                        mockOrg._data.displayWaterfalls[0].enabled = true;
                        mockOrg._data.displayWaterfalls[1].enabled = true;
                        mockOrg._data.displayWaterfalls[2].enabled = true;
                        mockOrg._data.displayWaterfalls[3].enabled = true;
                        mockOrg._data.adConfig.frequency.value = 3;
                        mockOrg._data.adConfig.firstPlacement.value = 3;
                        mockOrg._data.adConfig.skip.value = 60;
                        mockOrg._data.config.minireelinator.embedTypes[0].enabled = false;
                        mockOrg._data.config.minireelinator.embedTypes[1].enabled = true;

                        expectedOrg.name = 'Org1 Renames';
                        expectedOrg.status = 'pending';
                        expectedOrg.adConfig = {
                            video: {
                                firstPlacement: 3,
                                frequency: 3,
                                skip: 60,
                                waterfall: 'publisher'
                            },
                            display: {
                                waterfall: 'cinema6-publisher'
                            }
                        };
                        expectedOrg.waterfalls = {
                            video: ['cinema6','cinema6-publisher','publisher','publisher-cinema6'],
                            display: ['cinema6','cinema6-publisher','publisher','publisher-cinema6']
                        }
                        expectedOrg.config = {
                            minireelinator: {
                                embedTypes: ['shortcode'],
                                minireelDefaults: {
                                    mode: 'lightbox-ads',
                                    autoplay: false,
                                    splash: {
                                        ratio: '16-9',
                                        theme: 'text-only'
                                    }
                                },
                                embedDefaults: {
                                    size: null
                                }
                            }
                        };

                        $httpBackend.expectPOST('/api/account/org', expectedOrg)
                            .respond(200);
                        account.postOrg(mockOrg).then(successSpy,failureSpy);
                        $httpBackend.flush();
                    });

                    it('will resolve promise if successfull',function(){
                        $httpBackend.expectPOST('/api/account/org')
                            .respond(200,mockOrg);
                        mockOrg = account.convertOrgForEditing(mockOrg);
                        account.postOrg(mockOrg).then(successSpy,failureSpy);
                        $httpBackend.flush();
                        expect(successSpy).toHaveBeenCalledWith(mockOrg);
                        expect(failureSpy).not.toHaveBeenCalled();
                        expect($timeout.cancel).toHaveBeenCalled();
                    });

                    it('will reject promise if not successful',function(){
                        $httpBackend.expectPOST('/api/account/org')
                            .respond(404,'Unable to create org.');
                        mockOrg = account.convertOrgForEditing(mockOrg);
                        account.postOrg(mockOrg).then(successSpy,failureSpy);
                        $httpBackend.flush();
                        expect(successSpy).not.toHaveBeenCalled();
                        expect(failureSpy).toHaveBeenCalledWith('Unable to create org.');
                        expect($timeout.cancel).toHaveBeenCalled();
                    });

                    it('will reject promise if times out',function(){
                        $httpBackend.expectPOST('/api/account/org')
                            .respond(200,'');
                        mockOrg = account.convertOrgForEditing(mockOrg);
                        account.postOrg(mockOrg).then(successSpy,failureSpy);
                        $timeout.flush(60000);
                        expect(successSpy).not.toHaveBeenCalled();
                        expect(failureSpy).toHaveBeenCalledWith('Request timed out.');
                    });
                });

                describe('getUser()', function() {
                    beforeEach(function(){
                        successSpy = jasmine.createSpy('getUser.success');
                        failureSpy = jasmine.createSpy('getUser.failure');
                        spyOn($timeout,'cancel');
                    });

                    it('will resolve promise if successfull',function(){
                        $httpBackend.expectGET('/api/account/user/u-1')
                            .respond(200,mockUser);
                        account.getUser(mockUser.id).then(successSpy,failureSpy);
                        $httpBackend.flush();
                        expect(successSpy).toHaveBeenCalledWith(mockUser);
                        expect(failureSpy).not.toHaveBeenCalled();
                        expect($timeout.cancel).toHaveBeenCalled();
                    });

                    it('will reject promise if not successful',function(){
                        $httpBackend.expectGET('/api/account/user/u-1')
                            .respond(404,'Unable to find user.');
                        account.getUser(mockUser.id).then(successSpy,failureSpy);
                        $httpBackend.flush();
                        expect(successSpy).not.toHaveBeenCalled();
                        expect(failureSpy).toHaveBeenCalledWith('Unable to find user.');
                        expect($timeout.cancel).toHaveBeenCalled();
                    });

                    it('will reject promise if times out',function(){
                        $httpBackend.expectGET('/api/account/user/u-1')
                            .respond(200,'');
                        account.getUser(mockUser.id).then(successSpy,failureSpy);
                        $timeout.flush(60000);
                        expect(successSpy).not.toHaveBeenCalled();
                        expect(failureSpy).toHaveBeenCalledWith('Request timed out.');
                    });
                });

                describe('getUsers()', function() {
                    describe('when querying by org', function() {
                        beforeEach(function(){
                            successSpy = jasmine.createSpy('getUsers.success');
                            failureSpy = jasmine.createSpy('getUsers.failure');
                            spyOn($timeout,'cancel');
                            mockUsers = [{id:'u-1'}, {name:'u-2'}];
                        });

                        it('will resolve promise if successfull',function(){
                            $httpBackend.expectGET('/api/account/users?org=o-1')
                                .respond(200,mockUsers);
                            account.getUsers(mockOrg).then(successSpy,failureSpy);
                            $httpBackend.flush();
                            expect(successSpy).toHaveBeenCalledWith(mockUsers);
                            expect(failureSpy).not.toHaveBeenCalled();
                            expect($timeout.cancel).toHaveBeenCalled();
                        });

                        it('will reject promise if not successful',function(){
                            $httpBackend.expectGET('/api/account/users?org=o-1')
                                .respond(404,'Unable to find users.');
                            account.getUsers(mockOrg).then(successSpy,failureSpy);
                            $httpBackend.flush();
                            expect(successSpy).not.toHaveBeenCalled();
                            expect(failureSpy).toHaveBeenCalledWith('Unable to find users.');
                            expect($timeout.cancel).toHaveBeenCalled();
                        });

                        it('will reject promise if times out',function(){
                            $httpBackend.expectGET('/api/account/users?org=o-1')
                                .respond(200,'');
                            account.getUsers(mockOrg).then(successSpy,failureSpy);
                            $timeout.flush(60000);
                            expect(successSpy).not.toHaveBeenCalled();
                            expect(failureSpy).toHaveBeenCalledWith('Request timed out.');
                        });
                    });

                    describe('when querying all orgs', function() {
                        beforeEach(function(){
                            successSpy = jasmine.createSpy('getUsers.success');
                            failureSpy = jasmine.createSpy('getUsers.failure');
                            spyOn($timeout,'cancel');
                        });

                        it('will resolve promise if successfull',function(){
                            $httpBackend.expectGET('/api/account/users')
                                .respond(200,mockUsers);
                            account.getUsers().then(successSpy,failureSpy);
                            $httpBackend.flush();
                            expect(successSpy).toHaveBeenCalledWith(mockUsers);
                            expect(failureSpy).not.toHaveBeenCalled();
                            expect($timeout.cancel).toHaveBeenCalled();
                        });

                        it('will reject promise if not successful',function(){
                            $httpBackend.expectGET('/api/account/users')
                                .respond(404,'Unable to find users.');
                            account.getUsers().then(successSpy,failureSpy);
                            $httpBackend.flush();
                            expect(successSpy).not.toHaveBeenCalled();
                            expect(failureSpy).toHaveBeenCalledWith('Unable to find users.');
                            expect($timeout.cancel).toHaveBeenCalled();
                        });

                        it('will reject promise if times out',function(){
                            $httpBackend.expectGET('/api/account/users')
                                .respond(200,'');
                            account.getUsers().then(successSpy,failureSpy);
                            $timeout.flush(60000);
                            expect(successSpy).not.toHaveBeenCalled();
                            expect(failureSpy).toHaveBeenCalledWith('Request timed out.');
                        });
                    });
                });

                describe('putUser()', function() {
                    beforeEach(function(){
                        successSpy = jasmine.createSpy('putUser.success');
                        failureSpy = jasmine.createSpy('putUser.failure');
                        spyOn($timeout,'cancel');
                    });

                    it('should put the correct data fields', function() {
                        var user = angular.copy(mockUser);
                        delete user.id;
                        delete user.email;

                        $httpBackend.expectPUT('/api/account/user/u-1', user)
                            .respond(200);
                        account.putUser(mockUser);
                        $httpBackend.flush();
                    });

                    it('will resolve promise if successfull',function(){
                        $httpBackend.expectPUT('/api/account/user/u-1')
                            .respond(200,mockUser);
                        account.putUser(mockUser).then(successSpy,failureSpy);
                        $httpBackend.flush();
                        expect(successSpy).toHaveBeenCalledWith(mockUser);
                        expect(failureSpy).not.toHaveBeenCalled();
                        expect($timeout.cancel).toHaveBeenCalled();
                    });

                    it('will reject promise if not successful',function(){
                        $httpBackend.expectPUT('/api/account/user/u-1')
                            .respond(404,'Unable to update user.');
                        account.putUser(mockUser).then(successSpy,failureSpy);
                        $httpBackend.flush();
                        expect(successSpy).not.toHaveBeenCalled();
                        expect(failureSpy).toHaveBeenCalledWith('Unable to update user.');
                        expect($timeout.cancel).toHaveBeenCalled();
                    });

                    it('will reject promise if times out',function(){
                        $httpBackend.expectPUT('/api/account/user/u-1')
                            .respond(200,'');
                        account.putUser(mockUser).then(successSpy,failureSpy);
                        $timeout.flush(60000);
                        expect(successSpy).not.toHaveBeenCalled();
                        expect(failureSpy).toHaveBeenCalledWith('Request timed out.');
                    });
                });

                describe('postUser()', function() {
                    beforeEach(function(){
                        successSpy = jasmine.createSpy('postUser.success');
                        failureSpy = jasmine.createSpy('postUser.failure');
                        spyOn($timeout,'cancel');
                    });

                    it('will resolve promise if successfull',function(){
                        $httpBackend.expectPOST('/api/account/user')
                            .respond(200,mockUser);
                        account.postUser(mockUser).then(successSpy,failureSpy);
                        $httpBackend.flush();
                        expect(successSpy).toHaveBeenCalledWith(mockUser);
                        expect(failureSpy).not.toHaveBeenCalled();
                        expect($timeout.cancel).toHaveBeenCalled();
                    });

                    it('will reject promise if not successful',function(){
                        $httpBackend.expectPOST('/api/account/user')
                            .respond(404,'Unable to create user.');
                        account.postUser(mockUser).then(successSpy,failureSpy);
                        $httpBackend.flush();
                        expect(successSpy).not.toHaveBeenCalled();
                        expect(failureSpy).toHaveBeenCalledWith('Unable to create user.');
                        expect($timeout.cancel).toHaveBeenCalled();
                    });

                    it('will reject promise if times out',function(){
                        $httpBackend.expectPOST('/api/account/user')
                            .respond(200,'');
                        account.postUser(mockUser).then(successSpy,failureSpy);
                        $timeout.flush(60000);
                        expect(successSpy).not.toHaveBeenCalled();
                        expect(failureSpy).toHaveBeenCalledWith('Request timed out.');
                    });
                });
            });
        });
    });
}());