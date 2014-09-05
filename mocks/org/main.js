module.exports = function(http) {
    'use strict';

    var grunt = require('grunt'),
        path = require('path');

    var fn = require('../utils/fn'),
        db = require('../utils/db'),
        idFromPath = db.idFromPath,
        extend = fn.extend;

    function orgPath(id) {
        return path.resolve(__dirname, './orgs/' + id + '.json');
    }

    function genId() {
        return 'o-' + Math.floor(Math.random() * 10000) + 1;
    }

    http.whenGET('/api/account/org/**', function(request) {
        var id = idFromPath(request.pathname),
            org = grunt.file.readJSON(path.resolve(__dirname, './orgs/' + id + '.json'));

        org.id = id;

        if (org) {
            this.respond(200, org);
        } else {
            this.respond(404, 'Could not find org!');
        }
    });

    http.whenPOST('/api/account/org', function(request) {
        var id = genId(),
            currentTime = (new Date()).toISOString(),
            org = extend(request.body, {
                created: currentTime,
                lastUpdated: currentTime
            });

        grunt.file.write(orgPath(id), JSON.stringify(org, null, '    '));

        this.respond(201, extend(org, { id: id }));
    });

    http.whenPUT('/api/account/org/**', function(request) {
        var filePath = orgPath(idFromPath(request.pathname)),
            current = grunt.file.readJSON(filePath),
            newOrg = extend(current, request.body, {
                lastUpdated: (new Date()).toISOString()
            });

        if (idFromPath(request.pathname) === 'e2e-12224') {
            this.respond(403, 'Bad for some reason');
        } else {
            grunt.file.write(filePath, JSON.stringify(newOrg, null, '    '));

            this.respond(200, newOrg);
        }
    });

    http.whenDELETE('/api/account/org/**', function(request) {
        grunt.file.delete(orgPath(idFromPath(request.pathname)));

        this.respond(204, '');
    });

    http.whenGET('/api/account/orgs', function(request) {
        var allOrgs = grunt.file.expand(path.resolve(__dirname, './orgs/*.json'))
            .map(function(path) {
                return grunt.file.readJSON(path);
            });

        this.respond(200, allOrgs);
    });
};
