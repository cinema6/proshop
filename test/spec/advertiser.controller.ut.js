(function() {
    'use strict';

    define(['app'], function(proshop) {
        describe('AdvertiserController', function() {
            var $rootScope,
                $scope,
                $controller,
                $q,
                $log,
                $routeParams,
                $location,
                AdvertiserCtrl,
                Cinema6Service,
                ConfirmDialogService,
                mockAdvertiser;

            function compileCtrl(id) {
                $routeParams = { id: id };

                $scope = $rootScope.$new();

                AdvertiserCtrl = $controller('AdvertiserController', {
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
                    get: jasmine.createSpy('Cinema6Service.get'),
                    put: jasmine.createSpy('Cinema6Service.put'),
                    post: jasmine.createSpy('Cinema6Service.post'),
                    delete: jasmine.createSpy('Cinema6Service.delete')
                }

                /* jshint quotmark:false */
                mockAdvertiser = {
                    "id": "a-111",
                    "adtechId": "12121212",
                    "name": "Ybrant",
                    "created": "2014-06-13T19:28:39.408Z",
                    "lastUpdated": "2015-01-12T18:06:52.877Z",
                    "defaultLinks": {
                        "Facebook": "http://facebook.com",
                        "Twitter": "http://twitter.com"
                    },
                    "defaultLogos": {
                        "Main": "http://example.com/logo.jpg"
                    },
                    "status": "active"
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
                        compileCtrl('a-111');
                    });

                    it('should exist', function() {
                        expect(AdvertiserCtrl).toBeDefined();
                    });

                    it('should load the advertiser', function() {
                        expect(Cinema6Service.get).toHaveBeenCalled();
                    });
                });

                describe('when path is /new', function() {
                    beforeEach(function() {
                        compileCtrl();
                    });

                    it('should exist', function() {
                        expect(AdvertiserCtrl).toBeDefined();
                    });

                    it('should not load a advertiser', function() {
                        expect(Cinema6Service.get).not.toHaveBeenCalled();
                    });
                });
            });

            describe('properties', function() {
                describe('loading', function() {
                    describe('/new', function() {
                        it('should be false', function() {
                            compileCtrl();
                            expect(AdvertiserCtrl.loading).toBe(false);
                        });
                    });

                    describe('/:id', function() {
                        beforeEach(function() {
                            compileCtrl('a-111');
                        });

                        it('should be true on initialization', function() {
                            expect(AdvertiserCtrl.loading).toBe(true);
                        });

                        it('should be false after all data promises resolve', function() {
                            $scope.$apply(function() {
                                Cinema6Service.get.deferred.resolve(angular.copy(mockAdvertiser));
                            });

                            expect(AdvertiserCtrl.loading).toBe(false);
                        });

                        it('should be false even if there are errors loading data', function() {
                            $scope.$apply(function() {
                                Cinema6Service.get.deferred.reject();
                            });

                            expect(AdvertiserCtrl.loading).toBe(false);
                        });
                    });
                });
            });

            describe('methods', function() {
                describe('addLink()', function() {
                    it('should add a new link to Links array and reset new link object on Ctrl', function() {
                        compileCtrl();
                        AdvertiserCtrl.newLink.name = 'New Link';
                        AdvertiserCtrl.newLink.href = 'http://newlink.com';
                        AdvertiserCtrl.addLink();

                        expect(AdvertiserCtrl.links[AdvertiserCtrl.links.length - 1].name).toBe('New Link');
                        expect(AdvertiserCtrl.links[AdvertiserCtrl.links.length - 1].href).toBe('http://newlink.com');

                        expect(AdvertiserCtrl.newLink.name).toBe('Untitled');
                        expect(AdvertiserCtrl.newLink.href).toBe(null);
                    });
                });

                describe('removeLink(link)', function() {
                    it('should remove the link', function() {
                        var linkToDelete, originalLinkLength;

                        compileCtrl();

                        AdvertiserCtrl.links[0].href = 'http://link.com';

                        linkToDelete = angular.copy(AdvertiserCtrl.links[0]);
                        originalLinkLength = AdvertiserCtrl.links.length;

                        AdvertiserCtrl.removeLink(AdvertiserCtrl.links[0]);

                        expect(AdvertiserCtrl.links[0].name).not.toEqual(linkToDelete.name);
                        expect(AdvertiserCtrl.links[0].href).not.toEqual(linkToDelete.href);
                        expect(AdvertiserCtrl.links.length).toEqual(originalLinkLength - 1);
                    });
                });

                describe('addLogo()', function() {
                    it('should add a new logo to Logos array and reset new logo object on Ctrl', function() {
                        compileCtrl();
                        AdvertiserCtrl.newLogo.name = 'New Logo';
                        AdvertiserCtrl.newLogo.href = 'http://newlogo.com';
                        AdvertiserCtrl.addLogo();

                        expect(AdvertiserCtrl.logos[AdvertiserCtrl.logos.length - 1].name).toBe('New Logo');
                        expect(AdvertiserCtrl.logos[AdvertiserCtrl.logos.length - 1].href).toBe('http://newlogo.com');

                        expect(AdvertiserCtrl.newLogo.name).toBe('Untitled');
                        expect(AdvertiserCtrl.newLogo.href).toBe(null);
                    });
                });

                describe('removeLogo(logo)', function() {
                    it('should remove the link', function() {
                        var logoToDelete, originalLogoLength;

                        compileCtrl();

                        AdvertiserCtrl.newLogo.name = 'Logo';
                        AdvertiserCtrl.newLogo.href = 'http://logo.com';
                        AdvertiserCtrl.addLogo();

                        AdvertiserCtrl.newLogo.name = 'Logo2';
                        AdvertiserCtrl.newLogo.href = 'http://logo2.com';
                        AdvertiserCtrl.addLogo();

                        logoToDelete = angular.copy(AdvertiserCtrl.logos[0]);
                        originalLogoLength = AdvertiserCtrl.logos.length;

                        AdvertiserCtrl.removeLogo(AdvertiserCtrl.logos[0]);

                        expect(AdvertiserCtrl.logos[0].name).not.toEqual(logoToDelete.name);
                        expect(AdvertiserCtrl.logos[0].href).not.toEqual(logoToDelete.href);
                        expect(AdvertiserCtrl.logos.length).toEqual(originalLogoLength - 1);
                    });
                });

                describe('save(advertiser)', function() {
                    describe('when /new', function() {
                        beforeEach(function() {
                            compileCtrl();

                            AdvertiserCtrl.advertiser.name = 'New Advertiser';
                            AdvertiserCtrl.advertiser.status = 'active';
                        });

                        it('should POST the advertiser', function() {
                            AdvertiserCtrl.save(AdvertiserCtrl.advertiser);

                            expect(Cinema6Service.post).toHaveBeenCalledWith('advertisers', {
                                name: 'New Advertiser',
                                status: 'active',
                                defaultLinks: {},
                                defaultLogos: {}
                            });
                        });

                        it('should return to /advertisers on successful save', function() {
                            AdvertiserCtrl.save(AdvertiserCtrl.advertiser);

                            $scope.$apply(function() {
                                Cinema6Service.post.deferred.resolve(AdvertiserCtrl.advertiser);
                            });

                            expect($location.path).toHaveBeenCalledWith('/advertisers');
                        });

                        it('should display an error dialog on failure', function() {
                            AdvertiserCtrl.save(AdvertiserCtrl.advertiser);

                            $scope.$apply(function() {
                                Cinema6Service.post.deferred.reject('Error message');
                            });

                            expect(ConfirmDialogService.display).toHaveBeenCalled();
                            expect(ConfirmDialogService.display.calls.mostRecent().args[0].prompt).toBe('There was a problem saving the Advertiser. Error message.');
                        });
                    });

                    describe('when /:id', function() {
                        beforeEach(function() {
                            compileCtrl('a-111');

                            $scope.$apply(function() {
                                Cinema6Service.get.deferred.resolve(mockAdvertiser);
                            });
                        });

                        it('should PUT the advertiser', function() {
                            AdvertiserCtrl.save(AdvertiserCtrl.advertiser);

                            expect(Cinema6Service.put).toHaveBeenCalledWith('advertisers', 'a-111', {
                                name: 'Ybrant',
                                status: 'active',
                                defaultLinks: {
                                    Facebook: "http://facebook.com",
                                    Twitter: "http://twitter.com"
                                },
                                defaultLogos: {
                                    Main: "http://example.com/logo.jpg"
                                }
                            });

                            AdvertiserCtrl.advertiser.name = 'DashBid';
                            AdvertiserCtrl.advertiser.status = 'inactive';
                            AdvertiserCtrl.links.forEach(function(link) {
                                if (link.name === 'Facebook') {
                                    link.href = 'http://different-url.com';
                                }
                                if (link.name === 'Website') {
                                    link.href = 'http://new-link-added.com';
                                }
                            });
                            AdvertiserCtrl.logos.forEach(function(logo) {
                                if (logo.name === 'Main') {
                                    logo.href = 'http://new-logo-url.com';
                                }
                            });

                            AdvertiserCtrl.logos.push({name: 'New Logo', href: 'http://newlogo.com'});

                            AdvertiserCtrl.save(AdvertiserCtrl.advertiser);

                            expect(Cinema6Service.put).toHaveBeenCalledWith('advertisers', 'a-111', {
                                name: 'DashBid',
                                status: 'inactive',
                                defaultLinks: {
                                    Website: 'http://new-link-added.com',
                                    Facebook: 'http://different-url.com',
                                    Twitter: 'http://twitter.com'
                                },
                                defaultLogos: {
                                    Main: 'http://new-logo-url.com',
                                    'New Logo': 'http://newlogo.com'
                                }
                            });
                        });

                        it('should return to /advertisers on successful save', function() {
                            AdvertiserCtrl.save(AdvertiserCtrl.advertiser);

                            $scope.$apply(function() {
                                Cinema6Service.put.deferred.resolve(AdvertiserCtrl.advertiser);
                            });

                            expect($location.path).toHaveBeenCalledWith('/advertisers');
                        });

                        it('should display an error dialog on failure', function() {
                            AdvertiserCtrl.save(AdvertiserCtrl.advertiser);

                            $scope.$apply(function() {
                                Cinema6Service.put.deferred.reject('Error message');
                            });

                            expect(ConfirmDialogService.display).toHaveBeenCalled();
                            expect(ConfirmDialogService.display.calls.mostRecent().args[0].prompt).toBe('There was a problem saving the Advertiser. Error message.');
                        });
                    });
                });

                describe('delete(advertiser)', function() {
                    var onAffirm, onCancel;

                    beforeEach(function() {
                        compileCtrl('a-111');

                        $scope.$apply(function() {
                            Cinema6Service.get.deferred.resolve(mockAdvertiser);
                        });

                        AdvertiserCtrl.delete();

                        onAffirm = ConfirmDialogService.display.calls.mostRecent().args[0].onAffirm;
                        onCancel = ConfirmDialogService.display.calls.mostRecent().args[0].onCancel;
                    });

                    it('should display a confirmation dialog', function() {
                        expect(ConfirmDialogService.display).toHaveBeenCalled();
                    });

                    describe('onAffirm()', function() {
                        it('should close the dialog and delete advertiser', function() {
                            onAffirm();

                            expect(ConfirmDialogService.close).toHaveBeenCalled();
                            expect(Cinema6Service.delete).toHaveBeenCalled();
                        });

                        describe('when delete is successful', function() {
                            it('should show redirect back to full advertiser list', function() {
                                onAffirm();

                                $scope.$apply(function() {
                                    Cinema6Service.delete.deferred.resolve();
                                });

                                expect($location.path).toHaveBeenCalledWith('/advertisers');
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
                                expect(ConfirmDialogService.display.calls.mostRecent().args[0].prompt).toBe('There was a problem deleting the Advertiser. Error message.');
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