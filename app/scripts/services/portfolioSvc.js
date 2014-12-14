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
    app.service('PortfolioSvc', ['$http', '$q', '$timeout', 'breeze', 'PATHS', function ($http, $q, $timeout, breeze, paths) {
        var PortfolioSvc = {},

            portfolio = {},

            dataService = new breeze.DataService({
                serviceName: paths.public,
                hasServerMetadata: false
            }),

            manager = new breeze.EntityManager({ dataService: dataService });

        PortfolioSvc.updatePortfolio = function (obj) {
            angular.extend(portfolio, obj);
        };

        PortfolioSvc.setPortfolio = function (port) {
            portfolio = port;
        };

        PortfolioSvc.getPortfolio = function () {
            return portfolio;
        };

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
                console.log(response);
            }, function (error) {
                console.log(error);
            });

            return deferred.promise;
        };

        PortfolioSvc.saveUrls = function (urls, serviceID) {
            return $http.put(paths.sellerManagement.showcases + serviceID, urls);
        };

        PortfolioSvc.saveShowcases = function (offerID, showcases) {
            return $http({
                method: 'PUT',
                url: [
                    paths.offerManagement.ownOffers,
                    '/',
                    offerID,
                    '/Showcases'
                ].join(''),
                data: showcases
            });
        };

        PortfolioSvc.fetchShowcases = function (offerID) {
            var deferred = $q.defer(),

                url = [
                    paths.offerManagement.ownOffers,
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

        return PortfolioSvc;
    }]);

}());
