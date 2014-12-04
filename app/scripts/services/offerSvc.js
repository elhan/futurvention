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
    app.service('OfferSvc', ['$http', '$q', '$timeout', 'Enum', 'PATHS', 'breeze', function ($http, $q, $timeout, Enum, paths, breeze) {
        var OfferSvc = {},
            offer = {},
            offers = [],

            dataService = new breeze.DataService({
                serviceName: paths.public,
                hasServerMetadata: false
            }),

            manager = new breeze.EntityManager({ dataService: dataService });

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

        OfferSvc.fetchOffers = function (userID) {
            var deferred = $q.defer(),

            query = new breeze.EntityQuery('Offers')
                .withParameters({ SellerProfileID: userID })
                .expand([
                  'Service',
                  'Service.ShortTitle.Literals',
                  'Service.ThumbnailFile',
                  'Showcases.Items',
                  'Showcases.Items.Thumbnail',
                  'Showcases.Items.Thumbnail',
                  'Showcases.Items.Title.Literals'
                ].join(','));

            manager.executeQuery(query).then(function (response) {
                offers = response.results[0] && response.results[0].value;
                deferred.resolve(offers);
            }, function (error) {
                console.log(error);
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

        OfferSvc.saveShowcases = function (offerID, showcases) {
            return $http({
                method: 'PUT',
                url: [
                    paths.offerManagement.ownOffers,
                    '/',
                    offer.ID,
                    '/Showcases'
                ].join(''),
                data: showcases
            });
        };

        OfferSvc.saveOffer = function (offer) {
            return $http({
                method: 'PATCH',
                url: paths.offerManagement.ownOffers + '/' + offer.ID,
                data: offer
            });
        };

        OfferSvc.saveOfferField = function (offerID, fieldID, answer) {
            return $http({
                method: 'PUT',
                url: [
                    paths.offerManagement.ownOffers,
                    '/',
                    offerID,
                    '/Fields/Inline?ServiceFieldID=',
                    fieldID
                ].join(''),
                data: JSON.stringify(answer)
            });
        };

        ///////////////////////////////////////////////////////////
        /// Delete functions
        ///////////////////////////////////////////////////////////

        OfferSvc.removeOwnOffer = function (offerID) {
            return $http.delete(paths.offerManagement.ownOffers + '/' + offerID);
        };

        return OfferSvc;
    }]);
}());
