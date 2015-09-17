define(['angular'], function(angular) {
    'use strict';

    var noop = angular.noop;

    function pick(prop) {
        return function(object) {
            return object[prop];
        };
    }

    function fillMeta(response) {
        response.meta = {
            items: response.headers('Content-Range')
                .match(/\d+/g)
                .map(function(num, index) {
                    return [this[index], parseInt(num)];
                }, ['start', 'end', 'total'])
                .reduce(function(obj, pair) {
                    obj[pair[0]] = pair[1];
                    return obj;
                }, {})
        };

        return response;
    }

    function getObjectByProp(prop, value, array) {
        return array.filter(function(obj) {
            return obj[prop] === value;
        })[0];
    }

    return angular.module('c6.proshop.services', [])
        .service('CategoryService', ['$http','$q','c6UrlMaker',
        function                    ( $http , $q , c6UrlMaker ) {
            var apiBase = c6UrlMaker('content/category', 'api');

            function handleError(err) {
                return $q.reject((err && err.data) || 'Unable to complete request');
            }

            this.get = function(id) {
                return $http({
                    method: 'GET',
                    url: apiBase + '/' + id,
                    cache: true
                }).then(
                    pick('data'),
                    handleError
                );
            };

            this.getAll = function(params) {
                return $http({
                    method: 'GET',
                    url: apiBase.slice(0,-1) + 'ies',
                    params: params || {}
                }).then(
                    fillMeta,
                    handleError
                );
            };

            this.put = function(id, model) {
                return $http({
                    method: 'PUT',
                    url: apiBase + '/' + id,
                    data: model
                }).then(
                    pick('data'),
                    handleError
                );
            };

            this.post = function(model) {
                return $http({
                    method: 'POST',
                    url: apiBase,
                    data: model
                }).then(
                    pick('data'),
                    handleError
                );
            };

            this.delete = function(id) {
                return $http({
                    method: 'DELETE',
                    url: apiBase + '/' + id
                }).then(
                    pick('data'),
                    handleError
                );
            };
        }])

        .service('CustomerService', ['$http','$q','c6UrlMaker','AdvertiserService',
        function                    ( $http , $q , c6UrlMaker , AdvertiserService ) {
            var apiBase = c6UrlMaker('account/customer', 'api');

            function handleError(err) {
                return $q.reject((err && err.data) || 'Unable to complete request');
            }

            function decorateCustomer(customer) {
                var deferred = $q.defer(),
                    ids = customer.advertisers.join();

                AdvertiserService.getAll({ids: ids})
                    .then(function(advertisers) {
                        customer.advertisers = advertisers.data;
                        deferred.resolve(customer);
                    })
                    .catch(function(err) {
                        deferred.reject(err);
                    });

                return deferred.promise;
            }

            function decorateCustomers(customers) {
                var deferred = $q.defer(),
                    ids = customers.data.reduce(function(result, customer) {
                        return result.concat(customer.advertisers);
                    }, [])
                    .filter(function(id, index, ids) {
                        return ids.indexOf(id) === index;
                    }).join();

                AdvertiserService.getAll({ids: ids})
                    .then(pick('data'))
                    .then(function(advertisers) {
                        customers.data.forEach(function(customer) {
                            customer.advertisers = customer.advertisers.map(function(id) {
                                return getObjectByProp('id', id, advertisers);
                            });
                        });
                        deferred.resolve(customers);
                    })
                    .catch(function(err) {
                        deferred.reject(err);
                    });

                return deferred.promise;
            }

            this.get = function(id) {
                return $http({
                    method: 'GET',
                    url: apiBase + '/' + id,
                    cache: true
                }).then(pick('data'))
                    .then(decorateCustomer)
                    .catch(handleError);
            };

            this.getAll = function(params) {
                return $http({
                    method: 'GET',
                    url: apiBase + 's',
                    params: params || {}
                }).then(fillMeta)
                    .then(decorateCustomers)
                    .catch(handleError);
            };

            this.put = function(id, model) {
                return $http({
                    method: 'PUT',
                    url: apiBase + '/' + id,
                    data: model
                }).then(
                    pick('data'),
                    handleError
                );
            };

            this.post = function(model) {
                return $http({
                    method: 'POST',
                    url: apiBase,
                    data: model
                }).then(
                    pick('data'),
                    handleError
                );
            };

            this.delete = function(id) {
                return $http({
                    method: 'DELETE',
                    url: apiBase + '/' + id
                }).then(
                    pick('data'),
                    handleError
                );
            };
        }])

        .service('AdvertiserService', ['$http','$q','c6UrlMaker',
        function                      ( $http , $q , c6UrlMaker ) {
            var apiBase = c6UrlMaker('account/advertiser', 'api');

            function handleError(err) {
                return $q.reject((err && err.data) || 'Unable to complete request');
            }

            this.get = function(id) {
                return $http({
                    method: 'GET',
                    url: apiBase + '/' + id,
                    cache: true
                }).then(
                    pick('data'),
                    handleError
                );
            };

            this.getAll = function(params) {
                return $http({
                    method: 'GET',
                    url: apiBase + 's',
                    params: params || {}
                }).then(
                    fillMeta,
                    handleError
                );
            };

            this.put = function(id, model) {
                return $http({
                    method: 'PUT',
                    url: apiBase + '/' + id,
                    data: model
                }).then(
                    pick('data'),
                    handleError
                );
            };

            this.post = function(model) {
                return $http({
                    method: 'POST',
                    url: apiBase,
                    data: model
                }).then(
                    pick('data'),
                    handleError
                );
            };

            this.delete = function(id) {
                return $http({
                    method: 'DELETE',
                    url: apiBase + '/' + id
                }).then(
                    pick('data'),
                    handleError
                );
            };
        }])

        .service('PolicyService', ['$http','$q','c6UrlMaker','content',
        function                  ( $http , $q , c6UrlMaker , content ) {
            var apiBase = c6UrlMaker('account/policies', 'api');

            function decoratePolicy(policy) {
                var deferred = $q.defer(),
                    apps = (policy.applications || []).toString();

                if (apps) {
                    content.getExperiences({ids: apps})
                        .then(function(exps) {
                            policy.applications = exps;
                            deferred.resolve(policy);
                        })
                        .catch(function() {
                            policy.applications = [];
                            deferred.reject();
                        });
                } else {
                    deferred.resolve(policy);
                }

                return deferred.promise;
            }

            // function decoratePolicies(policies) {
            //     var deferred = $q.defer();

            //     $q.all(policies.data.map(decoratePolicy))
            //         .then(function(decoratedPolicies) {
            //             policies.data = decoratedPolicies;
            //             deferred.resolve(policies);
            //         })
            //         .catch(function() {
            //             deferred.reject();
            //         });

            //     return deferred.promise;
            // }

            function undecoratePolicy(policy) {
                delete policy.id;

                policy.applications = (policy.applications || []).map(function(app) {
                    return app.id;
                });

                return $q.when(policy);
            }

            function handleError(err) {
                return $q.reject((err && err.data) || 'Unable to complete request');
            }

            this.get = function(id) {
                return $http({
                    method: 'GET',
                    url: apiBase + '/' + id,
                    cache: true
                }).then(pick('data'))
                .then(decoratePolicy)
                .catch(handleError);
            };

            this.getAll = function(params) {
                return $http({
                    method: 'GET',
                    url: apiBase,
                    params: params || {}
                }).then(fillMeta)
                // .then(decoratePolicies)
                .catch(handleError);
            };

            this.put = function(id, model) {
                return undecoratePolicy(model)
                    .then(function(policy) {
                        return $http({
                            method: 'PUT',
                            url: apiBase + '/' + id,
                            data: policy
                        });
                    }).then(
                        pick('data'),
                        handleError
                    );
            };

            this.post = function(model) {
                return undecoratePolicy(model)
                    .then(function(policy) {
                        return $http({
                            method: 'POST',
                            url: apiBase,
                            data: policy
                        });
                    }).then(
                        pick('data'),
                        handleError
                    );
            };

            this.delete = function(id) {
                return $http({
                    method: 'DELETE',
                    url: apiBase + '/' + id
                }).then(
                    pick('data'),
                    handleError
                );
            };
        }])

        .service('RoleService', ['$http','$q','c6UrlMaker',
        function                ( $http , $q , c6UrlMaker ) {
            var apiBase = c6UrlMaker('account/roles', 'api');

            function handleError(err) {
                return $q.reject((err && err.data) || 'Unable to complete request');
            }

            this.get = function(id) {
                return $http({
                    method: 'GET',
                    url: apiBase + '/' + id,
                    cache: true
                }).then(
                    pick('data'),
                    handleError
                );
            };

            this.getAll = function(params) {
                return $http({
                    method: 'GET',
                    url: apiBase,
                    params: params || {}
                }).then(
                    fillMeta,
                    handleError
                );
            };

            this.put = function(id, model) {
                return $http({
                    method: 'PUT',
                    url: apiBase + '/' + id,
                    data: model
                }).then(
                    pick('data'),
                    handleError
                );
            };

            this.post = function(model) {
                return $http({
                    method: 'POST',
                    url: apiBase,
                    data: model
                }).then(
                    pick('data'),
                    handleError
                );
            };

            this.delete = function(id) {
                return $http({
                    method: 'DELETE',
                    url: apiBase + '/' + id
                }).then(
                    pick('data'),
                    handleError
                );
            };
        }])

        .service('UserService', ['$http','$q','c6UrlMaker','OrgService',
        function                ( $http , $q , c6UrlMaker , OrgService ) {
            var apiBase = c6UrlMaker('account/user', 'api');

            function decorateUser(user) {
                var deferred = $q.defer(),
                    id = user.org;

                OrgService.get(id)
                    .then(function(org) {
                        user.org = org;
                        deferred.resolve(user);
                    })
                    .catch(function(err) {
                        deferred.reject(err);
                    });

                return deferred.promise;
            }

            function decorateUsers(users) {
                var deferred = $q.defer();

                $q.all(users.data.map(decorateUser))
                    .then(function(decoratedUsers) {
                        users.data = decoratedUsers;
                        deferred.resolve(users);
                    })
                    .catch(function() {
                        deferred.reject();
                    });

                return deferred.promise;
            }

            function handleError(err) {
                return $q.reject((err && err.data) || 'Unable to complete request');
            }

            this.get = function(id) {
                return $http({
                    method: 'GET',
                    url: apiBase + '/' + id,
                    cache: true
                }).then(pick('data'))
                .then(decorateUser)
                .catch(handleError);
            };

            this.getAll = function(params) {
                return $http({
                    method: 'GET',
                    url: apiBase + 's',
                    params: params || {}
                }).then(fillMeta)
                .then(decorateUsers)
                .catch(handleError);
            };

            this.put = function(id, model) {
                return $http({
                    method: 'PUT',
                    url: apiBase + '/' + id,
                    data: model
                }).then(
                    pick('data'),
                    handleError
                );
            };

            this.post = function(model) {
                return $http({
                    method: 'POST',
                    url: apiBase,
                    data: model
                }).then(
                    pick('data'),
                    handleError
                );
            };

            this.delete = function(id) {
                return $http({
                    method: 'DELETE',
                    url: apiBase + '/' + id
                }).then(
                    pick('data'),
                    handleError
                );
            };

            this.logout = function(id) {
                return $http({
                    method: 'POST',
                    url: c6UrlMaker('account/user/logout/' + id, 'api')
                });
            };
        }])

        .service('OrgService', ['$http','$q','c6UrlMaker',
        function               ( $http , $q , c6UrlMaker ) {
            var apiBase = c6UrlMaker('account/org', 'api');

            function handleError(err) {
                return $q.reject((err && err.data) || 'Unable to complete request');
            }

            this.get = function(id) {
                return $http({
                    method: 'GET',
                    url: apiBase + '/' + id,
                    cache: true
                }).then(
                    pick('data'),
                    handleError
                );
            };

            this.getAll = function(params) {
                return $http({
                    method: 'GET',
                    url: apiBase + 's',
                    params: params || {}
                }).then(
                    fillMeta,
                    handleError
                );
            };

            this.put = function(id, model) {
                return $http({
                    method: 'PUT',
                    url: apiBase + '/' + id,
                    data: model
                }).then(
                    pick('data'),
                    handleError
                );
            };

            this.post = function(model) {
                return $http({
                    method: 'POST',
                    url: apiBase,
                    data: model
                }).then(
                    pick('data'),
                    handleError
                );
            };

            this.delete = function(id) {
                return $http({
                    method: 'DELETE',
                    url: apiBase + '/' + id
                }).then(
                    pick('data'),
                    handleError
                );
            };
        }])

        .service('Cinema6Service', ['requestWrapper','CategoryService','CustomerService','AdvertiserService',
                                    'PolicyService','RoleService','UserService','OrgService',
        function                   ( requestWrapper , CategoryService , CustomerService , AdvertiserService ,
                                     PolicyService , RoleService , UserService , OrgService ) {
            var services = {
                    categories: CategoryService,
                    customers: CustomerService,
                    advertisers: AdvertiserService,
                    policies: PolicyService,
                    roles: RoleService,
                    users: UserService,
                    orgs: OrgService
                },
                noopService = {
                    get: noop,
                    getAll: noop,
                    put: noop,
                    post: noop,
                    delete: noop
                };

            function getService(type) {
                return services[type] || noopService;
            }

            this.get = function(type, id) {
                return requestWrapper(getService(type).get(id));
            };

            this.getAll = function(type, params) {
                return requestWrapper(getService(type).getAll(params));
            };

            this.put = function(type, id, model) {
                return requestWrapper(getService(type).put(id, model));
            };

            this.post = function(type, model) {
                return requestWrapper(getService(type).post(model));
            };

            this.delete = function(type, id) {
                return requestWrapper(getService(type).delete(id));
            };
        }])

        .service('AccountService', ['$http','$q','c6UrlMaker','requestWrapper','UserService',
        function                   ( $http , $q , c6UrlMaker , requestWrapper , UserService ) {
            function handleError(err) {
                return $q.reject((err && err.data) || 'Unable to complete request');
            }

            this.freezeUser = function(id) {
                // use requestWrapper so there's a nice timeout
                return requestWrapper($q.all([
                    UserService.put(id, { status: 'inactive' }),
                    UserService.logout(id)
                ])).catch(handleError);
            };

            this.changeEmail = function(email,password,newEmail) {
                return requestWrapper($http({
                    method: 'POST',
                    url: c6UrlMaker('account/user/email','api'),
                    data: {
                        email: email,
                        password: password,
                        newEmail: newEmail
                    }
                }));
            };

            this.changePassword = function(email,password,newPassword) {
                return requestWrapper($http({
                    method: 'POST',
                    url: c6UrlMaker('account/user/password','api'),
                    data: {
                        email: email,
                        password: password,
                        newPassword: newPassword
                    }
                }));
            };

            this.waterfallData = [];
            this.adConfig = {};
            this.defaultSplashOptions = [];
        }])

        .service('requestWrapper', ['$q','$timeout',
        function                   ( $q , $timeout ) {
            return function(promise) {
                var deferred = $q.defer(),
                    cancelTimeout;

                (promise || $q.reject('Unable to resolve request'))
                    .then(function(data) {
                        $timeout.cancel(cancelTimeout);
                        deferred.resolve(data);
                    }, function(err) {
                        if (!err) {
                            err = 'Unable to locate failed';
                        }
                        $timeout.cancel(cancelTimeout);
                        deferred.reject(err);
                    });

                cancelTimeout = $timeout(function() {
                    deferred.reject('Request timed out.');
                },30000);

                return deferred.promise;
            };
        }]);
});