define(['account','content'],function(account,content) {
    'use strict';

    return angular.module('c6.proshop.minireels',[account.name,content.name])
        .controller('MinireelsController', ['$scope','$log','account','content',
        function                           ( $scope , $log , account , content ) {
            var self = this,
                data = $scope.data;

            function updateOrgs(orgs) {
                data.appData.orgs = orgs;
                data.orgs = orgs;
            }

            $scope.tableHeaders = [
                {label:'Choose an Org to view Minireels',value:'name'},
                {label:'Status',value:'status'},
                {label:'Tag',value:'tag'},
                {label:'Min Ad Count',value:'minAdCount'}
            ];

            $scope.experienceTableHeaders = [
                {label:'Title',value:'title'},
                {label:'Mode',value:'data.mode'},
                {label:'User',value:'user.email'},
                {label:'# of Cards',value:'data.deck.length'},
                {label:'Status',value:'status'}
            ];

            $scope.sort = {
                column: 'name',
                descending: false
            };

            $scope.doSort = function(column) {
                var sort = $scope.sort;
                if (sort.column === column) {
                    sort.descending = !sort.descending;
                } else {
                    sort.column = column;
                    sort.descending = false;
                }
            };

            self.action = 'orgs';

            self.filterData = function() {
                var query = data.query.toLowerCase();

                data.orgs = data.appData.orgs.filter(function(org) {
                    return org.name.toLowerCase().indexOf(query) >= 0;
                });
            };

            self.filterExperiences = function() {
                var query = data.query.toLowerCase();

                data.experiences = data.appData.experiences.filter(function(exp) {
                    return exp.title.toLowerCase().indexOf(query) >= 0;
                });
            };

            self.getExperiences = function(org) {
                content.getExperiencesByOrg(org.id)
                    .then(function(experiences) {
                        self.action = 'experiences';
                        data.query = null;
                        data.appData.experiences = experiences;
                        data.experiences = experiences;

                        experiences.forEach(function(exp) {
                            account.getUser(exp.user)
                                .then(function(user) {
                                    exp.user = user;
                                });
                        });
                    });
            };

            self.startExperienceCopy = function(exp) {
                self.action = 'copy';
                data.experience = content.convertExperienceForCopy(angular.copy(exp));
            };

            account.getOrgs().then(updateOrgs);
        }])

        .directive('minireelsOrgs', [ function ( ) {
            return {
                restrict: 'E',
                templateUrl: 'views/minireels_orgs.html',
                link: function(/*scope, element, attrs, ctrl*/) {
                    // can move any DOM stuff from Ctrl into here...
                }
            };
        }])

        .directive('minireelsExperiences', [ function ( ) {
            return {
                restrict: 'E',
                templateUrl: 'views/minireels_experiences.html',
                link: function(/*scope, element, attrs, ctrl*/) {
                    // can move any DOM stuff from Ctrl into here...
                }
            };
        }])

        .directive('minireelsCopy', [ function ( ) {
            return {
                restrict: 'E',
                templateUrl: 'views/minireels_copy.html',
                link: function(/*scope, element, attrs, ctrl*/) {
                    // can move any DOM stuff from Ctrl into here...
                }
            };
        }]);
});