module.exports = function(http) {
    'use strict';

    var grunt = require('grunt'),
        path = require('path');

    var fn = require('../utils/fn'),
        db = require('../utils/db'),
        idFromPath = db.idFromPath,
        extend = fn.extend;

    http.whenGET('/collateral/experiences/**/**', function(request) {
        this.respond(200, grunt.file.read(path.resolve(__dirname, './specified_splash.jpeg')));
    });

    http.whenPOST('/api/collateral/files/**', function(request) {
        this.respond(200, [ { path:'collateral/experiences/' + idFromPath(request.pathname) + '/splash' } ]);
    });

    http.whenPOST('/api/collateral/splash/**', function(request) {
        var id = idFromPath(request.pathname);
        // var id = genId(),
        //     currentTime = (new Date()).toISOString(),
        //     org = extend(request.body, {
        //         created: currentTime,
        //         lastUpdated: currentTime
        //     });

        // grunt.file.write(orgPath(id), JSON.stringify(org, null, '    '));

        if (id === 'e-generate-fail') {
            this.respond(400, 'Failed to generate splash');
        } else {
            this.respond(200, grunt.file.readJSON(path.resolve(__dirname, './splash.json')));
        }
        // this.respond(201, extend(org, { id: id }));
    });
};
