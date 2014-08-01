define(['mockHttp'], function(mockHttp){
    'use strict';
    var httpMocks = mockHttp.httpMocks;
    if (!httpMocks){
        return;
    }

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

    /*
     * Org Endpoints
     */
    httpMocks.whenGET('/api/account/org/e2e-org')
        .proxy('mocks/account/org/e2e-org.json');

    httpMocks.whenGET('/api/account/org/o-111')
        .proxy('mocks/account/org/org1.json');

    httpMocks.whenGET('/api/account/org/o-112')
        .proxy('mocks/account/org/org2.json');

    httpMocks.whenGET('/api/account/org/o-113')
        .proxy('mocks/account/org/org3.json');

    httpMocks.whenGET('/api/account/org/o-114')
        .proxy('mocks/account/org/org4.json');

    httpMocks.whenPOST('/api/account/org', function(rqs) {
        if (rqs.data.name === 'New Org') {
            this.proxy('mocks/org/new-org.json');
        } else {
            this.respond(404,'failed');
        }
    });

    httpMocks.whenDELETE('/api/account/org/o-111', function() {
        this.proxy('mocks/account/org/e2e-org.json');
    });

    httpMocks.whenDELETE('/api/account/org/o-112', function() {
        this.proxy('mocks/account/org/e2e-org.json');
    });

    httpMocks.whenDELETE('/api/account/org/o-113', function() {
        this.proxy('mocks/account/org/e2e-org.json');
    });

    httpMocks.whenDELETE('/api/account/org/o-114', function() {
        this.proxy('mocks/account/org/e2e-org.json');
    });

    httpMocks.whenDELETE('/api/account/org/e2e-org', function() {
        this.proxy('mocks/account/org/e2e-org.json');
    });

    /*
     * Orgs Endpoints
     */

    httpMocks.whenGET('/api/account/orgs')
        .proxy('mocks/account/orgs/e2e-orgs.json');

    httpMocks.whenPUT('/api/account/org/o-111', function() {
        this.proxy('mocks/account/org/e2e-org.json');
    });

    httpMocks.whenPUT('/api/account/org/o-112', function() {
        this.proxy('mocks/account/org/e2e-org.json');
    });

    httpMocks.whenPUT('/api/account/org/o-113', function() {
        this.proxy('mocks/account/org/e2e-org.json');
    });

    httpMocks.whenPUT('/api/account/org/o-114', function() {
        this.proxy('mocks/account/org/e2e-org.json');
    });

    httpMocks.whenPUT('/api/account/org/e2e-org', function() {
        this.proxy('mocks/account/org/e2e-org.json');
    });

    httpMocks.whenPOST('/api/account/org', function() {
        this.proxy('mocks/account/org/e2e-org.json');
    });

    /*
     * User Endpoints
     */

    httpMocks.whenPOST('/api/account/user', function() {
        this.proxy('mocks/account/user/e2e-user.json');
    });

    httpMocks.whenPUT('/api/account/user/e2e-12221', function() {
        this.proxy('mocks/account/user/e2e-user.json');
    });

    httpMocks.whenPUT('/api/account/user/e2e-12222', function() {
        this.proxy('mocks/account/user/e2e-user.json');
    });

    httpMocks.whenPUT('/api/account/user/e2e-12223', function() {
        this.proxy('mocks/account/user/e2e-user.json');
    });

    httpMocks.whenPUT('/api/account/user/e2e-12224', function() {
        this.proxy('mocks/account/user/e2e-user.json');
    });

    httpMocks.whenPUT('/api/account/user/e2e-12225', function() {
        this.proxy('mocks/account/user/e2e-user.json');
    });

    httpMocks.whenPUT('/api/account/user/e2e-light-user', function() {
        this.proxy('mocks/account/user/e2e-user.json');
    });

    httpMocks.whenDELETE('/api/account/user/e2e-12221', function() {
        this.proxy('mocks/account/user/e2e-user.json');
    });

    httpMocks.whenDELETE('/api/account/user/e2e-12222', function() {
        this.proxy('mocks/account/user/e2e-user.json');
    });

    httpMocks.whenDELETE('/api/account/user/e2e-12223', function() {
        this.proxy('mocks/account/user/e2e-user.json');
    });

    httpMocks.whenDELETE('/api/account/user/e2e-12224', function() {
        this.proxy('mocks/account/user/e2e-user.json');
    });

    httpMocks.whenDELETE('/api/account/user/e2e-12225', function() {
        this.proxy('mocks/account/user/e2e-user.json');
    });

    httpMocks.whenDELETE('/api/account/user/e2e-light-user', function() {
        this.proxy('mocks/account/user/e2e-user.json');
    });

    /*
     * Users Endpoints
     */

    httpMocks.whenGET('/api/account/users')
        .proxy('mocks/account/users/e2e-users.json');

    httpMocks.whenGET('/api/account/users?org=o-111')
        .proxy('mocks/account/users/o1-users.json');

    httpMocks.whenGET('/api/account/users?org=o-112')
        .proxy('mocks/account/users/o2-users.json');

    httpMocks.whenGET('/api/account/users?org=o-113')
        .proxy('mocks/account/users/o3-users.json');

    httpMocks.whenGET('/api/account/users?org=o-114')
        .proxy('mocks/account/users/o4-users.json');

    httpMocks.whenGET('/api/account/users?org=e2e-org')
        .proxy('mocks/account/users/e2e-org-users.json');

});
