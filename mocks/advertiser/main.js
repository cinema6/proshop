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

    function advertiserPath(id) {
        return path.resolve(__dirname, './advertisers/' + id + '.json');
    }

    function contains(haystack, needle) {
        var ids = haystack.split(',');

        if (!needle) { return false; }

        return ids.some(function(id) {
            return id === needle || needle.indexOf(id) > -1;
        });
    }

    http.whenGET('/api/account/advertisers', function(request) {
        var filters = pluckExcept(request.query, ['sort', 'limit', 'skip', 'text']),
            page = withDefaults(mapObject(pluck(request.query, ['limit', 'skip']), parseFloat), {
                limit: Infinity,
                skip: 0
            }),
            sort = (request.query.sort || null) && request.query.sort.split(','),
            allAdvertisers = grunt.file.expand(path.resolve(__dirname, './advertisers/*.json'))
                .map(function(path) {
                    var id = path.match(/[^\/]+(?=\.json)/)[0];

                    return extend(grunt.file.readJSON(path), { id: id });
                })
                .filter(function(advertiser) {
                    return Object.keys(filters)
                        .every(function(key) {
                            switch (key) {
                                case 'ids':
                                    return contains(filters[key], advertiser.id);
                                    break;
                                default:
                                    return filters[key] === advertiser[key];
                                    break;
                            }
                        });
                })
                .filter(function(advertiser) {
                    var text = request.query.text || advertiser.name;

                    return advertiser.name.indexOf(text) > -1;
                }),
            advertisers = allAdvertisers
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
                .filter(function(advertiser, index) {
                    var startIndex = page.skip,
                        endIndex = startIndex + page.limit - 1;

                    return index >= startIndex && index <= endIndex;
                }),
            startPosition = page.skip + 1,
            endPosition = page.skip + Math.min(page.limit, advertisers.length);

        this.respond(200, advertisers)
            .setHeaders({
                'Content-Range': startPosition + '-' + endPosition + '/' + allAdvertisers.length
            });
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