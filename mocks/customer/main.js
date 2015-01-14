module.exports = function(http) {
    'use strict';

    var path = require('path'),
        grunt = require('grunt');

    var fn = require('../utils/fn'),
        db = require('../utils/db'),
        idFromPath = db.idFromPath,
        extend = fn.extend;

    function customerPath(id) {
        return path.resolve(__dirname, './customers/' + id + '.json');
    }

    http.whenGET('/api/account/customers', function(request) {
        var allCustomers = grunt.file.expand(path.resolve(__dirname, './customers/*.json'))
            .map(function(path) {
                return grunt.file.readJSON(path);
            });

        this.respond(200, allCustomers);
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
        var id = 'a-' + Math.floor(Math.random() * 10000) + 1,
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