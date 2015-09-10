(function() {
    'use strict';

    define(['app'], function(proshop) {
        describe('Cinema6Service', function() {
            var $rootScope,
                $q,
                $timeout,
                $http;

            var Cinema6Service,
                CategoryService;

            var _deferreds;

            beforeEach(function() {
                module(proshop.name);

                inject(function($injector) {
                    $rootScope = $injector.get('$rootScope');
                    $q = $injector.get('$q');
                    $http = $injector.get('$http');
                    $timeout = $injector.get('$timeout');

                    CategoryService = $injector.get('CategoryService');
                    Cinema6Service = $injector.get('Cinema6Service');

                    _deferreds = {
                        get: $q.defer(),
                        getAll: $q.defer(),
                        put: $q.defer(),
                        post: $q.defer(),
                        delete: $q.defer()
                    };

                    spyOn(CategoryService, 'getAll').and.returnValue(_deferreds.getAll.promise);
                    spyOn(CategoryService, 'get').and.returnValue(_deferreds.get.promise);
                    spyOn(CategoryService, 'put').and.returnValue(_deferreds.put.promise);
                    spyOn(CategoryService, 'post').and.returnValue(_deferreds.post.promise);
                    spyOn(CategoryService, 'delete').and.returnValue(_deferreds.delete.promise);
                });
            });

            describe('initialization', function() {
                it('should exist', function() {
                    expect(Cinema6Service).toEqual(jasmine.any(Object));
                });
            });

            describe('methods', function() {
                var successSpy, errorSpy;

                beforeEach(function() {
                    successSpy = jasmine.createSpy('success');
                    errorSpy = jasmine.createSpy('error');
                });

                [
                    {
                        method: 'get',
                        args: '111'
                    },
                    {
                        method: 'getAll',
                        args: {
                            ids: '111,112,113',
                            limit: 2
                        }
                    },
                    {
                        method: 'put',
                        args: ['111', {prop: 'updated'}]
                    },
                    {
                        method: 'post',
                        args: {
                            id: '111',
                            prop: 'new'
                        }
                    },
                    {
                        method: 'delete',
                        args: '111'
                    }
                ].forEach(function(obj) {
                    describe(obj.method + '(type, args...)', function() {
                        it('should return a promise', function() {
                            var badArgs = ['bad'].concat(obj.args),
                                goodArgs = ['categories'].concat(obj.args);

                            expect(Cinema6Service[obj.method].apply(null, badArgs).then).toBeDefined();
                            expect(Cinema6Service[obj.method].apply(null, goodArgs).then).toBeDefined();
                        });

                        it('should use the corresponding service', function() {
                            var categoryArgs = ['categories'].concat(obj.args);

                            Cinema6Service[obj.method].apply(null, categoryArgs);

                            expect(CategoryService[obj.method]).toHaveBeenCalled();
                        });

                        describe('when type is invalid', function() {
                            it('should ', function() {
                                var badArgs = ['bad'].concat(obj.args);

                                Cinema6Service[obj.method].apply(null, badArgs)
                                    .then(successSpy, errorSpy);

                                $rootScope.$digest();

                                expect(errorSpy).toHaveBeenCalledWith('Unable to resolve request');
                                expect(successSpy).not.toHaveBeenCalled();
                            });
                        });

                        describe('when type is valid', function() {
                            var args;

                            beforeEach(function() {
                                args = ['categories'].concat(obj.args);

                                Cinema6Service[obj.method].apply(null, args)
                                    .then(successSpy, errorSpy);
                            });

                            it('should resolve the promise if successful', function() {
                                var data = {id: '123', prop: 'yup'};

                                _deferreds[obj.method].resolve(data);

                                $rootScope.$digest();

                                expect(successSpy).toHaveBeenCalledWith(data);
                                expect(errorSpy).not.toHaveBeenCalled();
                            });

                            it('should reject the promise if it times out', function() {
                                $timeout.flush();

                                expect(errorSpy).toHaveBeenCalledWith('Request timed out.');
                                expect(successSpy).not.toHaveBeenCalled();
                            });

                            it('should reject the promise if call fails', function() {
                                _deferreds[obj.method].reject();

                                $rootScope.$digest();

                                expect(errorSpy).toHaveBeenCalledWith('Unable to locate failed');
                                expect(successSpy).not.toHaveBeenCalledWith();
                            });
                        });
                    });
                });
            });
        });
    });
}());