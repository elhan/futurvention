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
    app.service('PortfolioSvc', ['$http', '$q', '$timeout', function ($http, $q, $timeout) {
        var PortfolioSvc = {},
            portfolio = {};

        PortfolioSvc.updatePortfolio = function (obj) {
            angular.extend(portfolio, obj);
        };

        PortfolioSvc.getPortfolio = function () {
            return portfolio;
        };

        PortfolioSvc.fetchPortfolio = function (userId, index, offset) {
            console.log(userId, index, offset);

            // TODO: remove mock service object
            var PortfolioItem = function () {
                return {
                    title: 'Logo Design',
                    url: 'http://www.accusoft.com/html5viewer/img/btn-file-icon-ppt-sm.png',
                    name: 'btn-file-icon-ppt-sm.png'
                };
            };

            var itemCount = _.random(3, 20);
            var portfolioItems = [];

            for (var i = 0; i < itemCount; i++) {
                portfolioItems.push(new PortfolioItem());
            }

            var deferred = $q.defer();
            $timeout(function () {
                deferred.resolve({
                    items: portfolioItems
                });
            });
            return deferred.promise;
        };

        return PortfolioSvc;
    }]);

}());
