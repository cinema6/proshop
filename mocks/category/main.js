module.export = function(http) {
    'use strict';

    var path = require('path'),
        grunt = require('grunt');

    var fn = require('../utils/fn'),
        db = require('../utils/db'),
        idFromPath = db.idFromPath,
        extend = fn.extend;

    function categoryPath(id) {
        return path.resolve(__dirname, './categories/' + id + '.json');
    }

    http.whenGET('/api/categories', function(request) {
        var allCats = grunt.file.expand(path.resolve(__dirname, './categories/*.json'))
            .map(function(path) {
                return grunt.file.readJSON(path);
            });

        this.respond(200, allCats);
    });

    http.whenGET('/api/category/**', function(request) {
        var id = idFromPath(request.pathname),
            filePath = categoryPath(id);

        try {
            this.respond(200, grunt.file.readJSON(filePath));
        } catch(e) {
            this.respond(401, 'Not Authorized');
        }
    });

    http.whenPOST('/api/category', function(request) {
        var id = 'c-' + Math.floor(Math.random() * 10000) + 1,
            filePath = categoryPath(id),
            currentTime = (new Date()).toISOString(),
            data = request.body,
            newCat = extend(data, {
                id: id,
                created: currentTime,
                lastUpdated: currentTime
            });

        grunt.file.write(filePath, JSON.stringify(newCat, null, '   '));

        this.respond(201, newCat);
    });

    http.whenPUT('/api/category/**', function(request) {
        var id = idFromPath(request.pathname),
            filePath = categoryPath(id),
            currentCat = grunt.file.readJSON(filePath),
            updatedCat = extend(currentCat, request.body, {
                lastUpdated: (new Date()).toISOString()
            });

        if (id === 'c-113') {
            this.respond(401, 'Not Authorized');
        } else {
            grunt.file.write(filePath, JSON.stringify(updatedCat, null, '   '));

            this.respond(200, updatedCat);
        }
    });

    http.whenDELETE('/api/category/**', function(request) {
        grunt.file.delete(categoryPath(idFromPath(request.pathname)));

        this.respond(204, '');
    });
};