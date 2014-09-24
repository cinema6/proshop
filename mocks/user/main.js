module.exports = function(http) {
    'use strict';

    var path = require('path'),
        grunt = require('grunt');

    var fn = require('../utils/fn'),
        db = require('../utils/db'),
        idFromPath = db.idFromPath,
        extend = fn.extend;

    function userPath(id) {
        return path.resolve(__dirname, './users/' + id + '.json');
    }

    http.whenPOST('/api/account/user/email', function(request) {
        if (request.body.newEmail !== 'howard@cinema6.com') {
            this.respond(404, 'You are not howard!');
        } else {
            this.respond(200, 'Congratulations, you are howard');
        }
    });

    http.whenPOST('/api/account/user/password', function(request) {
        if (request.body.newPassword === 'failfail') {
            this.respond(404, 'Failed to change password');
        } else {
            this.respond(200, 'Congratulations, you have a new password');
        }
    });

    http.whenPUT('/api/account/user/**', function(request) {
        var id = idFromPath(request.pathname),
            filePath = userPath(id),
            userCache = require('../auth/user_cache'),
            currentUser = grunt.file.readJSON(filePath),
            newUser = extend(currentUser, request.body, {
                lastUpdated: (new Date()).toISOString()
            });

        if (id === 'e2e-12224') {
            this.respond(401, 'Not Authorized');
        } else {
            grunt.file.write(filePath, JSON.stringify(newUser, null, '    '));

            this.respond(200, (userCache.user = extend(newUser, { id: id })));
        }
    });

    http.whenPOST('/api/account/user', function(request) {
        var id = 'u-' + Math.floor(Math.random() * 10000) + 1,
            filePath = userPath(id),
            userCache = require('../auth/user_cache'),
            user = userCache.user,
            currentTime = (new Date()).toISOString(),
            data = request.body,
            newUser = extend(request.body, {
                id: id,
                created: currentTime,
                lastUpdated: currentTime
            });

        grunt.file.write(filePath, JSON.stringify(newUser, null, '    '));

        this.respond(201, extend(newUser, { id: id }));
    });

    http.whenDELETE('/api/account/user/**', function(request) {
        grunt.file.delete(userPath(idFromPath(request.pathname)));

        this.respond(204, '');
    })

    http.whenGET('/api/account/user/**', function(request) {
        var id = idFromPath(request.pathname),
            filePath = userPath(id);

        return this.respond(404, 'not found');

        try {
            this.respond(200, extend(grunt.file.readJSON(filePath), { id: id }));
        } catch(e) {
            this.respond(401, 'Not Authorized');
        }
    });

    http.whenGET('/api/account/users', function(request) {
        var id = request.query.org,
            allUsers = grunt.file.expand(path.resolve(__dirname, './users/*.json'))
                .map(function(path) {
                    return grunt.file.readJSON(path);
                })
                .filter(function(user) {
                    return id ? id === user.org : true;
                });

        this.respond(200, allUsers);
    });
};
