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
    app.service('OfferSvc', ['$http', '$q', '$timeout', 'Enum', 'PATHS', 'breeze', 'PortfolioSvc', function ($http, $q, $timeout, Enum, paths, breeze, PortfolioSvc) {
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
                .where('SellerProfileID', 'eq', userID)
                .expand([
                  'Service',
                  'Service.ShortTitle.Literals',
                  'Service.ThumbnailFile'
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
         * Fetches an Offer belonging to the current user. If no offer exists for the given
         * serviceID, returns a new, empty Offer.
         *
         * @param {Integer} serviceID
         * @returns {Offer}
         */
        OfferSvc.fetchOwnOffer = function (serviceID) {
            var deferred = $q.defer(),

                url = [
                    paths.offerManagement.ownOffers,
                    '?serviceID=',
                    serviceID,
                    '&expand=Fields/File,',
                    'Fields/Thumbnail'
                ].join('');

            $http.put(url).then(function (response) {
                offer = response.data;
                deferred.resolve(offer);
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
         * Given an offerID, fetches an offer object
         *
         * @param {Integer} offerID
         * @returns {Offer}
         */
        OfferSvc.fetchOffer =  function (offerID) {
            var deferred = $q.defer(),

            query = new breeze.EntityQuery('Offers')
                .where('ID', 'eq', parseInt(offerID))
                .expand([
                    'Service',
                    'Service.Options',
                    'Service.ShortTitle.Literals',
                    'Service.ThumbnailFile',
                    'Service.Options.SellerTitle.Literals',
                    'Service.Options.BuyerTitle.Literals',
                    'Service.Options.Choices',
                    'OfferedChoices.ServiceChoice.Option',
                    'Fields.File',
                    'Fields.Text.Literals',
                    'Fields.ServiceField.SellerLabel.Literals'
                ].join(','));

            manager.executeQuery(query).then(function (response) {
                offer = response.results[0] && response.results[0].value[0];

                if (offer) {
                    PortfolioSvc.setPortfolio(offer.Showcases);
                    deferred.resolve(offer);
                } else {
                    deferred.reject();
                }

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
         * Fetches a collection of offered services for the given user
         *
         * @param {Integer} userID
         * @returns Array.<Service>
         */
        OfferSvc.fetchOfferedServices = function () {
            var deferred = $q.defer();

            $http.get(paths.offerManagement.offeredServices).then(function (response) {
                deferred.resolve(response.data);
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
                url: paths.offerManagement.ownOffers + '/' + offer.ID,
                data: offer
            });
        };

        /**
         * Saves an offer field
         *
         * @param {Integer} offerID: the id of the Offer to which the field belongs
         * @param {Integer} fieldID: the id of the OfferField to be updated
         * @param {String} answer: the value of the OfferField to be updated
         */
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

        /**
         * @ngdoc method
         * @name fvApp.service:OfferSvc
         * @function
         *
         * @description
         * Fetches a collection of offered services for the given user
         *
         * @param {Integer} userID
         * @returns Array.<Service>
         */
        OfferSvc.saveInterviewVideo = function (offerID, serviceFieldID, url, thumbnailUrl) {
            var requestUrl = [
                    paths.offerManagement.ownOffers,
                    '/',
                    offerID,
                    '/Fields',
                    '?serviceFieldID=',
                    serviceFieldID,
                    '&useDirectLinks=true'
                ].join('');

            return $http({
                method: 'PUT',
                url: requestUrl,
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                transformRequest: function(obj) {
                    var str = [];
                    for(var p in obj) {
                        if (obj.hasOwnProperty(p)) {
                            str.push(encodeURIComponent(p) + '=' + encodeURIComponent(obj[p]));
                        }
                    }
                    return str.join('&');
                },
                data: {
                    url: url,
                    thumbnailUrl: thumbnailUrl
                }
            });
        };

        /**
         * @ngdoc method
         * @name fvApp.service:OfferSvc
         * @function
         *
         * @description
         * Fetches a collection of offered services for the given user
         *
         * @param {Integer} userID
         * @returns Array.<Service>
         */
        OfferSvc.saveOfferChoice = function (choiceData) {
            return $http({
                method: 'PUT',
                url: [
                    paths.offerManagement.ownOffers,
                    '/',
                    choiceData.offerID,
                    '/Choices?serviceChoiceID=',
                    choiceData.serviceChoiceID,
                    '&price=',
                    choiceData.price,
                    '&days=',
                    choiceData.days
                ].join('')
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
