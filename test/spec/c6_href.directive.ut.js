(function() {
    'use strict';

    define(['app'], function() {
        describe('c6-href=""', function() {
            var $rootScope,
                $compile,
                $scope,
                $location,
                $button;

            beforeEach(function() {
                module('c6.proshop');

                inject(function($injector) {
                    $rootScope = $injector.get('$rootScope');
                    $compile = $injector.get('$compile');
                    $location = $injector.get('$location');

                    spyOn($location, 'path');

                    $scope = $rootScope.$new();
                });

                $scope.$apply(function() {
                    $button = $compile('<input c6-href="/home" type="button">')($scope);
                });
                $('body').append($button);
            });

            afterEach(function() {
                $button.remove();
            });

            describe('when a user clicks the button', function() {
                it('should take them to the path defined', function() {
                    $button.click();

                    expect($location.path).toHaveBeenCalledWith('/home');
                });
            });
        });
    });
}());