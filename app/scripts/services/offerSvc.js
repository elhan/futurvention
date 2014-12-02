(function () {
    'use strict';
    var app = angular.module('fvApp');

    /**
     * @ngdoc service
     * @name fvApp.service: OfferSvc
     * @description
     * # OfferSvc
     * Bussiness logic for seller Offers
     */
    app.service('OfferSvc', ['$http', '$q', '$timeout', 'Enum', 'PATHS', function ($http, $q, $timeout, Enum, paths) {
        var OfferSvc = {},
            offer = {},
            offers = [];

        OfferSvc.addOffer = function (obj) {
            var newOffer = obj || offer; // if no args, user the current offer object
            offers.push(newOffer);
        };

        OfferSvc.removeOffer = function (serviceID) {
            var offeredServiceID = serviceID || offer.serviceID;
            offers.remove(function (offer) {
                return offer.serviceID === offeredServiceID;
            });
        };

        OfferSvc.getOffer = function () {
            return offer;
        };

        ///////////////////////////////////////////////////////////
        /// Fetch functions
        ///////////////////////////////////////////////////////////

        OfferSvc.fetchOffers = function () {
            var deferred = $q.defer();

            $http.get(paths.offerManagement.ownOffers).then(function (response) {
                offers = response.data;
                deferred.resolve(offers);
            }, function (error) {
                deferred.reject(error);
            });

            return deferred.promise;
        };

        /**
         * @ngdoc method
         * @name fvApp.service:OfferSvc
         * @function
         *
         * @description
         * Fetches an offer object from the backend. If no offer exists for the given
         * serviceID, returns a new, empty Offer.
         *
         * @param {Integer} serviceID
         * @returns {Offer}
         */
        OfferSvc.fetchOffer = function (serviceID) {
            var deferred = $q.defer();

            $http.put(paths.offerManagement.ownOffers + '?serviceID=' + serviceID).then(function (response) {
                offer = response.data;
                deferred.resolve(offer);
            }, function (error) {
                deferred.reject(error);
            });

            return deferred.promise;
        };

        ///////////////////////////////////////////////////////////
        /// Save functions
        ///////////////////////////////////////////////////////////

        OfferSvc.saveOffer = function (offer) {
            return $http({
                method: 'PATCH',
                url: paths.offerManagement.ownOffers + '/' +offer.ID,
                data: offer
            });
        };

        return OfferSvc;
    }]);
}());
