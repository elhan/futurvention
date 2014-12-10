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
    app.controller('OfferCtrl', ['$scope', '$modal', 'PATHS', 'EVENTS', 'offer', 'ReviewSvc', 'UserSvc', 'PortfolioSvc', 'CatalogueSvc', 'ProfileSvc', function ($scope, $modal, paths, events, offer, ReviewSvc, UserSvc, PortfolioSvc, CatalogueSvc, ProfileSvc) {
        $scope.reviews = [];
        $scope.portfolio = {};
        $scope.service = {};

        $scope.offer = offer;

        $scope.isCurrentUser = false;

        $scope.expandServiceDescription = false;

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

        ProfileSvc.fetchProfileById($scope.offer.SellerProfileID).then(function (profile) {
            $scope.profile = profile[0];

            $scope.avatarUrl = $scope.profile.User && $scope.profile.User.Avatar ? encodeURI(paths.file.hosted + $scope.profile.User.Avatar.RelativeUrl) : null;

            $scope.isCurrentUser = $scope.profile.ID === $scope.currentUser.ID;

            $scope.$broadcast(events.profile.fetchProfileSuccess, $scope.isCurrentUser);
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

    }]);
}());
