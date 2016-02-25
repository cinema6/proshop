(function($window){
    /* jshint camelcase:false */
    'use strict';

    var tests = Object.keys($window.__karma__.files).filter(function(file){
            return (/\.(ut|it)\.js$/).test(file);
        }),
        packageRequest = new XMLHttpRequest(),
        c6 = $window.c6 = {};

    packageRequest.open('GET', '/base/settings.json');
    packageRequest.send();

    $window.ga = function() {};

    c6.kLocal = true;
    c6.kDebug = true;
    c6.kApi   = '/api';
    c6.kLogLevels = ['error','warn','log','info'];
//    c6.kModDeps = ['ngRoute','c6.ui', 'c6.log'];

    packageRequest.onload = function(event) {
        var settings = JSON.parse(event.target.response),
            appDir = settings.appDir;

        if (appDir.indexOf('<%') > -1) {
            $window.console.warn('PhantomJS can\'t interpolate Grunt templates. Using default.');
            appDir = 'app';
        }

        $window.requirejs({
            baseUrl: '/base/' + appDir + '/assets/scripts',

            paths: {
                jquery: 'http://lib.reelcontent.com/jquery/2.0.3-0-gf576d00/jquery.min',
                modernizr: 'http://lib.reelcontent.com/modernizr/modernizr.custom.71747',
                angular: 'http://lib.reelcontent.com/angular/v1.2.22-0-g93b0c2d/angular',
                ngAnimate: 'http://lib.reelcontent.com/angular/v1.2.22-0-g93b0c2d/angular-animate',
                ngRoute: 'http://lib.reelcontent.com/angular/v1.2.22-0-g93b0c2d/angular-route',
                ngMock: 'http://lib.reelcontent.com/angular/v1.2.22-0-g93b0c2d/angular-mocks',
                ace: 'lib/ace',
                ngAce: 'lib/ui-ace.min',
                c6ui: 'http://lib.reelcontent.com/c6ui/v2.6.4-0-g0df471c/c6uilib.min',
                c6log: 'http://lib.reelcontent.com/c6ui/v2.6.4-0-g0df471c/c6log.min',
                templates: '/base/.tmp/templates'
            },
            shim: {
                modernizr: {
                    exports: 'Modernizr'
                },
                angular: {
                    deps: ['jquery'],
                    exports: 'angular'
                },
                ngRoute: {
                    deps: ['angular'],
                    init: function(angular) {
                        return angular.module('ngRoute');
                    }
                },
                ngMock: {
                    deps: ['angular'],
                    init: function(angular) {
                        return angular.module('ngMock');
                    }
                },
                ngAnimate: {
                    deps: ['angular'],
                    init: function(angular) {
                        return angular.module('ngAnimate');
                    }
                },
                ngAce: {
                    deps: ['angular','ace']
                },
                c6ui: {
                    deps: ['angular'],
                    init: function(angular) {
                        return angular.module('c6.ui');
                    }
                },
                c6log: {
                    deps: ['angular','c6defines'],
                    init: function(angular) {
                        return angular.module('c6.log');
                    }
                }
            }
        });

        require(['c6defines','ngMock'],function(c6Defines) {
            c6Defines.kHasKarma = true;
            require(tests, $window.__karma__.start);
        });
    };
}(window));
