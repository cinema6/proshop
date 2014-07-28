module.exports = {
    dist: {
        src: ['<%= settings.distDir %>/index.html'],
        dest: '<%= settings.distDir %>/index.html',
        replacements: [
            {
                from: /<base href="(.+?)"\/?>/,
                to: function(match, index, text, matches) {
                    var grunt = require('grunt');

                    return match.replace(matches[0], '/' + grunt.config('_version') + '/');
                }
            }
        ]
    },
    api: {
        src:  ['<%= _versionDir %>/scripts/main.js'],
        dest: ['<%= _versionDir %>/scripts/main.js'],
        replacements: [
            {
                from: /kApiUrl="\/api"/,
                to: function(match, index, text, matches) {
                    var grunt = require('grunt'),
                        target = grunt.option('target');
                    return  'kApiUrl="//' + target + '/api"';
                }
            }
        ]
    }
};
