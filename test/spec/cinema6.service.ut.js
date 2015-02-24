(function() {
    'use strict';

    define(['app'], function(proshop) {
        describe('Cinema6Service', function() {
            var $rootScope,
                $q,
                $timeout,
                $http;

            var Cinema6Service,
                Cinema6ServiceProvider,
                ContentAdapter,
                ContentAdapterInjectable,
                UserAdapter,
                UserAdapterInjectable;

            var adapters = {};

            function createAdapter(name) {
                return jasmine.createSpy(name)
                    .and.callFake(function($http, $q) {
                        this._deferreds = {
                            get: $q.defer(),
                            getAll: $q.defer(),
                            put: $q.defer(),
                            post: $q.defer(),
                            delete: $q.defer()
                        };

                        this.get = jasmine.createSpy(name + '.get()')
                            .and.returnValue(this._deferreds.get.promise);

                        this.getAll = jasmine.createSpy(name + '.getAll()')
                            .and.returnValue(this._deferreds.getAll.promise);

                        this.put = jasmine.createSpy(name + '.put()')
                            .and.returnValue(this._deferreds.put.promise);

                        this.post = jasmine.createSpy(name + '.post()')
                            .and.returnValue(this._deferreds.post.promise);

                        this.delete = jasmine.createSpy(name + '.delete()')
                            .and.returnValue(this._deferreds.delete.promise);

                        adapters[name] = this;
                    });
            }

            beforeEach(function() {
                ContentAdapter = createAdapter('ContentAdapter');
                UserAdapter = createAdapter('UserAdapter');

                ContentAdapterInjectable = ['$http', '$q', ContentAdapter];
                UserAdapterInjectable = ['$http', '$q', UserAdapter];

                module(proshop.name, function($injector) {
                    Cinema6ServiceProvider = $injector.get('Cinema6ServiceProvider');

                    Cinema6ServiceProvider.useAdapters({
                        content: ContentAdapterInjectable,
                        user: UserAdapterInjectable
                    });
                });

                inject(function($injector) {
                    $rootScope = $injector.get('$rootScope');
                    $q = $injector.get('$q');
                    $http = $injector.get('$http');
                    $timeout = $injector.get('$timeout');
                });
            });

            describe('initialization', function() {
                it('should exist', function() {
                    inject(function($injector) {
                        Cinema6Service = $injector.get('Cinema6Service');
                    });

                    expect(Cinema6Service).toEqual(jasmine.any(Object));
                });
            });

            describe('instantiating adapters', function() {
                it('should instantiate adapters as they are needed', function() {
                    inject(function($injector) {
                        Cinema6Service = $injector.get('Cinema6Service');
                    });

                    Cinema6Service.get('content', 'e-111');

                    expect(ContentAdapter).toHaveBeenCalledWith($http, $q);
                    expect(UserAdapter).not.toHaveBeenCalled();

                    Cinema6Service.get('user', 'u-111');

                    expect(UserAdapter).toHaveBeenCalledWith($http, $q);
                });

                it('should only instantiate the adapter once', function() {
                    var _$injector;

                    inject(function($injector) {
                        Cinema6Service = $injector.get('Cinema6Service');

                        _$injector = $injector;
                        spyOn(_$injector, 'instantiate').and.callThrough();
                    });

                    expect(_$injector.instantiate.calls.count()).toBe(0);

                    Cinema6Service.get('content', 'e-111');
                    Cinema6Service.get('content', 'e-112');
                    Cinema6Service.get('content', 'e-113');

                    expect(_$injector.instantiate.calls.count()).toBe(1);
                });

                it('should handle attempts to instantiate undefined adapters', function() {
                    var successSpy = jasmine.createSpy('success'),
                        errorSpy = jasmine.createSpy('error');

                    inject(function($injector) {
                        Cinema6Service = $injector.get('Cinema6Service');
                    });

                    Cinema6Service.get('bad', 'b-111')
                        .then(successSpy, errorSpy);

                    $rootScope.$digest();

                    expect(errorSpy).toHaveBeenCalledWith('Unable to resolve request');
                    expect(successSpy).not.toHaveBeenCalled();
                });
            });

            describe('methods', function() {
                var successSpy, errorSpy;

                beforeEach(function() {
                    successSpy = jasmine.createSpy('success');
                    errorSpy = jasmine.createSpy('error');

                    inject(function($injector) {
                        Cinema6Service = $injector.get('Cinema6Service');
                    });
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
                                goodArgs = ['content'].concat(obj.args);

                            expect(Cinema6Service[obj.method].apply(null, badArgs).then).toBeDefined();
                            expect(Cinema6Service[obj.method].apply(null, goodArgs).then).toBeDefined();
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
                                args = ['content'].concat(obj.args);

                                Cinema6Service[obj.method].apply(null, args)
                                    .then(successSpy, errorSpy);
                            });

                            it('should resolve the promise if successful', function() {
                                var data = {id: '123', prop: 'yup'};

                                adapters.ContentAdapter._deferreds[obj.method].resolve(data);

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
                                adapters.ContentAdapter._deferreds[obj.method].reject();

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