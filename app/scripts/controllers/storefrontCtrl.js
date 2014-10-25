(function () {
    'use strict';

    var app = angular.module('fvApp');

    /**
     * @ngdoc Controller
     * @name fvApp.controller: StorefrontCtrl
     * @description
     * # StorefrontCtrl
     * Controls the storefront page
     */
    app.controller('StorefrontCtrl', ['$scope', '$modal', '$timeout', '$location', 'ProfileSvc', 'PortfolioSvc', 'OfferSvc', 'ReviewSvc', 'MessagingSvc', 'NotificationSvc', function ($scope, $modal, $timeout, $location, ProfileSvc, PortfolioSvc, OfferSvc, ReviewSvc, MessagingSvc, NotificationSvc) {

        var contactModal = $modal({
            scope: $scope,
            template: 'views/components/modalContactUser.html',
            show: false,
            animation: 'am-slide-top',
            keyboard: false
        });

        var portfolioViewerModal = $modal({
            scope: $scope,
            template: 'views/components/modalPortfolioViewer.html',
            show: false,
            animation: 'am-slide-top',
            keyboard: false
        });

        $scope.portfolio = PortfolioSvc.getPortfolio();
        $scope.profile = {};
        $scope.isCurrentUser = {};
        $scope.reviews = {};
        $scope.offers = [];
        $scope.message = '';
        $scope.sender = {
            firstName: '',
            lastName: '',
            email: '',
        };

        $scope.steps = ProfileSvc.getSteps();
        $scope.activeStep = $scope.steps[4];

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

        $scope.showPortfolioViewerModal = function () {
            portfolioViewerModal.$promise.then(portfolioViewerModal.show);
        };

        $scope.contactUser = function () {
            MessagingSvc.sendMessage($scope.userId, $scope.currentUser.id, $scope.sender.firstName, $scope.sender.lastName, $scope.message).then(function () {
                NotificationSvc.show({ content: 'Your message was successfuly sent!', type: 'success' }).then(function () {
                    $timeout($scope.closeContactModal);
                });
            }, function (error) {
                console.log(error);
            });
        };

        $scope.editProfileSection = function (section) {
            ProfileSvc.setActiveStep(section);
            $scope.go('/apply');
        };

        $scope.removeOffer = function (serviceName) {
            OfferSvc.removeOffer(serviceName);
            $scope.offers = OfferSvc.offers;
        };

        $scope.editOffer = function (serviceName) {
            OfferSvc.setOffer(_.find($scope.offers, function (offer) {
                return offer.serviceName === serviceName;
            }));
            $scope.editProfileSection('offer_config');
        };

        ///////////////////////////////////////////////////////////
        /// Fetch functions
        ///////////////////////////////////////////////////////////

        OfferSvc.fetchOffers($scope.userId).then(function (offers) {
            $scope.offers = offers;
        }, function (error) {
            console.log(error);
        });

        PortfolioSvc.fetchPortfolio($scope.userId).then(function (portfolio) {
            PortfolioSvc.updatePortfolio(portfolio);
            $scope.portfolio = PortfolioSvc.getPortfolio();
        }, function (error) {
            console.log(error);
        });

        ReviewSvc.fetchReceivedReviews($scope.userId).then(function (reviews) {
            $scope.reviews = reviews;
        }, function (error) {
            console.log(error);
        });

        ProfileSvc.fetchProfile($location.absUrl()).then(function (profile) {
            $scope.isCurrentUser = $location.absUrl() === $scope.profile.personalUrl;
            $scope.profile = profile;
        }, function (error) {
            console.log(error);
        });
    }]);

}());
