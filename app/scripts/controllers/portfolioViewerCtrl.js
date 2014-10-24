(function () {
    'use strict';

    var app = angular.module('fvApp');

    /**
     * @ngdoc Controller
     * @name fvApp.controller: PortfolioViewerCtrl
     * @description
     * # PortfolioViewerCtrl
     * Controls the portfolio viewer modal
     */
    app.controller('PortfolioViewerCtrl', ['$scope', 'PortfolioSvc', function ($scope, PortfolioSvc) {
        var gallerySize = 8; // the max number of gallery items in view

        $scope.portfolio = PortfolioSvc.getPortfolio();

        $scope.showcasePrev = function () {
            if ($scope.showcaseIndex > 0) {
                $scope.showcaseIndex -= 1;
            }
        };

        $scope.showcaseNext = function () {
            if ($scope.showcaseIndex < $scope.portfolio.items.length - 1) {
                $scope.showcaseIndex += 1;
            }
        };

        $scope.goToShowcaseItem = function (index) {
            $scope.showcaseIndex = index;
        };

        // update gallery index if needed
        $scope.$watch('showcaseIndex', function (newValue, oldValue) {
            if (newValue >= gallerySize && newValue > oldValue) {
                $scope.galleryIndex += 1;
            }
            if (newValue > 0 && newValue < oldValue) {
                $scope.galleryIndex -= 1;
            }
        });
    }]);

}());
