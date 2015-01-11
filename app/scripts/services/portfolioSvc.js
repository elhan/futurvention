(function () {
    'use strict';
    var app = angular.module('fvApp');

    /**
     * @ngdoc service
     * @name fvApp.service: PortfolioSvc
     * @description
     * # PortfolioSvc
     * Manage Portfolio items
     */
    app.service('PortfolioSvc', ['$http', '$q', '$timeout', 'breeze', 'PATHS', 'ENV', function ($http, $q, $timeout, breeze, paths, env) {
        var PortfolioSvc = {},
            portfolio = [],
            maxFileSize = 8*1024*1024, // 8MB

            dataService = new breeze.DataService({
                serviceName: env.api.endPoint + paths.public,
                hasServerMetadata: false
            }),

            manager = new breeze.EntityManager({ dataService: dataService });

        PortfolioSvc.setPortfolio = function (port) {
            switch (true) {
            case _.isArray(port):
                portfolio = port;
                break;
            case _.isUndefined(port):
            case _.isEmpty(port):
                portfolio.empty();
                break;
            case _.isObject(port):
                portfolio.empty();
                portfolio.push(port);
                break;
            }
        };

        PortfolioSvc.getPortfolio = function () {
            return portfolio;
        };

        PortfolioSvc.getMaxFileSize = function () {
            return maxFileSize;
        };

        ///////////////////////////////////////////////////////////
        /// Fetch operations
        ///////////////////////////////////////////////////////////

        PortfolioSvc.fetchPortfolio = function (userID) {
            var deferred = $q.defer(),

                query = new breeze.EntityQuery('Showcases')
                    .where('SellerProfileID', 'eq', userID)
                    .expand(
                        [
                            'Items.File',
                            'Items.Thumbnail',
                            'Items.Title.Literals'
                        ].join(',')
                    );

            manager.executeQuery(query).then(function (response) {
                deferred.resolve(_.uniq(response.results[0].value));
            }, function (error) {
                deferred.reject(error);
            });

            return deferred.promise;
        };

        PortfolioSvc.fetchOwnOfferShowcases = function (offerID) {
            var deferred = $q.defer(),

                url = [
                    env.api.endPoint + paths.offerManagement.ownOffers,
                    '/',
                    offerID,
                    '/Showcases'
                ].join('');

            $http.get(url).then(function (response) {
                deferred.resolve(response.data);
            }, function (error) {
                deferred.reject(error);
            });

            return deferred.promise;
        };

        /**
         * Fetch a collection of shopwcases for a given offerID
         * @param {Int} offerID The offer's ID
         * @return Array.<Showcase>
         */
        PortfolioSvc.fetchOfferShowcases = function (offerID) {
            var deferred = $q.defer(),
                query = new breeze.EntityQuery('Offers')
                .where('ID', 'eq', parseInt(offerID))
                .expand([
                    'OfferShowcases.Showcase.Items.File',
                    'OfferShowcases.Showcase.Items.Thumbnail',
                    'OfferShowcases.Showcase.Items.Title.Literals'
                ].join(','));

            manager.executeQuery(query).then(function (response) {
                var showcases = [],
                    offer = response.results[0] && response.results[0].value[0];

                if (offer && offer.OfferShowcases && offer.OfferShowcases instanceof Array && offer.OfferShowcases.length > 0) {
                    _.each(offer.OfferShowcases, function (offeredSc) {
                        showcases.push(offeredSc.Showcase);
                    });
                    PortfolioSvc.setPortfolio(showcases);
                    deferred.resolve(showcases);
                } else {
                    deferred.reject();
                }

            }, function (error) {
                console.log(error);
                deferred.reject(error);
            });

            return deferred.promise;
        };

        ///////////////////////////////////////////////////////////
        /// Save operations
        ///////////////////////////////////////////////////////////

        PortfolioSvc.saveUrls = function (urls, serviceID) {
            var payload = urls instanceof Array ? urls : new Array(urls);
            return $http.put(env.api.endPoint + paths.sellerManagement.showcases + serviceID, payload);
        };

        PortfolioSvc.saveShowcases = function (offerID, showcases) {
            return $http({
                method: 'PUT',
                url: [
                    env.api.endPoint + paths.offerManagement.ownOffers,
                    '/',
                    offerID,
                    '/Showcases'
                ].join(''),
                data: showcases
            });
        };

        PortfolioSvc.updateShowcaseTitle = function (showcase) {
            return $http({
                method: 'PATCH',
                url: [
                    env.api.endPoint,
                    paths.sellerManagement.ownShowcase,
                    '/',
                    showcase.ID
                ].join(''),
                data: {
                    Title: showcase.Title
                }
            });
        };

        ///////////////////////////////////////////////////////////
        /// Delete operations
        ///////////////////////////////////////////////////////////

        PortfolioSvc.deleteShowcase = function (showcaseID) {
            return $http.delete(env.api.endPoint + paths.sellerManagement.ownShowcase + '/' + showcaseID);
        };

        return PortfolioSvc;
    }]);

}());
