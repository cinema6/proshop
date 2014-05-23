(function() {
    /* jshint camelcase:false */
    'use strict';

    module.exports = {
        options: {
            envs: {
                local: {
                    config: {}
                },
                browserstack: {
                    config: {
                        seleniumAddress: 'http://hub.browserstack.com/wd/hub',
                        capabilities: {
                            'browserstack.debug': true,
                            'browserstack.user': '<%= settings.browserstack.user %>',
                            'browserstack.key': '<%= settings.browserstack.key %>',
                            'browserstack.tunnel': true
                        }
                    }
                }
            },
            config: {
                seleniumArgs: ['-browserTimeout=60'],
                jasmineNodeOpts: {
                    defaultTimeoutInterval: 45000
                },
                capabilities: {
                    name: '<%= package.name %>',
                },
                specs: [
                    'test/e2e/setup.js',
                    'test/e2e/common/**/*.e2e.js'
                ]
            },
        },
        chrome: {
            config: {
                specs: ['test/e2e/chrome/**/*.e2e.js'],
                capabilities: {
                    browserName: 'chrome',
                    browser: 'Chrome',
                    browser_version: '31.0',
                    os: 'Windows',
                    os_version: '7'
                }
            }
        }
    };
})();