(function(httpMocks){
    'use strict';

    /*
     * Auth Endpoints
     */
    httpMocks.whenGET('/api/auth/status')
        .proxy('assets/mocks/auth/login.json');

    httpMocks.whenPOST('/api/auth/login', function(rqs){
        if (rqs.data.email === 'fail@cinema6.com'){
            this.respond(404,'failed');
        } else {
            this.proxy('assets/mocks/auth/login.json');
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
        .proxy('assets/mocks/account/org/e2e-org.json');

    httpMocks.whenGET('/api/account/org/o-111')
        .proxy('assets/mocks/account/org/org1.json');

    httpMocks.whenGET('/api/account/org/o-112')
        .proxy('assets/mocks/account/org/org2.json');

    httpMocks.whenGET('/api/account/org/o-113')
        .proxy('assets/mocks/account/org/org3.json');

    httpMocks.whenGET('/api/account/org/o-114')
        .proxy('assets/mocks/account/org/org4.json');

    httpMocks.whenPOST('/api/account/org', function(rqs) {
        if (rqs.data.name === 'New Org') {
            this.proxy('assets/mocks/org/new-org.json');
        } else {
            this.respond(404,'failed');
        }
    });

    /*
     * Orgs Endpoints
     */

    httpMocks.whenGET('/api/account/orgs')
        .proxy('assets/mocks/account/orgs/e2e-orgs.json');

    httpMocks.whenPUT('/api/account/org/o-111', function() {
        this.proxy('assets/mocks/account/org/e2e-org.json');
    });

    httpMocks.whenPUT('/api/account/org/o-112', function() {
        this.proxy('assets/mocks/account/org/e2e-org.json');
    });

    httpMocks.whenPUT('/api/account/org/o-113', function() {
        this.proxy('assets/mocks/account/org/e2e-org.json');
    });

    httpMocks.whenPUT('/api/account/org/o-114', function() {
        this.proxy('assets/mocks/account/org/e2e-org.json');
    });

    httpMocks.whenPUT('/api/account/org/e2e-org', function() {
        this.proxy('assets/mocks/account/org/e2e-org.json');
    });

    httpMocks.whenPOST('/api/account/org', function() {
        this.proxy('assets/mocks/account/org/e2e-org.json');
    });

    /*
     * User Endpoints
     */

    httpMocks.whenPOST('/api/account/user', function() {
        this.proxy('assets/mocks/account/user/e2e-user.json');
    });

    httpMocks.whenPUT('/api/account/user', function() {
        this.proxy('assets/mocks/account/user/e2e-user.json');
    });

    /*
     * Users Endpoints
     */

    httpMocks.whenGET('/api/account/users')
        .proxy('assets/mocks/account/users/e2e-users.json');

    // httpMocks.whenGET('/api/account/users?org=o-111')
    //     .proxy('assets/mocks/account/users/e2e-users.json');

    // httpMocks.whenGET('/api/account/users?org=o-112')
    //     .proxy('assets/mocks/account/users/e2e-users.json');

    // httpMocks.whenGET('/api/account/users?org=o-113')
    //     .proxy('assets/mocks/account/users/e2e-users.json');

    // httpMocks.whenGET('/api/account/users?org=o-114')
    //     .proxy('assets/mocks/account/users/e2e-users.json');

}(window.c6HttpMocks));