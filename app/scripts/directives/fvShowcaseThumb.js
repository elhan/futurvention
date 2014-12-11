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
    app.directive('fvShowcaseThumb', ['Odata', function (odata) {
        return {
            restrict: 'E',
            scope: {
                showcase: '=',
                caption: '@'
            },
            templateUrl: 'views/directives/fv-showcase-thumb.html',
            link: function (scope) {
                var item = new odata.ShowcaseItem(scope.showcase.Items[0]);

                scope.thumbnailLink = '';

                switch (true) {
                case !item.hasOwnProperty('Thumbnail') || item.Thumbnail === null:
                    scope.thumbnailLink = 'images/thumb.png'; // TODO: add different thumbnails for different file types
                    break;
                case item.Thumbnail.hasOwnProperty('Url'):
                    scope.thumbnailLink = item.Thumbnail.Url;
                    break;
                case item.Thumbnail.hasOwnProperty('RelativeUrl'):
                    scope.thumbnailLink = item.getFileLink();
                    break;
                }
            }
        };
    }]);

}());
