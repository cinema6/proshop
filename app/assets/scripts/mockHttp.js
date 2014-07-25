define(function(){
    'use strict';

    function MockHttpResponse() {
        this.fnSuccess  = null;
        this.fnError    = null;
    }

    MockHttpResponse.prototype.success = function(handler){
        this.fnSuccess = handler;
        return this;
    };

    MockHttpResponse.prototype.error = function(handler){
        this.fnError = handler;
        return this;
    };


    function HttpMockResponder(){
        this.statusCode     = null;
        this.data           = null;
        this.proxyUrl       = null;
        this.proxyMethod    = null;
    }

    HttpMockResponder.prototype.respond = function(statusCode, data){
        this.data = data;
        this.statusCode = statusCode;
    };

    HttpMockResponder.prototype.proxy = function(url,method){
        this.proxyUrl = url;
        this.proxyMethod = method || 'GET';
    };

    function HttpMock(){
        this.GET   = {};
        this.POST  = {};
        this.PUT   = {};
    }

    HttpMock.prototype.whenGET = function(url){
        var responder = new HttpMockResponder();
        this.GET[url] = responder;
        return responder;
    };

    HttpMock.prototype.whenPOST = function(url, handler){
        var responder = new HttpMockResponder();
        this.POST[url] = responder;
        responder.handler = handler;
        return responder;
    };

    HttpMock.prototype.whenPUT = function(url, handler){
        var responder = new HttpMockResponder();
        this.PUT[url] = responder;
        responder.handler = handler;
        return responder;
    };


    HttpMock.prototype.handleRequest = function(args, service){
        var rqs = args[0], responder, response, handler;
        responder =  (this[rqs.method]) ? this[rqs.method][rqs.url] : undefined;
        if(!responder){
            return service.apply(null,args);
        }

        if (responder.handler){
            handler = responder.handler;
            responder = new  HttpMockResponder();
            handler.call(responder,rqs);
        }

        if (responder.proxyUrl){
            rqs.url = responder.proxyUrl;
            rqs.method = responder.proxyMethod;
            return service.apply(null,args);
        }

        if (responder.statusCode){
            response = new MockHttpResponse();
            window.setTimeout(function(){
                if ((responder.statusCode >= 200) && (responder.statusCode < 300)){
                    if (response.fnSuccess) {
                        response.fnSuccess.call(null,
                            responder.data,responder.statusCode);
                    }
                } else {
                    if (response.fnError) {
                        response.fnError.call(null,
                            responder.data,responder.statusCode);
                    }
                }
            });
            return response;
        }

        return service.apply(null,args);
    };

    var httpMock = new HttpMock();

    function httpDecorator($delegate) {
        window.console.warn('Using c6HttpDecorator!');
        var service = $delegate;
        $delegate = function(){
            var args = Array.prototype.slice.call(arguments,0);
            return httpMock.handleRequest(args,service);
        };

        // the http sugar methods are copied over as-is
        angular.copy(service,$delegate);
        return $delegate;
    }

    return {
        httpMocks        : httpMock,
        httpDecorator    : httpDecorator
    };
});
