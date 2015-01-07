(function () {
    'use strict';

    var app = angular.module('fvApp');

    /**
     * @ngdoc directive
     * @name fvApp.directive: fv-showcase-placeholder
     * @restrict E
     *
     * @description
     * For showcase items that do not have a thumbnail link, creates a placeholder that matches the item's file type.
     *
     * @example
     * <fv-showcase-placeholder item="showcaseItem"></fv-showcase-placeholder>
     */
    app.directive('fvShowcasePlaceholder', [function () {
        return {
            restrict: 'E',
            scope: {
                item: '='
            },
            templateUrl: 'views/directives/fv-showcase-placeholder.html'
        };
    }]);

}());
