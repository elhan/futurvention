(function () {
    'use strict';

    var app = angular.module('fvApp');

    /**
     * @ngdoc directive
     * @name fvApp.directive: fv-showcase-thumb
     * @restrict E
     *
     * @description
     * Creates a custom showcase thumbnail element.
     *
     * @example
     * <fv-showcase-thumb></fv-showcase-thumb>
     */
    app.directive('fvShowcaseThumb', function () {
//        var gallerySize = 7; // the max number of gallery items in view
        return {
            restrict: 'E',
            scope: true,
            templateUrl: 'views/directives/fv-showcase-thumb.html',
            link: function (scope, elem, attrs) {
                scope.showcase = attrs.showcase;
            }
        };
    });

}());
