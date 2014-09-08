(function() {
    'use strict';

    var grunt        = require('grunt');

    module.exports = {
        options: {
            port: '<%= settings.connectPort %>',
            hostname: '*'
        },
        proxies: [
            {
                context: '/api',
                host: 'staging.cinema6.com',
                port: 443,
                https: true,
                changeOrigin: true
            },
            {
                context: '/collateral',
                host: 'staging.cinema6.com',
                port: 443,
                https: true,
                changeOrigin: true
            }
        ],
        dev: {
            options: {
                middleware: function(connect,options) {
                    return [
                        require('http-mock')({
                            '/api/auth': 'mocks/auth/main.js',
                            '/api/account/user': 'mocks/user/main.js',
                            '/api/account/users': 'mocks/user/main.js',
                            '/api/account/org': 'mocks/org/main.js',
                            '/api/account/orgs': 'mocks/org/main.js',
                            '/api/content/experience': 'mocks/content/main.js',
                            '/api/content/experiences': 'mocks/content/main.js',
                            '/api/collateral/splash': 'mocks/collateral/main.js'
                        }),
                        require('grunt-connect-proxy/lib/utils').proxyRequest,
                        require('connect-livereload')({
                            rules : [
                                {
                                    match: /<!--C6INJECT-->/,
                                    fn: function(match,snippet){
                                        return [
                                            snippet,
                                            '<script>',
                                            '(' + function(window) {
                                                window.DEBUG = true;
                                                window.LOCAL = true;
                                            }.toString() + '(window))',
                                            '</script>'
                                        ].join('\n');
                                    }
                                }
                            ]
                        }),
                        connect.static(grunt.config.get('settings.appDir'))
                    ];
                }
            }
        }
    };
})();
