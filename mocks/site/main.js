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
};