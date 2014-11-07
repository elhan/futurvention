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
        //  Pagination support for available services. Initailized to the default thumbnail batch size.
        $scope.offset = 0;

        $scope.offers = [];
        $scope.services = []; // the filtered services (by category and pagination)
        $scope.categories = [];
        $scope.allServices = [];
        $scope.selectedService = {};

        $scope.getServices = function () {
            CatalogueSvc.getServices($scope.offset).then(function (services) {
                $scope.services.merge(services);
            }, function (error) {
                console.log(error);
            });
        };

        $scope.getServicesUnderCategory = function (categoryID) {
            CatalogueSvc.getServicesUnderCategory(categoryID, $scope.offset).then(function (services) {
                $scope.services.merge(services);
            }, function (error) {
                console.log(error);
            });
        };

        // loads one more batch of thumbnails
        $scope.showMore = function () {
            $scope.offset += CatalogueSvc.batch;
            var categoryID = $scope.categories[$scope.categories.activeCategoryIndex].categoryID;
            categoryID === null ? $scope.getServices() : $scope.getServicesUnderCategory(categoryID);
        };

        // populate the categories menu
        CatalogueSvc.getRootCategories().then(function (rootCategories) {
            $scope.categories = rootCategories;
            $scope.categories.activeCategoryIndex = 0;
        }, function (error) {
            console.log(error);
        });

        $scope.createOffer = function (serviceName) {
            OfferSvc.setOffer(new OfferSvc.Offer());
            OfferSvc.updateOffer({ serviceName: serviceName });
            $timeout(function () { $scope.goToStep(3); });
        };
//
//        $scope.removeOffer = function (serviceName) {
//            OfferSvc.removeOffer(serviceName);
//            $scope.offers = OfferSvc.offers;
//        };
//
//        $scope.editOffer = function (serviceName) {
//            OfferSvc.fetchOffer(serviceName, $scope.currentUser.userId).then(function (offer) {
//                OfferSvc.setOffer(offer);
//                $scope.goToStep(3);
//            }, function (error) {
//                console.log(error);
//            });
//        };
//

//
//        OfferSvc.fetchOffers().then(function (offers) {
//            $scope.offers = offers;
//            OfferSvc.offers = offers;
//        }, function (error) {
//            console.log(error);
//        });
//
        // update the filtered services when the category changes
        $scope.$watch('categories.activeCategoryIndex', function (newIndex, oldIndex) {
            switch (true) {
            case typeof newIndex === undefined || newIndex === oldIndex || $scope.categories.length === 0:
                break;
            case newIndex === 0:
                $scope.offset = 0; //reset offset
                $scope.services.empty(); // reset services
                $scope.getServices();
                break;
            default:
                $scope.offset = 0;
                $scope.services.empty();
                $scope.getServicesUnderCategory($scope.categories[newIndex].categoryID);
            }
        });

        $scope.$watch('selectedService.serviceID', function (newServiceId, oldServiceId) {
            newServiceId && $scope.createOffer(newServiceId);
        });

    }]);
}());
