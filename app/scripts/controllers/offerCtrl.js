(function () {
    'use strict';

    var app = angular.module('fvApp');

    /**
     * @ngdoc Controller
     * @name fvApp.controller: OfferCtrl
     * @description
     * # OfferCtrl
     * Controls the Offer page
     */
    app.controller('OfferCtrl', ['$scope', 'offer', 'ReviewSvc', 'UserSvc', 'PortfolioSvc', 'CatalogueSvc', function ($scope, offer, ReviewSvc, UserSvc, PortfolioSvc, CatalogueSvc) {
        $scope.reviews = [];
        $scope.portfolio = {};
        $scope.service = {};
        $scope.offer = offer;

        //TODO: remove
        $scope.user = UserSvc.User('Mark','Twain');

        ReviewSvc.fetchReceivedReviews($scope.user.userId).then(function (reviews) {
            $scope.reviews = reviews;
        }, function (error) {
            console.log(error);
        });

        PortfolioSvc.fetchPortfolio($scope.user.userId).then(function (portfolio) {
            PortfolioSvc.updatePortfolio(portfolio);
            $scope.portfolio = PortfolioSvc.getPortfolio();
        }, function (error) {
            console.log(error);
        });

        CatalogueSvc.getService().then(function (service) {
            $scope.service = service;
        }, function (error) {
            console.log(error);
        });

    }]);
}());
