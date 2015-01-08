(function () {
    'use strict';

    var app = angular.module('fvApp');

    /**
     * @ngdoc directive
     * @name fvApp.directive: fv-portfolio-viewer-thumb
     * @restrict E
     *
     * @description
     * Creates a custom showcase thumbnail element.
     *
     * @example
     * <fv-portfolio-viewer-thumb></fv-portfolio-viewer-thumb>
     */
    app.directive('fvPortfolioViewerThumb', ['Odata', function (odata) {
        return {
            restrict: 'E',
            scope: {
                showcase: '=',
                caption: '@'
            },
            templateUrl: 'views/directives/fv-portfolio-viewer-thumb.html',
            link: function (scope) {
                var item = new odata.ShowcaseItem(scope.showcase.Items[0]);
                scope.thumbnailLink = item.getThumbnail();
            }
        };
    }]);

}());
