define( ['angular','c6ui'],
function( angular , c6ui ) {
    'use strict';

    var forEach = angular.forEach,
        isUndefined = angular.isUndefined,
        fromJson = angular.fromJson;

    return angular.module('c6.proshop.splash', [c6ui.name])

        .service('VideoThumbnailService', ['$q','$cacheFactory','$http',
        function                          ( $q , $cacheFactory , $http ) {
            var _private = {},
                cache = $cacheFactory('VideoThumbnailService:models');

            function ThumbModel(promise) {
                var self = this;

                this.small = null;
                this.large = null;

                this.ensureFulfillment = function() {
                    return promise;
                };

                promise = promise.then(function setThumbs(thumbs) {
                    self.small = thumbs.small;
                    self.large = thumbs.large;

                    return self;
                });
            }

            _private.fetchYouTubeThumbs = function(videoid) {
                return $q.when({
                    small: '//img.youtube.com/vi/' + videoid + '/2.jpg',
                    large: '//img.youtube.com/vi/' + videoid + '/0.jpg'
                });
            };

            _private.fetchVimeoThumbs = function(videoid) {
                return $http.get('//vimeo.com/api/v2/video/' + videoid + '.json')
                    .then(function handleResponse(response) {
                        var data = response.data[0];

                        return {
                            /* jshint camelcase:false */
                            small: data.thumbnail_small,
                            large: data.thumbnail_large
                            /* jshint camelcase:true */
                        };
                    });
            };

            _private.fetchDailyMotionThumbs = function(videoid) {
                return $http.get(
                    'https://api.dailymotion.com/video/' +
                    videoid +
                    '?fields=thumbnail_120_url,thumbnail_url&ssl_assets=1'
                ).then(function handleResponse(response) {
                    var data = response.data;

                    return {
                        /* jshint camelcase:false */
                        small: data.thumbnail_120_url,
                        large: data.thumbnail_url
                        /* jshint camelcase:true */
                    };
                });
            };

            this.getThumbsFor = function(service, videoid) {
                var key = service + ':' + videoid;

                return cache.get(key) ||
                    cache.put(key, (function() {
                        switch (service) {
                        case 'youtube':
                            return new ThumbModel(_private.fetchYouTubeThumbs(videoid));
                        case 'vimeo':
                            return new ThumbModel(_private.fetchVimeoThumbs(videoid));
                        case 'dailymotion':
                            return new ThumbModel(_private.fetchDailyMotionThumbs(videoid));
                        default:
                            return new ThumbModel($q.when({
                                small: null,
                                large: null
                            }));
                        }
                    }()));
            };

            if (window.c6.kHasKarma) { this._private = _private; }
        }])

        .provider('CollateralService', [function() {
            var defaultCollageWidth = null,
                ratios = [];

            this.defaultCollageWidth = function(width) {
                defaultCollageWidth = width;

                return this;
            };

            this.ratios = function(ratioData) {
                ratios = ratioData;

                return this;
            };

            this.$get = ['FileService','$http','VideoThumbnailService','$q',
            function    ( FileService , $http , VideoThumbnailService , $q ) {
                function CollateralService() {
                    function CollageResult(response) {
                        forEach(response, function(data) {
                            this[data.ratio] = '/' + data.path;
                        }, this);
                    }
                    CollageResult.prototype = {
                        toString: function() {
                            return Object.keys(this).map(function(ratio) {
                                return this[ratio];
                            }, this).join(',');
                        }
                    };

                    this.setSplash = function(file, experience) {
                        return FileService.openBlob(file)
                            .then(function(splash) {
                                return FileService.uploadBlob('/api/collateral/files/' + experience.id + '?noCache=true', splash);
                            });
                    };

                    this.generateCollage = function(options) {
                        var minireel = options.minireel,
                            name = options.name,
                            width = options.width || defaultCollageWidth,
                            cache = isUndefined(options.cache) ? true : options.cache,
                            ratio = minireel.data.splash.ratio.split('-');

                        function fetchThumbs(minireel) {
                            return $q.all(minireel.data.deck.map(function(card) {
                                return VideoThumbnailService.getThumbsFor(
                                    card.type,
                                    card.data.videoid
                                ).ensureFulfillment();
                            })).then(function map(thumbs) {
                                return thumbs.map(function(thumb) {
                                    return thumb.large;
                                }).filter(function(src) {
                                    return !!src;
                                });
                            });
                        }

                        function generateCollage(thumbs) {
                            return $http.post('/api/collateral/splash/' + minireel.id, {
                                imageSpecs: [
                                    {
                                        name: name,
                                        width: width,
                                        height: width * (ratio[1] / ratio[0]),
                                        ratio: ratio.join('-')
                                    }
                                ],
                                thumbs: thumbs
                            }, {
                                params: cache ? null : {
                                    noCache: true
                                }
                            }).then(function returnResult(response) {
                                return new CollageResult(response.data);
                            });
                        }

                        return fetchThumbs(minireel)
                            .then(generateCollage);
                    };
                }

                return new CollateralService();
            }];
        }])

        .service('FileService', ['$window','$q','$rootScope',
        function                ( $window , $q , $rootScope ) {
            var FormData = $window.FormData,
                XMLHttpRequest = $window.XMLHttpRequest;

            this.openBlob = function(url) {
                var deferred = $q.defer(),
                    xhr = new XMLHttpRequest();

                xhr.open('GET', url, true);

                xhr.responseType = 'blob';

                xhr.onload = function() {
                    if (this.status === 200) {
                        var blob = this.response;

                        $rootScope.$apply(function() {
                            deferred.resolve(blob);
                        });
                    }
                };

                xhr.onerror = function(e) {
                    $rootScope.$apply(function() {
                        deferred.reject('Error ' + e.target.status + ' occurred while receiving the document.');
                    });
                };

                xhr.send();

                return deferred.promise;
            };

            this.uploadBlob = function(url, blob) {
                var deferred = $q.defer(),
                    data = new FormData(),
                    xhr = new XMLHttpRequest();

                data.append('image1',blob,'splash');

                xhr.open('POST', url, true);

                xhr.onload = function () {
                    $rootScope.$apply(function() {
                        var data;

                        try {
                            data = fromJson(xhr.response);
                        } catch(e) {
                            data = xhr.response;
                        }

                        deferred.resolve({
                            data: data,
                            status: xhr.status,
                            statusText: xhr.statusText
                        });
                    });
                };

                xhr.onerror = function(e) {
                    $rootScope.$apply(function() {
                        var data;

                        try {
                            data = fromJson(xhr.response);
                        } catch(e) {
                            data = xhr.response;
                        }

                        deferred.reject('Error '+ e.target.status+ ' occured while uploading blob');
                    });
                };

                xhr.send(data);

                return deferred.promise;
            };
        }]);
});