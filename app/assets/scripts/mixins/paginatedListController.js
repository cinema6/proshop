define(['angular'], function(angular) {
    'use strict';

    var equals = angular.equals,
        extend = angular.extend;

    function PaginatedListController  ( $scope , scopePromise , Cinema6Service ) {
        var self = this,
            endpoint = $scope.endpoint;

        function toNum(bool) {
            return bool ? '1' : '-1';
        }

        function doQuery(query) {
            var data = scopePromise(
                    Cinema6Service.getAll(endpoint, query),
                    self.data
                );

            return data.ensureResolution();
        }

        function setPaginationValues(items) {
            var info = items.value.meta.items,
                limit = self.limit;

            self.total = Math.ceil(info.total / limit);

            return items.value;
        }

        function setData(response) {
            self.data = response.data;

            return response;
        }

        function fetch(query) {
            var page = self.page,
                limit = self.limit,
                text = self.query,
                sort = [
                    $scope.sort.column,
                    toNum($scope.sort.descending)
                ].join();

            self.loading = true;

            query = extend((query || {}), {
                limit: limit,
                skip: (page - 1) * limit,
                sort: sort
            });

            return doQuery(extend(query, (text ? {text: text} : {})))
                .then(setPaginationValues)
                .then(setData)
                .finally(function() {
                    self.loading = false;
                });
        }

        self.search = function(query) {
            self.query = query && query.replace(/[^a-zA-Z_0-9 ]/g, '');

            if (self.page !== 1) {
                /* jshint boss:true */
                return self.page = 1;
                /* jshint boss:false */
            }

            return self.query ? fetch({text: self.query}) : fetch();
        };

        self.doSort = function(heading) {
            var sort = $scope.sort,
                column = heading.value;

            if (!heading.sortable) { return; }

            if (sort.column === column) {
                sort.descending = !sort.descending;
            } else {
                sort.column = column;
                sort.descending = false;
            }

            if (self.page !== 1) {
                self.page = 1;
            } else {
                fetch();
            }
        };

        self.query = null;
        self.page = 1;
        self.total = 1;
        self.limit = 50;
        self.limits = [5,10,50];

        $scope.$watchCollection(
            function() {
                return [
                    self.page,
                    self.limit
                ];
            },
            function(props, prevProps) {
                var samePage = props[0] === prevProps[0];

                if (equals(props, prevProps)) { return; }

                if (self.page !== 1 && samePage) {
                    /* jshint boss:true */
                    return self.page = 1;
                    /* jshint boss:false */
                }

                return fetch();
            }
        );

        fetch();
    }

    PaginatedListController.$inject = ['$scope','scopePromise','Cinema6Service'];

    return PaginatedListController;
});