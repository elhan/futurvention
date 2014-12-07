(function () {
    'use strict';

    var app = angular.module('fvApp');

    /**
     * @ngdoc directive
     * @name fvApp.directive: fv-dynamic-icon
     * @restrict E
     *
     * @description
     * Creates a custom portfolio viewer element.
     *
     * @example
     * <fv-portfolio-viewer></fv-portfolio-viewer>
     */
    app.directive('fvDynamicIcon', function (PortfolioSvc) {
        return {
            restrict: 'E',
            scope: true,
            templateUrl: 'views/directives/fv-dynamic-icon.html',
            link: function (scope, elem, attrs) {
                scope.provider = attrs.provider;
            }
        };
    });

}());
