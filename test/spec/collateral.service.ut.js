(function() {
    'use strict';

    define(['splash'], function(splash) {
        describe('CollateralService', function() {
            var $rootScope,
                $q,
                $httpBackend,
                CollateralServiceProvider,
                CollateralService,
                VideoThumbnailService,
                FileService;

            beforeEach(function() {
                module(splash.name, function($injector) {
                    CollateralServiceProvider = $injector.get('CollateralServiceProvider');
                });

                inject(function($injector) {
                    $rootScope = $injector.get('$rootScope');
                    FileService = $injector.get('FileService');
                    $q = $injector.get('$q');
                    $httpBackend = $injector.get('$httpBackend');
                    VideoThumbnailService = $injector.get('VideoThumbnailService');

                    CollateralService = $injector.get('CollateralService');
                });
            });

            it('should exist', function() {
                expect(CollateralService).toEqual(jasmine.any(Object));
            });

            describe('methods', function() {
                describe('generateCollage(options)', function() {
                    var minireel, thumbs,
                        success;

                    function Thumb(card) {
                        this.small = card ?
                            (card.data.videoid + '--small.jpg') :
                            null;

                        this.large = card ?
                            (card.data.videoid + '--large.jpg') :
                            null;

                        this.ensureFulfillment = jasmine.createSpy('thumb.ensureFulfillment()')
                            .and.callFake(function() {
                                return $q.when(this);
                            });
                    }

                    beforeEach(function() {
                        success = jasmine.createSpy('generateCollage() success');

                        minireel = {
                            id: 'e-ef657e8ea90c84',
                            data: {
                                splash: {
                                    ratio: '16-9'
                                },
                                deck: [
                                    {
                                        data: {
                                            service: 'youtube',
                                            videoid: '123'
                                        }
                                    },
                                    {
                                        data: {
                                            service: 'vimeo',
                                            videoid: 'abc'
                                        }
                                    },
                                    {
                                        data: {}
                                    },
                                    {
                                        data: {
                                            service: 'dailymotion',
                                            videoid: 'abc123'
                                        }
                                    },
                                    {
                                        data: {}
                                    }
                                ]
                            }
                        };

                        thumbs = {
                            '123': new Thumb(minireel.data.deck[0]),
                            'abc': new Thumb(minireel.data.deck[1]),
                            'abc123': new Thumb(minireel.data.deck[3])
                        };

                        spyOn(VideoThumbnailService, 'getThumbsFor').and.callFake(function(service, videoid) {
                            return thumbs[videoid] || new Thumb();
                        });

                        $httpBackend.expectPOST('/api/collateral/splash/' + minireel.id, {
                            imageSpecs: [
                                {
                                    name: 'splash',
                                    width: 600,
                                    height: 600 * (9 / 16),
                                    ratio: '16-9'
                                }
                            ],
                            thumbs: Object.keys(thumbs).map(function(key) {
                                return thumbs[key].large;
                            })
                        }).respond(201, [
                            {
                                path: 'collateral/' + minireel.id + '/splash',
                                code: 201,
                                ratio: '16-9',
                                name: 'splash'
                            }
                        ]);

                        CollateralService.generateCollage({
                            minireel: minireel,
                            name: 'splash',
                            width: 600
                        }).then(success);

                        $httpBackend.flush();
                    });

                    it('should make sure every ThumbModel is fulfilled', function() {
                        Object.keys(thumbs).forEach(function(key) {
                            expect(thumbs[key].ensureFulfillment).toHaveBeenCalled();
                        });
                    });

                    it('should resolve to the path of the generated image', function() {
                        expect(success).toHaveBeenCalledWith({
                            '16-9': '/collateral/' + minireel.id + '/splash'
                        });
                        expect(success.calls.mostRecent().args[0].toString()).toBe(
                            '/collateral/' + minireel.id + '/splash'
                        );
                    });

                    it('should allow a default width to be configured', function() {
                        $httpBackend.expectPOST('/api/collateral/splash/' + minireel.id, {
                            imageSpecs: [
                                {
                                    name: 'foo',
                                    width: 800,
                                    height: 800 * (9 / 16),
                                    ratio: '16-9',
                                }
                            ],
                            thumbs: Object.keys(thumbs).map(function(key) {
                                return thumbs[key].large;
                            })
                        }).respond(201, [
                            {
                                name: 'foo',
                                ratio: '16-9',
                                path: 'collateral/' + minireel.id + '/foo',
                                code: 201
                            }
                        ]);

                        CollateralServiceProvider.defaultCollageWidth(800);

                        CollateralService.generateCollage({
                            minireel: minireel,
                            name: 'foo'
                        });

                        $httpBackend.flush();
                    });

                    it('should offer the option not to cache the image', function() {
                        $httpBackend.expectPOST('/api/collateral/splash/' + minireel.id + '?noCache=true', {
                            imageSpecs: [
                                {
                                    name: 'splash',
                                    width: 800,
                                    height: 800 * (9 / 16),
                                    ratio: '16-9'
                                }
                            ],
                            thumbs: Object.keys(thumbs).map(function(key) {
                                return thumbs[key].large;
                            })
                        }).respond(201, [
                            {
                                name: 'splash',
                                ratio: '16-9',
                                path: 'collateral/' + minireel.id + '/splash',
                                code: 201
                            }
                        ]);

                        CollateralService.generateCollage({
                            minireel: minireel,
                            name: 'splash',
                            cache: false,
                            width: 800
                        });

                        $httpBackend.flush();
                    });
                });

                describe('setSplash(url, experience)', function() {
                    var experience,
                        uploadDeferred,
                        blobDeferred,
                        success,
                        splash,
                        uploadResponse;

                    beforeEach(function() {
                        experience = {
                            id: 'e-cdbe0a2260e870',
                            data: {
                                collateral: {}
                            }
                        };
                        splash = {name: 'splash'};
                        uploadDeferred = $q.defer();
                        blobDeferred = $q.defer();
                        uploadResponse = {
                            status: 201,
                            data: [
                                {
                                    name: 'splash',
                                    code: 201,
                                    path: 'collateral/e2e-org/ce114e4501d2f4e2dcea3e17b546f339.splash.jpg'
                                }
                            ]
                        };

                        spyOn(FileService, 'uploadBlob')
                            .and.returnValue(uploadDeferred.promise);
                        spyOn(FileService, 'openBlob')
                            .and.returnValue(blobDeferred.promise);

                        success = jasmine.createSpy('setSplash success');

                        CollateralService.setSplash('/collateral/e-1/splash', experience)
                            .then(success);
                    });

                    it('should upload the file to the collateral service', function() {
                        expect(FileService.openBlob).toHaveBeenCalledWith('/collateral/e-1/splash');
                        $rootScope.$apply(function() {
                            blobDeferred.resolve(splash);
                        });
                        expect(FileService.uploadBlob).toHaveBeenCalledWith('/api/collateral/files/' + experience.id + '?noCache=true', splash);
                    });

                    describe('after the upload is complete', function() {
                        beforeEach(function() {
                            $rootScope.$apply(function() {
                                blobDeferred.resolve(splash);
                                uploadDeferred.resolve(uploadResponse);
                            });
                        });

                        it('should resolve to the experience', function() {
                            expect(success).toHaveBeenCalledWith(uploadResponse);
                        });
                    });
                });
            });
        });
    });
}());
