module.exports = function(http) {
    'use strict';

    var path = require('path'),
        grunt = require('grunt');

    var fn = require('../utils/fn'),
        db = require('../utils/db'),
        idFromPath = db.idFromPath,
        extend = fn.extend,
        pluck = fn.pluck,
        pluckExcept = fn.pluckExcept,
        withDefaults = fn.withDefaults,
        mapObject = fn.mapObject;

    function userPath(id) {
        return path.resolve(__dirname, './users/' + id + '.json');
    }

    function contains(haystack, needle) {
        var ids = haystack.split(',');

        if (!needle) { return false; }

        return ids.some(function(id) {
            return id === needle || needle.indexOf(id) > -1;
        });
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
            currentUser = grunt.file.readJSON(filePath),
            newUser = extend(currentUser, request.body, {
                lastUpdated: (new Date()).toISOString()
            });

        if (id === 'u-114') {
            this.respond(401, 'Not Authorized');
        } else {
            grunt.file.write(filePath, JSON.stringify(newUser, null, '    '));

            this.respond(200, extend(newUser, { id: id }));
        }
    });

    http.whenPOST('/api/account/user', function(request) {
        var id = 'u-' + Math.floor(Math.random() * 10000) + 1,
            filePath = userPath(id),
            currentTime = (new Date()).toISOString(),
            data = request.body,
            newUser = extend(request.body, {
                created: currentTime,
                lastUpdated: currentTime
            });

        grunt.file.write(filePath, JSON.stringify(newUser, null, '    '));

        this.respond(201, extend(newUser, { id: id }));
    });

    http.whenPOST('/api/account/user/logout/**', function(request) {
        var id = idFromPath(request.pathname),
            filePath = userPath(id);

        try {
            this.respond(200, extend(grunt.file.readJSON(filePath), { id: id }));
        } catch(e) {
            this.respond(401, 'Not Authorized');
        }
    });

    http.whenDELETE('/api/account/user/**', function(request) {
        grunt.file.delete(userPath(idFromPath(request.pathname)));

        this.respond(204, '');
    });

    http.whenGET('/api/account/user/**', function(request) {
        var id = idFromPath(request.pathname),
            filePath = userPath(id);

        try {
            this.respond(200, extend(grunt.file.readJSON(filePath), { id: id }));
        } catch(e) {
            this.respond(401, 'Not Authorized');
        }
    });

    http.whenGET('/api/account/users', function(request) {
        var filters = pluckExcept(request.query, ['sort', 'limit', 'skip']),
            page = withDefaults(mapObject(pluck(request.query, ['limit', 'skip']), parseFloat), {
                limit: Infinity,
                skip: 0
            }),
            sort = (request.query.sort || null) && request.query.sort.split(','),
            allUsers = grunt.file.expand(path.resolve(__dirname, './users/*.json'))
                .map(function(path) {
                    var id = path.match(/[^\/]+(?=\.json)/)[0];

                    return extend(grunt.file.readJSON(path), { id: id });
                })
                .filter(function(user) {
                    return Object.keys(filters)
                        .every(function(key) {
                            switch (key) {
                                case 'ids':
                                    return contains(filters[key], user.id);
                                    break;
                                case 'orgs':
                                    return contains(filters[key], user.org);
                                    break;
                                default:
                                    return filters[key] === user[key];
                                    break;
                            }
                        });
                }),
            users = allUsers
                .filter(function(user, index) {
                    var startIndex = page.skip,
                        endIndex = startIndex + page.limit;

                    return index >= startIndex && index <= endIndex;
                })
                .sort(function(a, b) {
                    var prop = sort && sort[0],
                        directionInt = parseInt(sort && sort[1]),
                        isDate = ['lastUpdated', 'created', 'lastPublished'].indexOf(prop) > -1,
                        aProp, bProp;

                    if (!sort) {
                        return 0;
                    }

                    aProp = isDate ? new Date(a[prop]) : a[prop];
                    bProp = isDate ? new Date(b[prop]) : b[prop];

                    if (aProp < bProp) {
                        return directionInt * -1;
                    } else if (bProp < aProp) {
                        return directionInt;
                    }

                    return 0;
                }),
            startPosition = page.skip + 1,
            endPosition = page.skip + Math.min(page.limit, users.length);

        this.respond(200, users)
            .setHeaders({
                'Content-Range': startPosition + '-' + endPosition + '/' + allUsers.length
            });
    });
};
