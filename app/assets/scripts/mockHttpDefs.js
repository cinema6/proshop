define(['mockHttp'], function(mockHttp){
    'use strict';
    var httpMocks = mockHttp.httpMocks;
    /*
     * Org Endpoints
     */
    httpMocks.whenGET('/api/account/org/e2e-org')
        .proxy('mocks/account/org/e2e-org.json');

    httpMocks.whenGET('/api/account/org/o-111')
        .proxy('mocks/account/org/e2e-org.json');

    httpMocks.whenGET('/api/account/org/o-112')
        .proxy('mocks/account/org/e2e-org.json');

    httpMocks.whenGET('/api/account/org/o-113')
        .proxy('mocks/account/org/e2e-org.json');

    httpMocks.whenGET('/api/account/org/o-114')
        .proxy('mocks/account/org/e2e-org.json');

    httpMocks.whenPOST('/api/account/org', function(rqs) {
        if (rqs.data.name === 'New Org') {
            this.proxy('mocks/org/new-org.json');
        } else {
            this.respond(404,'failed');
        }
    });

    /*
     * Orgs Endpoints
     */

    httpMocks.whenGET('/api/account/orgs')
        .proxy('mocks/account/orgs/e2e-orgs.json');

    /*
     * User Endpoints
     */

    httpMocks.whenGET('/api/account/user/e2e-12221')
        .proxy('mocks/account/user/e2e-user.json');

    httpMocks.whenGET('/api/account/user/e2e-12222')
        .proxy('mocks/account/user/e2e-user.json');

    httpMocks.whenGET('/api/account/user/e2e-12223')
        .proxy('mocks/account/user/e2e-user.json');

    httpMocks.whenGET('/api/account/user/e2e-12224')
        .proxy('mocks/account/user/e2e-user.json');

    httpMocks.whenGET('/api/account/user/e2e-12225')
        .proxy('mocks/account/user/e2e-user.json');


    /*
     * Users Endpoints
     */

    httpMocks.whenGET('/api/account/users?org=o-111')
        .proxy('mocks/account/users/e2e-users.json');

    httpMocks.whenGET('/api/account/users?org=o-112')
        .proxy('mocks/account/users/e2e-users.json');

    httpMocks.whenGET('/api/account/users?org=o-113')
        .proxy('mocks/account/users/e2e-users.json');

    httpMocks.whenGET('/api/account/users?org=o-114')
        .proxy('mocks/account/users/e2e-users.json');

    httpMocks.whenGET('/api/account/users')
        .proxy('mocks/account/users/e2e-users.json');

    /*
     * Auth Endpoints
     */
    httpMocks.whenGET('/api/auth/status')
        .proxy('mocks/auth/login.json');

    httpMocks.whenPOST('/api/auth/login', function(rqs){
        if (rqs.data.email === 'fail@cinema6.com'){
            this.respond(404,'failed');
        } else {
            this.proxy('mocks/auth/login.json');
        }
    });
    httpMocks.whenPOST('/api/auth/logout').respond(200,'ok');

    // for changing username and password in account.js

    httpMocks.whenPOST('/api/account/user/email', function(rqs){
        if (rqs.data.newEmail !== 'howard@cinema6.com'){
            this.respond(404,rqs.data.newEmail + ' is not howard!');
        } else {
            this.respond(200,'Congratulations, you are now howard!');
        }
    });

    httpMocks.whenPOST('/api/account/user/password', function(rqs){
        if (rqs.data.newPassword === 'failfail'){
            this.respond(404,'Failed to change password.');
        } else {
            this.respond(200,'Congratulations, you have a new password!');
        }
    });

});
