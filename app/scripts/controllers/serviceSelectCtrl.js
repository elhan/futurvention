(function () {
    'use strict';

    var app = angular.module('fvApp');

    /**
     * @ngdoc Controller
     * @name fvApp.controller: ServiceSelectCtrl
     * @description
     * # ServiceSelectCtrl
     * Controls the apply 'service select' step
     */
    app.controller('ServiceSelectCtrl', ['$scope', '$timeout', 'CatalogueSvc', 'OfferSvc', function ($scope, $timeout, CatalogueSvc, OfferSvc) {
        // show thumbnails in batches of 16 (4 rows of 4 thumbnails)
        $scope.batch = 16;

        $scope.offers = [];

        // add an 'All' option to the category collection and set it as the default active category
        $scope.categories = CatalogueSvc.categories;
        !_.contains($scope.categories, 'All') && $scope.categories.unshift('All');

        // bs-tabs needs the idnex as model, not the string value of the category
        $scope.categories.activeCategoryIndex = 0;

        /*
            Pagination support for available services. This is initailized to 16 since that is the default
            thumbnail batch size. The paginationIndex is passed as an argument when filtering services.
        **/
        $scope.paginationIndex = 16;

        $scope.getServices = function () {
            return CatalogueSvc.getServicesInCategory($scope.categories[$scope.categories.activeCategoryIndex], $scope.paginationIndex);
        };

        $scope.services = $scope.getServices(); // the filtered services (by category and pagination)
        $scope.allServices = CatalogueSvc.services; // all available services - necessary for autocomplete & pagination
        $scope.selectedService = ''; // the latest service to be selected. Model for autocomplete.

        $scope.createOffer = function (serviceName) {
            OfferSvc.setOffer(new OfferSvc.Offer());
            OfferSvc.updateOffer({ serviceName: serviceName });
            $scope.goToStep(3);
        };

        $scope.removeOffer = function (serviceName) {
            OfferSvc.removeOffer(serviceName);
            $scope.offers = OfferSvc.offers;
        };

        $scope.editOffer = function (serviceName) {
            OfferSvc.setOffer(_.find($scope.offers, function (offer) {
                return offer.serviceName === serviceName;
            }));
            $scope.goToStep(3);
        };

        // loads one more batch of thumbnails
        $scope.showMore = function () {
            $scope.paginationIndex += $scope.batch;
            $scope.services = $scope.getServices();
        };

        OfferSvc.fetchOffers().then(function (offers) {
            $scope.offers = offers;
            OfferSvc.offers = offers;
        }, function (error) {
            console.log(error);
        });

        // update the filtered services when the category changes
        $scope.$watch('categories.activeCategoryIndex', function (newIndex, oldIndex) {
            if (newIndex === oldIndex) {
                return;
            }
            $scope.services = $scope.getServices();
        });

    }]);
}());
