(function(){
    /*jshint -W080 */
    'use strict';

    var c6 = window.c6;

    c6.kApiUrl   = '/api';   // rest api
    c6.kEnv      = 'production';
    c6.kDebug    = false;

    if ((window.location.host === 'portal.cinema6.com') ||
        (window.location.host === 'cinema6.com')) {
        // This is production
    } else
    if (window.location.host === 'staging.cinema6.com')  {
        c6.kEnv   = 'staging';
        c6.kDebug = true; // Keep logging turned on
    } else {
        c6.kEnv   = 'dev';
        c6.kDebug = true;
    }
    c6.kLogFormats = c6.kDebug;
    c6.kLogLevels  = c6.kDebug ? ['error','warn','log','info'] : [];
    c6.kModDeps    = ['ngAnimate','ngRoute','c6.ui', 'c6.log'];

    require.config({
        baseUrl:  c6.kBaseUrl
    });

    var libUrl = function(url) {
            return '//lib.cinema6.com/' + url;
        },
        appScripts = (function() {
            if (c6.kIsBuild) {
                return [
                    'scripts/c6app.min'
                ];
            } else {
                return [
                    'scripts/app',
                    'scripts/auth',
                    'scripts/account',
                    'scripts/login',
                    'scripts/orgs',
                    'scripts/mockHttp',
                    'scripts/mockHttpDefs'
                ];
            }
        }()),
        libScripts = (function() {
            if (c6.kIsBuild) {
                return [
                    libUrl('modernizr/modernizr.custom.71747.js'),
                    libUrl('jquery/2.0.3-0-gf576d00/jquery.min.js'),
                    libUrl('angular/v1.2.12-0-g5cc5cc1/angular.min.js'),
                    libUrl('angular/v1.2.12-0-g5cc5cc1/angular-route.min.js'),
                    libUrl('angular/v1.2.12-0-g5cc5cc1/angular-animate.min.js'),
                    libUrl('c6ui/v2.4.0-0-gb74a3dd/c6uilib.min.js'),
                    libUrl('c6ui/v2.4.0-0-gb74a3dd/c6log.min.js')
                ];
            } else {
                return [
                    libUrl('modernizr/modernizr.custom.71747.js'),
                    libUrl('jquery/2.0.3-0-gf576d00/jquery.js'),
                    libUrl('angular/v1.2.12-0-g5cc5cc1/angular.js'),
                    libUrl('angular/v1.2.12-0-g5cc5cc1/angular-route.js'),
                    libUrl('angular/v1.2.12-0-g5cc5cc1/angular-animate.js'),
                    libUrl('c6ui/v2.4.0-0-gb74a3dd/c6uilib.js'),
                    libUrl('c6ui/v2.4.0-0-gb74a3dd/c6log.js')
                ];
            }
        }());

    function loadScriptsInOrder(scriptsList, done) {
        var script;

        if (scriptsList) {
            script = scriptsList.shift();

            if (script) {
                require([script], function() {
                    loadScriptsInOrder(scriptsList, done);
                });
                return;
            }
        }
        done();
    }

    loadScriptsInOrder(libScripts, function() {
        var Modernizr = window.Modernizr;

        Modernizr.load({
            test: Modernizr.touch,
            yep: [
                c6.kIsBuild ?
                    libUrl('angular/v1.2.12-0-g5cc5cc1/angular-touch.min.js') :
                    libUrl('angular/v1.2.12-0-g5cc5cc1/angular-touch.js')
            ],
            //nope: [ ],
            complete: function() {
                if (Modernizr.touch) { c6.kModDeps.push('ngTouch'); }

                loadScriptsInOrder(appScripts, function() {
                    angular.bootstrap(document.documentElement, ['c6.proshop']);
                });
            }
        });
    });
}());