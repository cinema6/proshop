module.exports = function(http) {
    'use strict';

    var path = require('path'),
        grunt = require('grunt');

    var fn = require('../utils/fn'),
        db = require('../utils/db'),
        idFromPath = db.idFromPath,
        extend = fn.extend;

    function sitePath(id) {
        return path.resolve(__dirname, './sites/' + id + '.json');
    }

    http.whenGET('/api/sites', function(request) {
        var allSites = grunt.file.expand(path.resolve(__dirname, './sites/*.json'))
            .map(function(path) {
                return grunt.file.readJSON(path);
            });

        this.respond(200, allSites);
    });

    http.whenGET('/api/site/**', function(request) {
        var id = idFromPath(request.pathname),
            filePath = sitePath(id);

        try {
            this.respond(200, extend(grunt.file.readJSON(filePath), { id: id }));
        } catch(e) {
            this.respond(401, 'Not Authorized');
        }
    });

    http.whenPOST('/api/site', function(request) {
        var id = 'u-' + Math.floor(Math.random() * 10000) + 1,
            filePath = sitePath(id),
            currentTime = (new Date()).toISOString(),
            data = request.body,
            newSite = extend(request.body, {
                id: id,
                created: currentTime,
                lastUpdated: currentTime
            });

        grunt.file.write(filePath, JSON.stringify(newSite, null, '    '));

        this.respond(201, newSite);
    });

    http.whenPUT('/api/site/**', function(request) {
        var id = idFromPath(request.pathname),
            filePath = sitePath(id),
            currentSite = grunt.file.readJSON(filePath),
            newSite = extend(currentSite, request.body, {
                lastUpdated: (new Date()).toISOString()
            });

        if (id === 's-113') {
            this.respond(401, 'Not Authorized');
        } else {
            grunt.file.write(filePath, JSON.stringify(newSite, null, '    '));

            this.respond(200, newSite);
        }
    });

    http.whenDELETE('/api/site/**', function(request) {
        grunt.file.delete(sitePath(idFromPath(request.pathname)));

        this.respond(204, '');
    })
};