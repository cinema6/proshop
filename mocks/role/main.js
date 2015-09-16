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
        mapObject = fn.mapObject;;

    function getPath(id) {
        return path.resolve(__dirname, './roles/' + id + '.json');
    }

    function contains(haystack, needle) {
        var ids = haystack.split(',');

        if (!needle) { return false; }

        return ids.some(function(id) {
            return id === needle || needle.indexOf(id) > -1;
        });
    }

    http.whenGET('/api/account/roles', function(request) {
        var filters = pluckExcept(request.query, ['sort', 'limit', 'skip', 'text']),
            page = withDefaults(mapObject(pluck(request.query, ['limit', 'skip']), parseFloat), {
                limit: Infinity,
                skip: 0
            }),
            sort = (request.query.sort || null) && request.query.sort.split(','),
            all = grunt.file.expand(path.resolve(__dirname, './roles/*.json'))
                .map(function(path) {
                    var id = path.match(/[^\/]+(?=\.json)/)[0];

                    return extend(grunt.file.readJSON(path), { id: id });
                })
                .filter(function(current) {
                    return Object.keys(filters)
                        .every(function(key) {
                            switch (key) {
                                case 'ids':
                                    return contains(filters[key], current.id);
                                    break;
                                default:
                                    return filters[key] === current[key];
                                    break;
                            }
                        });
                })
                .filter(function(current) {
                    var text = request.query.text || current.name;

                    return current.name.indexOf(text) > -1;
                }),
            sorted = all
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
                })
                .filter(function(current, index) {
                    var startIndex = page.skip,
                        endIndex = startIndex + page.limit - 1;

                    return index >= startIndex && index <= endIndex;
                }),
            startPosition = page.skip + 1,
            endPosition = page.skip + Math.min(page.limit, sorted.length);

        this.respond(200, sorted)
            .setHeaders({
                'Content-Range': startPosition + '-' + endPosition + '/' + all.length
            });
    });

    http.whenGET('/api/account/roles/**', function(request) {
        var id = idFromPath(request.pathname),
            filePath = getPath(id);

        try {
            this.respond(200, grunt.file.readJSON(filePath));
        } catch(e) {
            this.respond(401, 'Not Authorized');
        }
    });

    http.whenPOST('/api/account/roles', function(request) {
        var id = 'r-' + Math.floor(Math.random() * 10000) + 1,
            filePath = getPath(id),
            currentTime = (new Date()).toISOString(),
            data = request.body,
            _new = extend(data, {
                id: id,
                created: currentTime,
                lastUpdated: currentTime
            });

        grunt.file.write(filePath, JSON.stringify(_new, null, '   '));

        this.respond(201, _new);
    });

    http.whenPUT('/api/account/roles/**', function(request) {
        var id = idFromPath(request.pathname),
            filePath = getPath(id),
            current = grunt.file.readJSON(filePath),
            updated = extend(current, request.body, {
                lastUpdated: (new Date()).toISOString()
            });

        if (id === 'r-113') {
            this.respond(401, 'Not Authorized');
        } else {
            grunt.file.write(filePath, JSON.stringify(updated, null, '   '));

            this.respond(200, updated);
        }
    });

    http.whenDELETE('/api/account/roles/**', function(request) {
        grunt.file.delete(getPath(idFromPath(request.pathname)));

        this.respond(204, '');
    });
};