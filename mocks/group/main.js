module.exports = function(http) {
    'use strict';

    var path = require('path'),
        grunt = require('grunt');

    var fn = require('../utils/fn'),
        db = require('../utils/db'),
        idFromPath = db.idFromPath,
        extend = fn.extend;

    function groupPath(id) {
        return path.resolve(__dirname, './groups/' + id + '.json');
    }

    http.whenGET('/api/minireelGroups', function(request) {
        var allGroups = grunt.file.expand(path.resolve(__dirname, './groups/*.json'))
                .map(function(path) {
                    return grunt.file.readJSON(path);
                });

        this.respond(200, allGroups);
    });

    http.whenGET('/api/minireelGroup/**', function(request) {
        var id = idFromPath(request.pathname),
            filePath = groupPath(id);

        try {
            this.respond(200, grunt.file.readJSON(filePath));
        } catch(e) {
            this.respond(401, 'Not Authorized');
        }
    });

    http.whenPOST('/api/minireelGroup', function(request) {
        var id = 'g-' + Math.floor(Math.random() * 10000) + 1,
            filePath = groupPath(id),
            currentTime = (new Date()).toISOString(),
            data = request.body,
            newGroup = extend(data, {
                id: id,
                created: currentTime,
                lastUpdated: currentTime
            });

        grunt.file.write(filePath, JSON.stringify(newGroup, null, '   '));

        this.respond(201, newGroup);
    });

    http.whenPUT('/api/minireelGroup/**', function(request) {
        var id = idFromPath(request.pathname),
            filePath = groupPath(id),
            currentGroup = grunt.file.readJSON(filePath),
            updatedGroup = extend(currentGroup, request.body, {
                lastUpdated: (new Date()).toISOString()
            });

        if (id === 'g-113') {
            this.respond(401, 'Not Authorized');
        } else {
            grunt.file.write(filePath, JSON.stringify(updatedGroup, null, '   '));

            this.respond(200, updatedGroup);
        }
    });

    http.whenDELETE('/api/minireelGroup/**', function(request) {
        grunt.file.delete(groupPath(idFromPath(request.pathname)));

        this.respond(204, '');
    });
};