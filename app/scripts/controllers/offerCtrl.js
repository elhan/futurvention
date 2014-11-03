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
    app.controller('OfferCtrl', ['$scope', 'offer', 'ReviewSvc', 'UserSvc', 'PortfolioSvc', 'CatalogueSvc', '$modal', function ($scope, offer, ReviewSvc, UserSvc, PortfolioSvc, CatalogueSvc, $modal) {
        $scope.reviews = [];
        $scope.portfolio = {};
        $scope.service = {};
        $scope.offer = offer;

        var contactModal = $modal({
            scope: $scope,
            template: 'views/components/modalContactUser.html',
            show: false,
            animation: 'am-slide-top',
            keyboard: false
        });

        // this is necessary for ng-repeat to iterate over
        $scope.range = function (rating) {
            return _.range(0, rating);
        };

        $scope.showContactModal = function () {
            contactModal.$promise.then(contactModal.show);
        };

        $scope.closeContactModal = function () {
            contactModal.$promise.then(contactModal.hide);
        };

        //TODO: remove
        $scope.user = UserSvc.User('Mark','Twain');

        PortfolioSvc.fetchPortfolio($scope.user.userId).then(function (portfolio) {
            PortfolioSvc.updatePortfolio(portfolio);
            $scope.portfolio = PortfolioSvc.getPortfolio();
        }, function (error) {
            console.log(error);
        });

        ReviewSvc.fetchReceivedReviews($scope.user.userId).then(function (reviews) {
            $scope.reviews = reviews;
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
