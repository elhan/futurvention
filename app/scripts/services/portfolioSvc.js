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
    app.service('PortfolioSvc', ['$http', '$q', '$timeout', 'PATHS', function ($http, $q, $timeout, paths) {
        var PortfolioSvc = {},
            portfolio = {};

        PortfolioSvc.updatePortfolio = function (obj) {
            angular.extend(portfolio, obj);
        };

        PortfolioSvc.getPortfolio = function () {
            return portfolio;
        };

        PortfolioSvc.fetchPortfolio = function () {
            // TODO
            var deferred = $q.defer();

            return deferred.promise;
        };

        PortfolioSvc.saveUrls = function (urls, serviceID) {
            return $http.put(paths.sellerManagement.showcases + serviceID, urls);
        };

        return PortfolioSvc;
    }]);

}());
