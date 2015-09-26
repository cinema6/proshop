(function() {
    'use strict';

    define(['app'], function(proshop) {
        describe('requestWrapper', function() {
            var $rootScope,
                $timeout,
                $q,
                requestWrapper;

            beforeEach(function() {
                module(proshop.name);

                inject(function($injector) {
                    $rootScope = $injector.get('$rootScope');
                    $timeout = $injector.get('$timeout');
                    $q = $injector.get('$q');

                    requestWrapper = $injector.get('requestWrapper');

                    spyOn($timeout, 'cancel');
                });
            });

            it('should exist', function() {
                expect(requestWrapper).toEqual(jasmine.any(Function));
            });

            it('should take a promise and return a promise', function() {
                expect(requestWrapper($q.defer().promise).then).toBeDefined();
            });

            describe('if a promise is not passed in', function() {
                it('should reject the returned promise', function() {
                    var success = jasmine.createSpy('success'),
                        failure = jasmine.createSpy('failure');

                    $rootScope.$apply(function() {
                        requestWrapper().then(success, failure);
                    });

                    expect(success).not.toHaveBeenCalled();
                    expect(failure).toHaveBeenCalled();
                    expect($timeout.cancel).toHaveBeenCalled();
                });
            });

            describe('when the passed in promise resolves', function() {
                it('should resolve the returned promise', function() {
                    var success = jasmine.createSpy('success'),
                        failure = jasmine.createSpy('failure'),
                        deferred = $q.defer();

                    requestWrapper(deferred.promise).then(success, failure);

                    expect(success).not.toHaveBeenCalled();
                    expect(failure).not.toHaveBeenCalled();

                    $rootScope.$apply(function() {
                        deferred.resolve('success!');
                    });

                    expect(success).toHaveBeenCalledWith('success!');
                    expect(failure).not.toHaveBeenCalled();
                    expect($timeout.cancel).toHaveBeenCalled();
                });
            });

            describe('when the passed in promise is rejected', function() {
                it('should reject the returned promise', function() {
                    var success = jasmine.createSpy('success'),
                        failure = jasmine.createSpy('failure'),
                        deferred = $q.defer();

                    requestWrapper(deferred.promise).then(success, failure);

                    expect(success).not.toHaveBeenCalled();
                    expect(failure).not.toHaveBeenCalled();

                    $rootScope.$apply(function() {
                        deferred.reject('failure!');
                    });

                    expect(success).not.toHaveBeenCalled();
                    expect(failure).toHaveBeenCalledWith('failure!');
                    expect($timeout.cancel).toHaveBeenCalled();
                });
            });

            describe('when the request times out', function() {
                it('should reject the returned promise', function() {
                    var success = jasmine.createSpy('success'),
                        failure = jasmine.createSpy('failure'),
                        deferred = $q.defer();

                    requestWrapper(deferred.promise).then(success, failure);

                    expect(success).not.toHaveBeenCalled();
                    expect(failure).not.toHaveBeenCalled();

                    $timeout.flush(60000);

                    expect(success).not.toHaveBeenCalled();
                    expect(failure).toHaveBeenCalledWith('Request timed out.');
                });
            });
        });
    });
}());