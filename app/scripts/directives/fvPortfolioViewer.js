(function () {
    'use strict';

    var app = angular.module('fvApp');

    /**
     * @ngdoc directive
     * @name fvApp.directive: fv-portfolio-viewer
     * @restrict E
     *
     * @description
     * Creates a custom portfolio viewer element.
     *
     * @example
     * <fv-portfolio-viewer></fv-portfolio-viewer>
     */
    app.directive('fvPortfolioViewer', ['Odata', 'PortfolioSvc', function (odata, PortfolioSvc) {
        var gallerySize = 7; // the max number of gallery items in view
        return {
            restrict: 'E',
            scope: {
                fvHideGallery: '@',
                showcaseIndex: '='
            },
            templateUrl: 'views/directives/fv-portfolio-viewer.html',
            link: function (scope) {

                scope.viewerIndex = parseInt(scope.showcaseIndex);
                scope.galleryIndex = parseInt(scope.showcaseIndex);

                // make sure this has been fetched from the server before compiling the directive
                scope.showcases = PortfolioSvc.getPortfolio();

                scope.showcaseItems = [];

                scope.showcasePrev = function () {
                    if (scope.viewerIndex > 0) {
                        scope.viewerIndex -= 1;
                    }
                };

                scope.showcaseNext = function () {
                    if (scope.viewerIndex < scope.showcases.length - 1) {
                        scope.viewerIndex += 1;
                    }
                };

                scope.goToShowcaseItem = function (index) {
                    scope.viewerIndex = index;
                };

                _.each(scope.showcases, function (sc) {
                    scope.showcaseItems.push(new odata.ShowcaseItem(sc.Items[0]));
                });

                // update gallery index if needed
                scope.$watch('viewerIndex', function (newValue, oldValue) {
                    if (newValue >= gallerySize && newValue > oldValue) {
                        scope.galleryIndex += 1;
                    }

                    if (newValue > 0 && newValue < oldValue) {
                        scope.galleryIndex -= 1;
                    }
                });
            }
        };
    }]);

}());
