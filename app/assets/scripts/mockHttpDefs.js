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

}(window.c6HttpMocks));