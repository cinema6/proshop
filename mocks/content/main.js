module.exports = function(http) {
    'use strict';

    var grunt = require('grunt'),
        path = require('path');

    var fn = require('../utils/fn'),
        db = require('../utils/db'),
        idFromPath = db.idFromPath,
        extend = fn.extend;

    function experiencePath(id) {
        return path.resolve(__dirname, './experiences/' + id + '.json');
    }

    function genId() {
        return 'e-' + Math.floor(Math.random() * 10000) + 1;
    }

    http.whenGET('/api/content/experiences', function(request) {
        // var id = idFromPath(request.pathname),
        //     org = grunt.file.readJSON(path.resolve(__dirname, './orgs/' + id + '.json'));

        // org.id = id;

        var exp = grunt.file.readJSON(path.resolve(__dirname, './experiences/experiences.json'));

        this.respond(200, exp);
    });

    http.whenPOST('/api/content/experience', function(request) {
        var id = genId(),
            currentTime = (new Date()).toISOString(),
            exp = extend(request.body, {
                id: id,
                created: currentTime,
                lastUpdated: currentTime
            });


        switch (request.body.data.branding) {
        case 'post_fail':
            this.respond(404, 'Failed to post experience copy');
            break;
        case 'put_fail':
            this.respond(200, grunt.file.readJSON(path.resolve(__dirname, './experiences/put-fail-experience.json')));
            break;
        case 'generated_fail':
            this.respond(200, grunt.file.readJSON(path.resolve(__dirname, './experiences/generated-fail-experience.json')));
            break;
        default:
            grunt.file.write(experiencePath(id), JSON.stringify(exp, null, '    '));

            this.respond(201, exp);
        }
    });

    http.whenPUT('/api/content/experience/**', function(request) {
        var filePath = experiencePath(idFromPath(request.pathname)),
            current = grunt.file.readJSON(filePath),
            newExperience = extend(current, request.body, {
                lastUpdated: (new Date()).toISOString()
            });

        if (idFromPath(request.pathname) === 'e-put-fail') {
            this.respond(403, 'Bad for some reason');
        } else {
            grunt.file.write(filePath, JSON.stringify(newExperience, null, '    '));

            this.respond(200, newExperience);
        }
    });
};
