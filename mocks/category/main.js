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

    function categoryPath(id) {
        return path.resolve(__dirname, './categories/' + id + '.json');
    }

    function contains(haystack, needle) {
        var ids = haystack.split(',');

        if (!needle) { return false; }

        return ids.some(function(id) {
            return id === needle || needle.indexOf(id) > -1;
        });
    }

    http.whenGET('/api/content/categories', function(request) {
        var filters = pluckExcept(request.query, ['sort', 'limit', 'skip', 'text']),
            page = withDefaults(mapObject(pluck(request.query, ['limit', 'skip']), parseFloat), {
                limit: Infinity,
                skip: 0
            }),
            sort = (request.query.sort || null) && request.query.sort.split(','),
            allCats = grunt.file.expand(path.resolve(__dirname, './categories/*.json'))
                .map(function(path) {
                    var id = path.match(/[^\/]+(?=\.json)/)[0];

                    return extend(grunt.file.readJSON(path), { id: id });
                })
                .filter(function(category) {
                    return Object.keys(filters)
                        .every(function(key) {
                            switch (key) {
                                case 'ids':
                                    return contains(filters[key], category.id);
                                    break;
                                default:
                                    return filters[key] === category[key];
                                    break;
                            }
                        });
                })
                .filter(function(category) {
                    var text = request.query.text || category.name;

                    return category.name.indexOf(text) > -1 ||
                        category.label.indexOf(text) > -1;
                }),
            cats = allCats
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
                .filter(function(category, index) {
                    var startIndex = page.skip,
                        endIndex = startIndex + page.limit - 1;

                    return index >= startIndex && index <= endIndex;
                }),
            startPosition = page.skip + 1,
            endPosition = page.skip + Math.min(page.limit, cats.length);

        this.respond(200, cats)
            .setHeaders({
                'Content-Range': startPosition + '-' + endPosition + '/' + allCats.length
            });
    });

    http.whenGET('/api/content/category/**', function(request) {
        var id = idFromPath(request.pathname),
            filePath = categoryPath(id);

        try {
            this.respond(200, grunt.file.readJSON(filePath));
        } catch(e) {
            this.respond(401, 'Not Authorized');
        }
    });

    http.whenPOST('/api/content/category', function(request) {
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

    http.whenPUT('/api/content/category/**', function(request) {
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

    http.whenDELETE('/api/content/category/**', function(request) {
        grunt.file.delete(categoryPath(idFromPath(request.pathname)));

        this.respond(204, '');
    });
};