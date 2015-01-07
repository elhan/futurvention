(function () {
    'use strict';

    var app = angular.module('fvApp');

    /**
     * @ngdoc directive
     * @name fvApp.directive: fv-portfolio-viewer-item
     * @restrict E
     *
     * @description
     * Creates a custom showcase item element.
     *
     * @example
     * <fv-portfolio-viewer-item></fv-portfolio-viewer-item>
     */
    app.directive('fvPortfolioViewerItem', ['$sce', 'FILE_TYPE_CONFIG', 'PATHS', 'Odata', function ($sce, fileTypeConfig, paths, odata) {
        return {
            restrict: 'E',
            scope: true,
            templateUrl: 'views/directives/fv-portfolio-viewer-item.html',
            link: function (scope) {

                if (!scope.showcase) {
                    return;
                }

                scope.link = null;

                scope.item = new odata.ShowcaseItem(scope.showcase.Items[0]);

                switch (true) {
                case scope.item.File.hasOwnProperty('EmbedCode'):
                    scope.type = 'embedCode';
                    scope.trustedPlayer = $sce.trustAsHtml(scope.item.File.EmbedCode);
                    break;
                case scope.item.File.hasOwnProperty('RelativeUrl'):
                    scope.link = scope.item.getFileLink();
                    scope.type = _.find(fileTypeConfig, function (conf) {
                        return conf.ID === scope.item.File.MimeTypeID;
                    }).Viewer;
                    break;
                default: // absoluteUrl - camera tag files
                    scope.link = scope.item.File.AbsoluteUrl;
                    scope.type = _.find(fileTypeConfig, function (conf) {
                        return conf.ID === scope.item.File.MimeTypeID;
                    }).Viewer;
                }
            }
        };
    }]);

}());
