module.exports = function(http) {
    'use strict';

    var path = require('path'),
        grunt = require('grunt');

    var fn = require('../utils/fn'),
        db = require('../utils/db'),
        idFromPath = db.idFromPath,
        extend = fn.extend;

    function advertiserPath(id) {
        return path.resolve(__dirname, './advertisers/' + id + '.json');
    }

    http.whenGET('/api/account/advertisers', function(request) {
        var allAdvertisers = grunt.file.expand(path.resolve(__dirname, './advertisers/*.json'))
            .map(function(path) {
                return grunt.file.readJSON(path);
            });

        this.respond(200, allAdvertisers);
    });

    http.whenGET('/api/account/advertiser/**', function(request) {
        var id = idFromPath(request.pathname),
            filePath = advertiserPath(id);

        try {
            this.respond(200, grunt.file.readJSON(filePath));
        } catch(e) {
            this.respond(401, 'Not Authorized');
        }
    });

    http.whenPOST('/api/account/advertiser', function(request) {
        var id = 'a-' + Math.floor(Math.random() * 10000) + 1,
            filePath = advertiserPath(id),
            currentTime = (new Date()).toISOString(),
            data = request.body,
            newAdvertiser = extend(data, {
                id: id,
                created: currentTime,
                lastUpdated: currentTime
            });

        grunt.file.write(filePath, JSON.stringify(newAdvertiser, null, '   '));

        this.respond(201, newAdvertiser);
    });

    http.whenPUT('/api/account/advertiser/**', function(request) {
        var id = idFromPath(request.pathname),
            filePath = advertiserPath(id),
            currentAdvertiser = grunt.file.readJSON(filePath),
            updatedAdvertiser = extend(currentAdvertiser, request.body, {
                lastUpdated: (new Date()).toISOString()
            });

        if (id === 'a-113') {
            this.respond(401, 'Not Authorized');
        } else {
            grunt.file.write(filePath, JSON.stringify(updatedAdvertiser, null, '   '));

            this.respond(200, updatedAdvertiser);
        }
    });

    http.whenDELETE('/api/account/advertiser/**', function(request) {
        grunt.file.delete(advertiserPath(idFromPath(request.pathname)));

        this.respond(204, '');
    });
};