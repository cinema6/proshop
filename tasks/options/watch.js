(function() {
    'use strict';

    module.exports = {
        options: {
            livereload: true
        },
        html: {
            files: [
                '<%= settings.appDir %>/*.html',
                '<%= settings.appDir %>/assets/views/**/*.html'
            ],
            tasks: []
        },
        style: {
            files: [
                '<%= settings.appDir %>/assets/styles/**/*.css',
                '<%= settings.appDir %>/assets/img/**/*.{png,jpg,jpeg,gif,webp,svg}'
            ],
            tasks: []
        },
        unit: {
            files: [
                '<%= settings.appDir %>/assets/scripts/**/*.js',
                '<%= settings.appDir %>/assets/views/**/*.html',
                'test/spec/**/*.js'
            ],
            tasks: ['ngtemplates:test', 'karma:debug:run', 'jshint']
        }
    };
})();
