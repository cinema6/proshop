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

            self.page = ((info.start - 1) / limit) + 1;
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
                sort = [
                    $scope.sort.column,
                    toNum($scope.sort.descending)
                ].join();

            self.loading = true;

            return doQuery(extend((query || {}), {
                    limit: limit,
                    skip: (page - 1) * limit,
                    sort: sort
                }))
                .then(setPaginationValues)
                .then(setData)
                .finally(function() {
                    self.loading = false;
                });
        }

        self.search = function(query) {
            var text = query && query.replace(/[^a-zA-Z_0-9 ]/g, '');

            if (!query) { return; }

            if (self.page !== 1) {
                self.page = 1;
            } else {
                $scope.query = '';
            }

            fetch({text: text});
        };

        self.doSort = function(column) {
            var sort = $scope.sort;
            if (sort.column === column) {
                sort.descending = !sort.descending;
            } else {
                sort.column = column;
                sort.descending = false;
            }
            fetch();
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

                if ($scope.query) {
                    /* jshint boss:true */
                    return $scope.query = '';
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