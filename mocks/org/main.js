module.exports = function(http) {
    'use strict';

    var grunt = require('grunt'),
        path = require('path');

    var fn = require('../utils/fn'),
        db = require('../utils/db'),
        idFromPath = db.idFromPath,
        extend = fn.extend,
        pluck = fn.pluck,
        pluckExcept = fn.pluckExcept,
        withDefaults = fn.withDefaults,
        mapObject = fn.mapObject;

    function orgPath(id) {
        return path.resolve(__dirname, './orgs/' + id + '.json');
    }

    function genId() {
        return 'o-' + Math.floor(Math.random() * 10000) + 1;
    }

    function matchFilter(keyString, haystack) {
        var keys = keyString.split(',');

        if (!haystack) { return false; }

        return keys.some(function(value) {
            return value === haystack || haystack.indexOf(value) > -1;
        });
    }

    http.whenGET('/api/account/org/**', function(request) {
        var id = idFromPath(request.pathname),
            org = grunt.file.readJSON(path.resolve(__dirname, './orgs/' + id + '.json'));

        if (org) {
            this.respond(200, extend(org, {id: id}));
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
        var filters = pluckExcept(request.query, ['sort', 'limit', 'skip']),
            page = withDefaults(mapObject(pluck(request.query, ['limit', 'skip']), parseFloat), {
                limit: Infinity,
                skip: 0
            }),
            sort = (request.query.sort || null) && request.query.sort.split(','),
            allOrgs = grunt.file.expand(path.resolve(__dirname, './orgs/*.json'))
                .map(function(path) {
                    var id = path.match(/[^\/]+(?=\.json)/)[0];

                    return extend(grunt.file.readJSON(path), { id: id });
                })
                .filter(function(org) {
                    return Object.keys(filters)
                        .every(function(key) {
                            switch (key) {
                                case 'ids':
                                    return matchFilter(filters[key], org.id);
                                    break;
                                default:
                                    return filters[key] === org[key];
                                    break;
                            }
                        });
                }),
            orgs = allOrgs
                .filter(function(org, index) {
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
            endPosition = page.skip + Math.min(page.limit, orgs.length);

        this.respond(200, orgs)
            .setHeaders({
                'Content-Range': startPosition + '-' + endPosition + '/' + allOrgs.length
            });
    });
};
