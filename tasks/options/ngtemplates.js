(function() {
    'use strict';

    var grunt = require('grunt');

    module.exports = {
        options: {
            htmlmin: {
                collapseBooleanAttributes: true,
                collapseWhitespace: true,
                removeAttributeQuotes: true,
                removeComments: true,
                removeEmptyAttributes: true,
                removeRedundantAttributes: true,
                removeScriptTypeAttributes: true,
                removeStyleLinkTypeAttributes: true
            },
            module: '<%= settings.appModule %>',
        },
        test: {
            options: {
                prefix: ''
            },
            cwd: '<%= settings.appDir %>',
            src: 'assets/views/**/*.html',
            dest: '.tmp/templates.js'
        }
    };
}());