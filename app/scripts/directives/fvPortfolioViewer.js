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
    app.directive('fvPortfolioViewer', ['PortfolioSvc', function (PortfolioSvc) {
        var gallerySize = 7; // the max number of gallery items in view
        return {
            restrict: 'E',
            scope: true,
            templateUrl: 'views/directives/fv-portfolio-viewer.html',
            link: function (scope) {
                // make sure this has been fetched from the server before compiling the directive
                scope.portfolio = PortfolioSvc.getPortfolio();

                scope.showcasePrev = function () {
                    if (scope.showcaseIndex > 0) {
                        scope.showcaseIndex -= 1;
                    }
                };

                scope.showcaseNext = function () {
                    if (scope.showcaseIndex < scope.portfolio.items.length - 1) {
                        scope.showcaseIndex += 1;
                    }
                };

                scope.goToShowcaseItem = function (index) {
                    scope.showcaseIndex = index;
                };

                // update gallery index if needed
                scope.$watch('showcaseIndex', function (newValue, oldValue) {
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