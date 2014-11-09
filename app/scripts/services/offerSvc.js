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
    app.service('OfferSvc', ['$http', '$q', '$timeout', 'Enum', function ($http, $q, $timeout, Enum) {
        var OfferSvc = {},
            offer = {},
            offers = [];

        function generateOfferId () {
            var d = new Date().getTime();
            var id = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                var r = (d + Math.random()*16)%16 | 0;
                d = Math.floor(d/16);
                return (c=='x' ? r : (r&0x7|0x8)).toString(16);
            });
            return id;
        }

        ///////////////////////////////////////////////////////////
        /// Constructors
        ///////////////////////////////////////////////////////////

        OfferSvc.Offer = function () {
            return {
                id: generateOfferId(),
                workSamples: [],
                status: Enum.OfferStatus.DRAFT,
                serviceID: '',
                choices: [],
                lowestPrice: ''
            };
        };

        offer = new OfferSvc.Offer(); // the offer being edited by the user

        ///////////////////////////////////////////////////////////
        /// Public functions
        ///////////////////////////////////////////////////////////

        OfferSvc.setOffer = function (offerObj) {
            offer = offerObj;
        };

        OfferSvc.updateOffer = function (obj) {
            angular.extend(offer, obj);
        };

        /*
            Syntactic sugar. Allows controllers to make use of a clean API without having to worry about
            converting their $scope models to ShowcaseItem format.
        **/
        OfferSvc.addWorkSamples = function (samples) {
            samples && _.each(samples, function (sample) {
                // TODO: convert to ShowcaseItem
                offer.workSmaples.push(sample);
            });
        };

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

        OfferSvc.fetchOffer = function (serviceId, userId) {
            serviceId && console.log(serviceId, userId);
            //            var sid = serviceId || offer.serviceId; //if no serviceId is passed, use the one in the offer obj
            //            return $http.get('/offer', { serviceId: sid });
            var deferred = $q.defer();
            $timeout(function () {
                // TODO: remove mock service object
                deferred.resolve(offer);
            });
            return deferred.promise;
        };

        OfferSvc.fetchOffers = function () {
            // TODO: remove mock service object
            var offerCount = _.random(3, 20);
            var newOffer = {};

            for (var i = 0; i < offerCount; i++) {
                newOffer = new OfferSvc.Offer();
                angular.extend(newOffer, {
                    serviceID: 1,
                    lowestPrice: '$100'
                });
                offers.push(newOffer);
            }

            var deferred = $q.defer();
            $timeout(function () {
                deferred.resolve(offers);
            });
            return deferred.promise;
        };

        return OfferSvc;
    }]);
}());
