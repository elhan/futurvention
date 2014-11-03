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
    app.controller('StorefrontCtrl', ['$scope', '$modal', '$timeout', '$location', 'ProfileSvc', 'PortfolioSvc', 'OfferSvc', 'ReviewSvc', 'MessagingSvc', 'NotificationSvc', 'profile', 'userId', 'EVENTS', function ($scope, $modal, $timeout, $location, ProfileSvc, PortfolioSvc, OfferSvc, ReviewSvc, MessagingSvc, NotificationSvc, profile, userId, events) {

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

        var modalImageCrop = $modal({
            scope: $scope,
            template: 'views/components/modalImageCrop.html',
            show: false,
            animation: 'am-slide-top',
            keyboard: true
        });

        $scope.portfolio = PortfolioSvc.getPortfolio();
        $scope.profile = profile;
        $scope.userId = userId;
        $scope.isCurrentUser = $location.absUrl() === $scope.profile.personalUrl;
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
            OfferSvc.fetchOffer(serviceName, $scope.userId).then(function (offer) {
                OfferSvc.setOffer(offer);
                $scope.activeStep = $scope.steps[3];
            }, function (error) {
                console.log(error);
            });
            $scope.editProfileSection('offer_config');
        };

        ///////////////////////////////////////////////////////////
        /// Modal functions functions
        ///////////////////////////////////////////////////////////

        $scope.showContactModal = function () {
            contactModal.$promise.then(contactModal.show);
        };

        $scope.closeContactModal = function () {
            contactModal.$promise.then(contactModal.hide);
        };

        $scope.showPortfolioViewerModal = function () {
            portfolioViewerModal.$promise.then(portfolioViewerModal.show);
        };

        $scope.showImageCropModal = function () {
            $scope.isCurrentUser && modalImageCrop.$promise.then(function () {
                $scope.croppedImage = ''; // reset the croppedImage object
                modalImageCrop.show();
            });
        };

        ///////////////////////////////////////////////////////////
        /// Fetch functions
        ///////////////////////////////////////////////////////////

        ProfileSvc.fetchProfile($location.absUrl()).then(function (profile) {
            $scope.isCurrentUser = $location.absUrl() === profile.personalUrl;
            $scope.profile = profile;
        }, function (error) {
            console.log(error);
        });

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

        // listen for image update events emmited by the imga ecrop modal
        $scope.$on(events.profile.profileImageUpdated, function () {
            $scope.profile.image = ProfileSvc.getProfile().image;
        });
    }]);

}());
