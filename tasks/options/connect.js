(function() {
    'use strict';

    var grunt        = require('grunt');

    module.exports = {
        options: {
            port: '<%= settings.connectPort %>',
            hostname: '*',
            protocol: 'https'
        },
        proxies: [
            {
                context: '/api',
                host: 'platform-staging.reelcontent.com',
                port: 443,
                https: true,
                protocol: 'https:',
                changeOrigin: true,
                headers: {
                    origin : 'https://platform-staging.reelcontent.com',
                    host: 'platform-staging.reelcontent.com'
                }
            },
            {
                context: '/collateral',
                host: 'platform-staging.reelcontent.com',
                port: 443,
                https: true,
                protocol: 'https:',
                changeOrigin: true,
                headers: {
                    origin : 'https://platform-staging.reelcontent.com',
                    host: 'platform-staging.reelcontent.com'
                }
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
                            '/api/account/advertiser': 'mocks/advertiser/main.js',
                            '/api/account/advertisers': 'mocks/advertiser/main.js',
                            '/api/account/customer': 'mocks/customer/main.js',
                            '/api/account/customers': 'mocks/customer/main.js',
                            '/api/account/policies': 'mocks/policy/main.js',
                            '/api/account/roles': 'mocks/role/main.js',
                            '/api/content/experience': 'mocks/content/main.js',
                            '/api/content/experiences': 'mocks/content/main.js',
                            '/api/content/category': 'mocks/category/main.js',
                            '/api/content/categories': 'mocks/category/main.js',
                            '/api/site': 'mocks/site/main.js',
                            '/api/sites': 'mocks/site/main.js',
                            '/api/minireelGroup': 'mocks/group/main.js',
                            '/api/minireelGroups': 'mocks/group/main.js',
                            '/api/collateral': 'mocks/collateral/main.js',
                            '/collateral/experiences': 'mocks/collateral/main.js'
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
