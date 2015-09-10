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

    function customerPath(id) {
        return path.resolve(__dirname, './customers/' + id + '.json');
    }

    function contains(haystack, needle) {
        var ids = haystack.split(',');

        if (!needle) { return false; }

        return ids.some(function(id) {
            return id === needle || needle.indexOf(id) > -1;
        });
    }

    http.whenGET('/api/account/customers', function(request) {
        var filters = pluckExcept(request.query, ['sort', 'limit', 'skip', 'text']),
            page = withDefaults(mapObject(pluck(request.query, ['limit', 'skip']), parseFloat), {
                limit: Infinity,
                skip: 0
            }),
            sort = (request.query.sort || null) && request.query.sort.split(','),
            allCustomers = grunt.file.expand(path.resolve(__dirname, './customers/*.json'))
                .map(function(path) {
                    var id = path.match(/[^\/]+(?=\.json)/)[0];

                    return extend(grunt.file.readJSON(path), { id: id });
                })
                .filter(function(customer) {
                    return Object.keys(filters)
                        .every(function(key) {
                            switch (key) {
                                case 'ids':
                                    return contains(filters[key], customer.id);
                                    break;
                                default:
                                    return filters[key] === customer[key];
                                    break;
                            }
                        });
                })
                .filter(function(customer) {
                    var text = request.query.text || customer.name;

                    return customer.name.indexOf(text) > -1;
                }),
            customers = allCustomers
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
                .filter(function(customer, index) {
                    var startIndex = page.skip,
                        endIndex = startIndex + page.limit - 1;

                    return index >= startIndex && index <= endIndex;
                }),
            startPosition = page.skip + 1,
            endPosition = page.skip + Math.min(page.limit, customers.length);

        this.respond(200, customers)
            .setHeaders({
                'Content-Range': startPosition + '-' + endPosition + '/' + allCustomers.length
            });
    });

    http.whenGET('/api/account/customer/**', function(request) {
        var id = idFromPath(request.pathname),
            filePath = customerPath(id);

        try {
            this.respond(200, grunt.file.readJSON(filePath));
        } catch(e) {
            this.respond(401, 'Not Authorized');
        }
    });

    http.whenPOST('/api/account/customer', function(request) {
        var id = 'cus-' + Math.floor(Math.random() * 10000) + 1,
            filePath = customerPath(id),
            currentTime = (new Date()).toISOString(),
            data = request.body,
            newCustomer = extend(data, {
                id: id,
                created: currentTime,
                lastUpdated: currentTime
            });

        grunt.file.write(filePath, JSON.stringify(newCustomer, null, '   '));

        this.respond(201, newCustomer);
    });

    http.whenPUT('/api/account/customer/**', function(request) {
        var id = idFromPath(request.pathname),
            filePath = customerPath(id),
            currentCustomer = grunt.file.readJSON(filePath),
            updatedCustomer = extend(currentCustomer, request.body, {
                lastUpdated: (new Date()).toISOString()
            });

        if (id === 'cus-113') {
            this.respond(401, 'Not Authorized');
        } else {
            grunt.file.write(filePath, JSON.stringify(updatedCustomer, null, '   '));

            this.respond(200, updatedCustomer);
        }
    });

    http.whenDELETE('/api/account/customer/**', function(request) {
        grunt.file.delete(customerPath(idFromPath(request.pathname)));

        this.respond(204, '');
    });
};