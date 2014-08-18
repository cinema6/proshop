(function() {
    'use strict';

    define(['splash'], function(splash) {
        /* global angular:true */
        var noop = angular.noop;

        describe('FileService', function() {
            var $rootScope,
                FileService;

            var $window,
                formData,
                xhr;

            function MockXHR() {
                this.onreadystatechange = null;
                this.readyState = 0;
                this.response = null;
                this.responseText = null;
                this.responseType = '';
                this.status = null;
                this.statusText = null;
                this.timeout = 0;
                this.ontimeout = null;
                this.upload = {
                    onprogress: null
                };
                this.withCredentials = false;

                xhr = this;
            }
            MockXHR.prototype = {
                abort: jasmine.createSpy('xhr.abort()'),
                getAllResponseHeaders: jasmine.createSpy('xhr.getAllResponseHeaders()')
                    .and.returnValue(null),
                getResponseHeader: jasmine.createSpy('xhr.getResponseHeader()')
                    .and.returnValue(null),
                open: jasmine.createSpy('xhr.open()'),
                overrideMimeType: jasmine.createSpy('xhr.overrideMimeType()'),
                send: jasmine.createSpy('xhr.send()'),
                setRequestHeader: jasmine.createSpy('xhr.setRequestHeader()')
            };

            function MockFormData() {
                formData = this;
            }
            MockFormData.prototype = {
                append: jasmine.createSpy('formData.append()')
            };

            beforeEach(function() {
                module('ng', function($provide) {
                    $provide.value('$window', {
                        URL: {
                            createObjectURL: jasmine.createSpy('URL.createObjectURL()'),
                            revokeObjectURL: jasmine.createSpy('URL.revokeObjectURL()')
                        },
                        FormData: MockFormData,
                        XMLHttpRequest: MockXHR,
                        addEventListener: jasmine.createSpy('$window.addEventListener()')
                    });
                });

                module(splash.name);

                inject(function($injector) {
                    $rootScope = $injector.get('$rootScope');

                    $window = $injector.get('$window');

                    FileService = $injector.get('FileService');
                });
            });

            it('should exist', function() {
                expect(FileService).toEqual(jasmine.any(Object));
            });

            describe('methods', function() {
                describe('openBlob(file)', function() {
                    var success, failure;

                    beforeEach(function() {
                        success = jasmine.createSpy('open success');
                        failure = jasmine.createSpy('open failure');

                        $rootScope.$apply(function() {
                            FileService.openBlob('/collateral/experiences/e-1/splash')
                                .then(success, failure);
                        });
                    });

                    it('should get the image blob via XHR', function() {
                        expect(xhr.responseType).toBe('blob');
                        expect(xhr.open).toHaveBeenCalledWith('GET', '/collateral/experiences/e-1/splash', true);
                        expect(xhr.send).toHaveBeenCalledWith();
                    });

                    it('should resolve the promise with the blob if status is 200', function() {
                        xhr.response = {name: 'blob'};
                        xhr.status = 200;
                        xhr.onload();
                        expect(success).toHaveBeenCalledWith(xhr.response);
                    });

                    it('should not resolve the promise if status is not 200', function() {
                        xhr.response = {name: 'blob'};
                        xhr.status = 201;
                        xhr.onload();
                        expect(success).not.toHaveBeenCalled();
                    });

                    it('should reject the promise if onerror() is fired', function() {
                        xhr.onerror({
                            target: {
                                status: 404
                            }
                        });
                        expect(failure).toHaveBeenCalledWith('Error 404 occurred while receiving the file.');
                    });
                });

                describe('uploadBlob(url, blob)', function() {
                    var success, failure, blob;

                    beforeEach(function() {
                        blob = {name: 'blob'};
                        success = jasmine.createSpy('upload success');
                        failure = jasmine.createSpy('upload failure');

                        $rootScope.$apply(function() {
                            FileService.uploadBlob('/api/collateral/files/e-1', blob)
                                .then(success, failure);
                        });
                    });

                    it('should create form data and append the files', function() {
                        expect(formData.append).toHaveBeenCalledWith('image', blob, 'splash');
                    });

                    it('should send the form via XHR', function() {
                        expect(xhr.open).toHaveBeenCalledWith('POST', '/api/collateral/files/e-1', true);
                        expect(xhr.send).toHaveBeenCalledWith(formData);
                    });

                    describe('when the request completes', function() {
                        describe('if successful onload() is fired', function() {
                            beforeEach(function() {
                                xhr.response = JSON.stringify({ foo: { value: 'bar' } });

                                xhr.onload();
                            });

                            it('should resolve the promise', function() {
                                expect(success).toHaveBeenCalledWith({
                                    data: JSON.parse(xhr.response),
                                    status: xhr.status,
                                    statusText: xhr.statusText
                                });
                            });
                        });

                        describe('if onerror() was fired', function() {
                            beforeEach(function() {
                                xhr.onerror({
                                    target: {
                                        status: 400
                                    }
                                });
                            });

                            it('should reject the promise', function() {
                                expect(failure).toHaveBeenCalledWith('Error 400 occured while uploading blob');
                            });
                        });
                    });
                });
            });
        });
    });
}());
