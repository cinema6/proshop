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
