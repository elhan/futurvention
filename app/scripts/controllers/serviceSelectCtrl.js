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
    app.controller('ServiceSelectCtrl', ['$scope', '$timeout', '$modal', '$location', 'EVENTS', 'MESSAGES', 'CatalogueSvc', 'OfferSvc', 'NotificationSvc', 'ProfileSvc', 'ImporterSvc', function ($scope, $timeout, $modal, $location, events, msg, CatalogueSvc, OfferSvc, NotificationSvc, ProfileSvc, ImporterSvc) {

        var modalPageLoading = $modal({
            scope: $scope,
            template: 'views/components/modalPageLoading.html',
            show: true,
            animation: 'am-fade',
            backdropAnimation: 'am-fade light',
            keyboard: false,
            backdrop: 'static'
        });

        //  Pagination support for available services. Initailized to the default thumbnail batch size.
        $scope.offset = 0;
        $scope.batch = CatalogueSvc.batch;

        $scope.offers = [];
        $scope.services = []; // the filtered services (by category and pagination)
        $scope.categories = [];
        $scope.allServices = [];
        $scope.selectedService = {};
        $scope.offeredServices = [];

        $scope.isOffered = function (serviceID) {
            return _.find($scope.offeredServices, function (service) {
                return service && service.serviceID === serviceID;
            });
        };

        $scope.continue = function () {
            $location.path('/' + $scope.currentUser.Profile.Moniker);

            ImporterSvc.getStoredImporters().then(function (storedImporters) {
                if (storedImporters && storedImporters instanceof Array && storedImporters.length > 0) {
                    ProfileSvc.saveStatistics(storedImporters);
                }
            }, function (error) {
                // TODO: proper logging
                console.log(error);
            });

            if ($scope.currentUser.hasOwnProperty('Profile') && $scope.currentUser.Profile.Status < 4) {
                ProfileSvc.saveProfileStatus(4); // let the backend know the user has finished the wizard
            }
        };

        ///////////////////////////////////////////////////////////
        /// Sync with backend
        ///////////////////////////////////////////////////////////

        $scope.getServices = function () {
            CatalogueSvc.getServices($scope.offset).then(function (services) {
                modalPageLoading.hide();
                $scope.services.merge(services);
                $scope.services.totalCount = services.length;
                $scope.allServices = CatalogueSvc.services; // make sure the services have ben fetched
            }, function (error) {
                console.log(error);
                modalPageLoading.hide();
            });
        };

        $scope.getServicesUnderCategory = function (categoryID) {
            CatalogueSvc.getServicesUnderCategory(categoryID, $scope.offset).then(function (result) {
                $scope.services.merge(result.services);
                $scope.services.totalCount = result.totalCount;
            }, function (error) {
                console.log(error);
            });
        };

        // loads one more batch of thumbnails
        $scope.showMore = function () {
            $scope.offset += $scope.batch;
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

        $scope.removeOffer = function (offer) {
            OfferSvc.removeOwnOffer(offer.ID).then(function () {
                _.remove($scope.offers, function (obj) { return obj === offer; });
            }, function (error) {
                console.log(error);
                NotificationSvc.show({ content: msg.error.generic, type: 'error' });
            });
        };

        $scope.editOffer = _.throttle(function (serviceID) {
            OfferSvc.fetchOwnOffer(serviceID).then(function () {
                $scope.goToStep(3);
            }, function () {
                NotificationSvc.show({ content: msg.error.generic, type: 'error' });
            });
        }, 1000);

        ///////////////////////////////////////////////////////////
        /// Event handling
        ///////////////////////////////////////////////////////////

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

        $scope.$watch('selectedService.serviceID', function (newServiceId) {
            newServiceId && OfferSvc.fetchOwnOffer(newServiceId).then(function () {
                $scope.goToStep(3);
            }, function () {
                NotificationSvc.show({ content: msg.error.generic, type: 'error' });
            });
        });

        /*
            This is necessary to prevent racing issues. On page refresh, fetchOfferedServices may
            sometimes be called before currentUser has a chance to update.
        **/
        $scope.$watch('currentUser', function (newValue) {
            newValue && OfferSvc.fetchOfferedServices($scope.currentUser.ID).then(function (offers) {
                var service;

                $scope.offers = offers;

                // avoid showing the same service in both collections
                _.each(offers, function (offer) {
                    service = _.find($scope.services, function (svc) {
                        return svc.serviceID === offer.ServiceID;
                    });
                    $scope.offeredServices.push(service);
                });
            });
        });

    }]);
}());
