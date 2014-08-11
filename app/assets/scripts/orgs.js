define(['account'],function(account) {
    'use strict';

    return angular.module('c6.proshop.orgs',[account.name])
        .controller('OrgsController', ['$scope', '$log', 'account', 'ConfirmDialogService',
        function                      ( $scope ,  $log,   account ,  ConfirmDialogService ) {
            var self = this,
                data = $scope.data,
                bindBrandToName = true;

            $log = $log.context('OrgsCtrl');
            $log.info('instantiated');

            function updateOrgs(orgs) {
                data.appData.orgs = orgs;
                data.orgs = orgs;
            }

            function convertNameToBrand(name) {
                return name.toLowerCase().split(',')[0].replace(/ /g, '_');
            }

            $scope.embedSizePattern  = /^\d+(px|%)$/;

            $scope.tableHeaders = [
                {label:'Name',value:'name'},
                {label:'Branding',value:'branding'},
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

            self.defaultModes = [
                {label:'Embedded',value:'light'},
                {label:'Lightbox, with Companion',value:'lightbox-ads'},
                {label:'Lightbox, without Companion',value:'lightbox'}
            ];

            self.action = 'all';

            Object.defineProperties($scope, {
                optionsMessage: {
                    get: function() {
                        return this.showOptions ? 'Hide Options' : 'More Options';
                    }
                },
                validVideoWaterfalls: {
                    get: function() {
                        return !!data.org._data.videoWaterfalls.filter(function(option) {
                            return option.enabled;
                        }).length;
                    }
                },
                validDisplayWaterfalls: {
                    get: function() {
                        return !!data.org._data.displayWaterfalls.filter(function(option) {
                            return option.enabled;
                        }).length;
                    }
                },
                validEmbedTypes: {
                    get: function() {
                        return !!data.org._data.config.minireelinator.embedTypes.filter(function(option) {
                            return option.enabled;
                        }).length;
                    }
                },
                validEmbedSize: {
                    get: function() {
                        var size = data.org.config.minireelinator.embedDefaults.size,
                            validSize;

                        if (size) {
                            validSize = (!!size.width && !!size.height) ||
                                (!size.width && !size.height);
                        }

                        return !size || validSize;
                    }
                }
            });

            self.formIsValid = function() {
                return $scope.validEmbedSize &&
                    $scope.validEmbedTypes &&
                    $scope.validDisplayWaterfalls &&
                    $scope.validVideoWaterfalls;
            };

            self.editOrg = function(org){
                $scope.message = null;
                self.action = 'edit';
                data.users = null;
                data.org = account.convertOrgForEditing(org);

                account.getUsers(org)
                    .then(function(users) {
                        data.users = users;
                    });
            };

            self.addNewOrg = function() {
                $scope.message = null;
                self.action = 'new';
                data.users = null;
                data.org = account.convertOrgForEditing();
            };

            self.deleteOrg = function() {
                $log.info('deleting user: ', data.org);

                if (data.users) {
                    $scope.message = 'You must delete or move the Users belonging to this Org before deleting it.';
                    return;
                }

                account.deleteOrg(data.org)
                    .then(function() {
                        $scope.message = 'Successfully deleted org: ' + data.org.name;
                        account.getOrgs().then(updateOrgs);
                        self.action = 'all';
                    }, function(err) {
                        $log.error(err);
                        $scope.message = 'There was a problem deleting this org.';
                    });
            };

            self.sortOrgs = function(/*field*/) {
                // There will be something in the UI to allow sorting the list
                // return account.getOrgs(field).then(updateOrgs);
            };

            self.filterData = function() {
                var query = data.query.toLowerCase();

                data.orgs = data.appData.orgs.filter(function(org) {
                    return org.name.toLowerCase().indexOf(query) >= 0;
                });
            };

            self.saveOrg = function() {
                function handleError(err) {
                    $log.error(err);
                    ConfirmDialogService.display({
                        prompt: 'There was a problem saving the org.',
                        affirm: 'OK',
                        onAffirm: function() {
                            ConfirmDialogService.close();
                        }
                    });
                }

                function handleSuccess(org) {
                    $log.info('saved org: ', org);
                    $scope.message = 'Successfully saved org: ' + org.name;
                    account.getOrgs().then(updateOrgs);
                    self.action = 'all';
                }

                if (data.org.id) {
                    account.putOrg(data.org)
                        .then(handleSuccess, handleError);
                } else {
                    account.postOrg(data.org)
                        .then(handleSuccess, handleError);
                }
            };

            self.disableBrandBinding = function() {
                bindBrandToName = false;
            };

            $scope.$watch(function() {return data.org && data.org.name;}, function(newName) {
                if (newName && bindBrandToName && self.action === 'new') {
                    data.org.branding = convertNameToBrand(newName);
                }
            });

            account.getOrgs().then(updateOrgs);

        }])

        .directive('allOrgs', [ function ( ) {
            return {
                restrict: 'E',
                templateUrl: 'views/orgs/orgs_all.html',
                link: function(/*scope, element, attrs, ctrl*/) {
                    // can move any DOM stuff from Ctrl into here...
                }
            };
        }])

        .directive('newOrg', [ function ( ) {
            return {
                restrict: 'E',
                templateUrl: 'views/orgs/org_edit.html',
                link: function(/*scope, element, attrs, ctrl*/) {
                    // can move any DOM stuff from Ctrl into here...
                }
            };
        }])

        .directive('editOrg', [ function ( ) {
            return {
                restrict: 'E',
                templateUrl: 'views/orgs/org_edit.html',
                link: function(/*scope, element, attrs, ctrl*/) {
                    // can move any DOM stuff from Ctrl into here...
                }
            };
        }]);
});
