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

    function experiencePath(id) {
        return path.resolve(__dirname, './experiences/' + id + '.json');
    }

    function genId() {
        return 'e-' + Math.floor(Math.random() * 10000) + 1;
    }

    http.whenGET('/api/content/experiences', function(request) {
        var filters = pluckExcept(request.query, ['sort', 'limit', 'skip', 'text']),
            page = withDefaults(mapObject(pluck(request.query, ['limit', 'skip']), parseFloat), {
                limit: Infinity,
                skip: 0
            }),
            sort = (request.query.sort || null) && request.query.sort.split(','),
            allExperiences = grunt.file.expand(path.resolve(__dirname, './experiences/*.json'))
                .map(function(path) {
                    var id = path.match(/[^\/]+(?=\.json)/)[0];

                    return extend(grunt.file.readJSON(path), { id: id });
                })
                .filter(function(experience) {
                    return Object.keys(filters)
                        .every(function(key) {
                            if (key === 'ids') {
                                return filters[key].split(',').some(function(id) {
                                    return id === experience.id;
                                });
                            } else {
                                return filters[key] === experience[key];
                            }
                        });
                })
                .filter(function(experience) {
                    var text = request.query.text || experience.data.title || experience.title;

                    return (experience.data.title || experience.title).toLowerCase().indexOf(text.toLowerCase()) > -1;
                }),
            experiences = allExperiences
                .filter(function(experience, index) {
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
            endPosition = page.skip + Math.min(page.limit, experiences.length);

        var exp = grunt.file.readJSON(path.resolve(__dirname, './experiences/experiences.json'));

        if (pluck(request.query,['org']).org) {
            // currently we just want to return the experiences.json file if querying by Org
            // this is used in the Minireel Manager area but will be changed soon.
            this.respond(200, exp);
        } else {
            this.respond(200, experiences)
                .setHeaders({
                    'Content-Range': startPosition + '-' + endPosition + '/' + allExperiences.length
                });
        }
    });

    http.whenGET('/api/content/experience/**', function(request) {
        var id = idFromPath(request.pathname),
            filePath = experiencePath(id);

        try {
            this.respond(200, extend(grunt.file.readJSON(filePath), { id: id }));
        } catch(e) {
            this.respond(401, 'Not Authorized');
        }
    });

    http.whenPOST('/api/content/experience', function(request) {
        var id = genId(),
            currentTime = (new Date()).toISOString(),
            exp = extend(request.body, {
                id: id,
                created: currentTime,
                lastUpdated: currentTime
            });


        switch (request.body.data.branding) {
        case 'post_fail':
            this.respond(404, 'Failed to post experience copy');
            break;
        case 'put_fail':
            this.respond(200, grunt.file.readJSON(path.resolve(__dirname, './experiences/put-fail-experience.json')));
            break;
        case 'generated_fail':
            this.respond(200, grunt.file.readJSON(path.resolve(__dirname, './experiences/generated-fail-experience.json')));
            break;
        default:
            grunt.file.write(experiencePath(id), JSON.stringify(exp, null, '    '));

            this.respond(201, exp);
        }
    });

    http.whenPUT('/api/content/experience/**', function(request) {
        var filePath = experiencePath(idFromPath(request.pathname)),
            current = grunt.file.readJSON(filePath),
            newExperience = extend(current, request.body, {
                lastUpdated: (new Date()).toISOString()
            });

        if (idFromPath(request.pathname) === 'e-put-fail') {
            this.respond(403, 'Bad for some reason');
        } else {
            grunt.file.write(filePath, JSON.stringify(newExperience, null, '    '));

            this.respond(200, newExperience);
        }
    });
};
