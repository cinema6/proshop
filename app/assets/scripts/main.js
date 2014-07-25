(function(){
    /*jshint -W080 */
    'use strict';

    require.config({
        baseUrl: 'scripts',
        paths: {
            jquery: 'https://lib.cinema6.com/jquery/2.0.3-0-gf576d00/jquery.min',
            modernizr: 'https://lib.cinema6.com/modernizr/modernizr.custom.71747',
            angular: 'https://lib.cinema6.com/angular/v1.2.14-0-g729fb13/angular.min',
            ngRoute: 'https://lib.cinema6.com/angular/v1.2.14-0-g729fb13/angular-route.min',
            ngAnimate: 'https://lib.cinema6.com/angular/v1.2.14-0-g729fb13/angular-animate.min',
            c6ui: 'https://lib.cinema6.com/c6ui/v2.6.4-0-g0df471c/c6uilib.min',
            c6log: 'https://lib.cinema6.com/c6ui/v2.6.4-0-g0df471c/c6log.min'
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
            ngAnimate: {
                deps: ['angular'],
                init: function(angular) {
                    return angular.module('ngAnimate');
                }
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

    define( ['angular','app'],
    function( angular , app ) {
        angular.bootstrap(document.documentElement, [app.name]);

        return true;
    });

}());
