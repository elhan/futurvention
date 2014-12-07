(function () {
    'use strict';

    var app = angular.module('fvApp');

    /**
     * @ngdoc directive
     * @name fvApp.directive: fv-showcase-item
     * @restrict E
     *
     * @description
     * Creates a custom showcase item element.
     *
     * @example
     * <fv-showcase-item></fv-showcase-item>
     */
    app.directive('fvShowcaseItem', ['FILE_TYPE_CONFIG', 'PATHS', 'Odata', function (fileTypeConfig, paths, odata) {
        return {
            restrict: 'E',
            scope: true,
            templateUrl: 'views/directives/fv-showcase-item.html',
            link: function (scope, elem, attrs) {

                if (!scope.showcase) {
                    return;
                }

                scope.item = new odata.ShowcaseItem(scope.showcase.Items[0]);

                scope.link = scope.item.getFileLink();

                scope.type = _.find(fileTypeConfig, function (conf) {
                    return conf.ID === scope.item.File.MimeTypeID;
                }).Viewer;

            }
        };
    }]);

}());
