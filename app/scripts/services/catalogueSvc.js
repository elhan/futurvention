(function () {
    'use strict';
    var app = angular.module('fvApp');

    /**
     * @ngdoc service
     * @name fvApp.service: CatalogueSvc
     * @description
     * # CatalogueSvc
     * CRUD operations for Catalogue items (services, categories etc)
     */
    app.service('CatalogueSvc', ['$http', '$q', '$timeout', 'breeze', 'PATHS', function ($http, $q, $timeout, breeze, paths) {
        var CatalogueSvc = {},

            dataService = new breeze.DataService({
                serviceName: paths.public,
                hasServerMetadata: false
            }),

            manager = new breeze.EntityManager({ dataService: dataService });

        ///////////////////////////////////////////////////////////
        /// Private functions
        ///////////////////////////////////////////////////////////

        function filterRootCategories (response) {
            return _.pluck(response.results[0].value, function (obj) {
                return {
                    categoryID: obj.ID,
                    categoryName: obj.Name.Literals[0].Text
                };
            });
        }

        function filterServices (response, offset) {
            var services = _.pluck(response.results[0].value, function (obj) {
                return {
                    serviceID: obj.ID,
                    serviceName: obj.ShortTitle.Literals[0].Text,
                    thumbnail: obj.ThumbnailFile
                };
            });
            // ensure that the first batch will be delivered properly
            return services.slice(offset, offset + CatalogueSvc.batch);
        }

        ///////////////////////////////////////////////////////////
        /// Public API
        ///////////////////////////////////////////////////////////

        CatalogueSvc.services = []; // cache 'All' services
        CatalogueSvc.batch = 16; // show service thumbnails in batches of 16 (4 rows of 4 thumbnails)

        /**
         * Returns a collection of city objects
         * @public
         *
         * returns Array[{name: String, cityID: String}]
         */
        CatalogueSvc.getRootCategories = function () {
            var deferred = $q.defer(),
                query = new breeze.EntityQuery('RootCategories').expand('Name.Literals');

            manager.executeQuery(query).then(function (response) {
                var rootCategories = filterRootCategories(response);
                // add an 'All' option to the categoryNames collection and set it as the default active category
                rootCategories.unshift({
                    categoryID: null,
                    categoryName: 'All'
                });
                deferred.resolve(rootCategories);
            }, function (error) {
                deferred.reject(error);
            });

            return deferred.promise;
        };

        /**
         * Returns a collection of city objects
         * @public
         *
         * returns Array[{name: String, cityID: String}]
         */
        CatalogueSvc.getServices = function (offset) {
            var deferred = $q.defer(),
                query = new breeze.EntityQuery('Services').expand('ShortTitle.Literals, ThumbnailFile');

            manager.executeQuery(query).then(function (response) {
                deferred.resolve(filterServices(response, offset));
            }, function (error) {
                deferred.reject(error);
            });

            return deferred.promise;
        };

        /**
         * Returns a collection of city objects
         * @public
         *
         * returns Array[{name: String, cityID: String}]
         */
        CatalogueSvc.getServicesUnderCategory = function (categoryID, offset) {
            var deferred = $q.defer(),
                query = new breeze.EntityQuery('ServicesUnderCategory')
                    .withParameters({CategoryID: categoryID})
                    .expand('ShortTitle.Literals, ThumbnailFile');

            manager.executeQuery(query).then(function (response) {
                deferred.resolve(filterServices(response, offset));
            }, function (error) {
                deferred.reject(error);
            });

            return deferred.promise;
        };

        return CatalogueSvc;
    }]);

}());
