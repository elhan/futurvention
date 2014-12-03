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
    app.controller('StorefrontCtrl', ['$scope', '$modal', '$timeout', '$location', 'EVENTS', 'MESSAGES', 'Odata', 'ProfileSvc', 'PortfolioSvc', 'OfferSvc', 'ReviewSvc', 'MessagingSvc', 'NotificationSvc', 'profile', function ($scope, $modal, $timeout, $location, events, msg, odata, ProfileSvc, PortfolioSvc, OfferSvc, ReviewSvc, MessagingSvc, NotificationSvc, profile) {

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

        $scope.showcaseItems = [];
        $scope.showcaseItems = [];

        $scope.profile = profile;

        $scope.isCurrentUser = $scope.currentUser.ID === $scope.profile.ID;

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
        $scope.range = function (rating) { return _.range(0, rating); };

        $scope.contactUser = function () {
            MessagingSvc.sendMessage($scope.profile.ID, $scope.currentUser.id, $scope.sender.firstName, $scope.sender.lastName, $scope.message).then(function () {
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

        $scope.editOffer = function (offer) {

            // fetch full offer object
            OfferSvc.fetchOffer(offer.Service.ID).then(function () {
                $scope.editProfileSection('offer_config');
            }, function () {
                NotificationSvc.show({ content: msg.error.generic, type: 'error' });
            });

            // TODO
//            OfferSvc.setOffer(_.find($scope.offers, function (offer) {
//                return offer.serviceName === serviceName;
//            }));
//            OfferSvc.fetchOffer(serviceName, $scope.profile.ID).then(function (offer) {
//                OfferSvc.setOffer(offer);
//                $scope.activeStep = $scope.steps[3];
//            }, function (error) {
//                console.log(error);
//            });
//            $scope.editProfileSection('offer_config');
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
        /// Initialization
        ///////////////////////////////////////////////////////////

        OfferSvc.fetchOffers($scope.profile.ID).then(function (offers) {
            var showcaseItem;

            $scope.offers = offers;

            _.each(offers, function (offer) {
                _.each(offer.Showcases, function (showcase) {
                    showcaseItem = new odata.ShowcaseItem(showcase.Items[0]);
                    $scope.showcaseItems.push(showcaseItem.toSimpleShowcaseItem({ state: 'loaded' }));
                });
            });

        }, function (error) {
            console.log(error);
        });

        //TODO
//        PortfolioSvc.fetchPortfolio($scope.profile.ID).then(function (portfolio) {
//            PortfolioSvc.updatePortfolio(portfolio);
//            $scope.portfolio = PortfolioSvc.getPortfolio();
//        }, function (error) {
//            console.log(error);
//        });

        ReviewSvc.fetchReceivedReviews($scope.profile.ID).then(function (reviews) {
            $scope.reviews = reviews;
        }, function (error) {
            console.log(error);
        });

        // listen for image update events emmited by the imga ecrop modal
        $scope.$on(events.profile.profileUpdated, function () {
            $scope.profile.image = ProfileSvc.getProfile().image;
        });
    }]);

}());
