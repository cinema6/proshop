module.exports = function(grunt) {
    'use strict';

    var path = require('path'),
        _ =require('underscore');

    var settings = grunt.file.readJSON('settings.json'),
        c6Settings = (function(settings) {
            function loadGlobalConfig(relPath) {
                var configPath = path.join(process.env.HOME, relPath),
                    configExists = grunt.file.exists(configPath);

                return configExists ? grunt.file.readJSON(configPath) : {};
            }

            _.extend(this, settings);

            this.openBrowser = process.env.GRUNT_BROWSER;

            this.saucelabs = loadGlobalConfig(settings.saucelabsJSON);
            this.browserstack = loadGlobalConfig(settings.browserstackJSON);
            this.aws = loadGlobalConfig(settings.awsJSON);

            return this;
        }.call({}, settings));

    require('load-grunt-config')(grunt, {
        configPath: path.join(__dirname, 'tasks/options'),
        config: {
            settings: c6Settings
        }
    });

    grunt.loadTasks('tasks');

    /*********************************************************************************************
     *
     * SERVER TASKS
     *
     *********************************************************************************************/

    grunt.registerTask('server', 'start a development server', [
        'configureProxies:dev',
        'connect:dev',
        'open:server',
        'ngtemplates:test',
        'karma:debug',
        'watch'
    ]);

    /*********************************************************************************************
     *
     * TEST TASKS
     *
     *********************************************************************************************/

    grunt.registerTask('test:unit', 'run unit tests', [
        'jshint:all',
        'clean:build',
        'ngtemplates:test',
        'karma:unit'
    ]);

    grunt.registerTask('test:unit:debug', 'run unit tests whenever files change', [
        'jshint:all',
        'clean:build',
        'ngtemplates:test',
        'karma:debug',
        'watch:unit'
    ]);

    grunt.registerTask('test:e2e', 'run e2e tests on specified browser', [
        'connect:dev',
        'updatewebdriver',
        'protractor:chrome:local'
    ]);

    /*********************************************************************************************
     *
     * BUILD TASKS
     *
     *********************************************************************************************/
    grunt.registerTask('build', 'build app into distDir', function(){
        if (!grunt.option('skip-tests')){
            grunt.task.run('test:unit');
        }
        if (grunt.option('any')){
            grunt.task.run('git_describe_tags:any');
        } else {
            grunt.task.run('git_describe_tags');
        }
        grunt.task.run('clean:build');
        grunt.task.run('copy:dist');
        grunt.task.run('ngtemplates:dist');
        grunt.task.run('htmlmin:dist');
        grunt.task.run('requirejs:dist');
        grunt.task.run('replace:dist');
    });

    /*********************************************************************************************
     *
     * UPLOAD TASKS
     *
     *********************************************************************************************/

    grunt.registerTask('publish', 'build and upload the application to s3', function(target) {
        grunt.task.run('build');
        grunt.task.run('s3:' + target);
    });

//    grunt.registerTask('build', 'build app into distDir', [
//        'test:unit',
//        'git_describe_tags:any',
//        'clean:build',
//        'copy:dist',
//        'ngtemplates:dist',
//        'htmlmin:dist',
//        'requirejs:dist',
//        'replace:dist'
//    ]);

};
