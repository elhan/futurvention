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
    app.controller('OfferCtrl', ['$scope', '$modal', 'PATHS', 'EVENTS', 'ENV', 'offer', 'ReviewSvc', 'UserSvc', 'PortfolioSvc', 'CatalogueSvc', 'ProfileSvc', 'LocationSvc', function ($scope, $modal, paths, events, env, offer, ReviewSvc, UserSvc, PortfolioSvc, CatalogueSvc, ProfileSvc, LocationSvc) {
        $scope.reviews = [];
        $scope.portfolio = {};
        $scope.service = {};
        $scope.showcases = [];

        $scope.offer = offer;

        $scope.isCurrentUser = false;

        $scope.expandServiceDescription = false;

        $scope.showcaseIndex = 0;

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

        ////////////////////////////////////////////
        /// Init
        ////////////////////////////////////////////

        if (offer.OfferShowcases && offer.OfferShowcases.hasOwnProperty('length') && offer.OfferShowcases.length > 0) {
            _.each(offer.OfferShowcases, function (offeredSc) {
                $scope.showcases.push(offeredSc.Showcase);
            });
        }

        ProfileSvc.fetchProfileById($scope.offer.SellerProfileID).then(function (profile) {
            $scope.profile = profile[0];

            $scope.avatarUrl = $scope.profile.User && $scope.profile.User.Avatar ? encodeURI(env.api.hostedFiles + $scope.profile.User.Avatar.RelativeUrl) : null;

            $scope.isCurrentUser = $scope.profile.ID === $scope.currentUser.ID;

            $scope.$broadcast(events.profile.fetchProfileSuccess, $scope.isCurrentUser);

            LocationSvc.fetchLocationNames($scope.profile.LocationID).then(function (response) {
                $scope.profile.countryName = response.results[0].value[0].Parent.Name.Literals[0].Text;
            }, function (error) {
                console.log(error);
            });

        }, function (error) {
            console.log(error);
        });

        ReviewSvc.fetchReviews($scope.offer.SellerProfileID).then(function (reviews) {
            $scope.reviews = reviews;
        }, function (error) {
            console.log(error);
        });

        CatalogueSvc.getService($scope.offer.ServiceID).then(function (service) {
            $scope.service = service;
        }, function (error) {
            console.log(error);
        });

        PortfolioSvc.fetchOfferShowcases($scope.offer.ID).then(function (showcases) {
            $scope.showcases = showcases;
        }, function (error) {
            //TODO: proper logging
            console.log(error);
        });
    }]);
}());
