(function () {
    'use strict';
    var app = angular.module('fvApp');

    /**
     * @ngdoc service
     * @name fvApp.service: LocationSvc
     * @description
     * # LocationSvc
     * Provider for Location resources
     */
    app.service('LocationSvc', ['$q', '$http', 'breeze', 'PATHS', 'ENV', 'Odata', function ($q, $http, breeze, paths, env, odata) {
        var LocationSvc = {},

            dataService = new breeze.DataService({
                serviceName: env.api.endPoint + paths.public,
                hasServerMetadata: false
            }),

            manager = new breeze.EntityManager({ dataService: dataService });

        ///////////////////////////////////////////////////////////
        /// Private functions
        ///////////////////////////////////////////////////////////

        function filterLocationCollection (locations) {
            return _.map(locations, function (location) {
                return new odata.Location(location);
            });
        }

        ///////////////////////////////////////////////////////////
        /// Public API
        ///////////////////////////////////////////////////////////

        /**
         * Searches cities by countryID and a string prefix, and returns an array of city names.
         * @public
         *
         * @param {String} countryID
         * @param {String} prefix
         *
         * returns Array[String]
         */
        LocationSvc.searchCity = function (countryID, prefix) {
            var deferred = $q.defer(),
                url = [
                    env.api.endPoint + paths.public,
                    'CitiesByPrefix',
                    '?format=json',
                    '&countryID=',
                    countryID,
                    '&prefix=',
                    '\'', prefix, '\'',
                    '&$format=json',
                    '&$expand=Name/Literals'
                ].join('');

            $http.get(url).then(function (response) {
                deferred.resolve(filterLocationCollection(response.data.value));
            }, function (error) {
                deferred.reject(error);
            });

            return deferred.promise;
        };

        /**
         * Given a cityID, returns the names of the city and country it belongs in
         * @public
         *
         * @param {String} cityID
         *
         * returns Array.<Location>
         */
        LocationSvc.fetchLocationNames = function (cityID) {
            var query = new breeze.EntityQuery('Locations')
                    .where('ID', 'eq', cityID)
                    .expand('Name.Literals,Parent.Name.Literals');

            return manager.executeQuery(query);
        };

        /**
         * Returns a collection of city objects
         * @public
         *
         * returns Array[{name: String, cityID: String}]
         */
        LocationSvc.getCountries = function () {
            var deferred = $q.defer(),
                query = new breeze.EntityQuery('CountriesLocations').expand('Name.Literals');

            manager.executeQuery(query).then(function (response) {
                deferred.resolve(filterLocationCollection(response.results[0].value));
            }, function (error) {
                console.log(error);
            });

            return deferred.promise;
        };

        /**
         * Returns a location object
         * @public
         *
         * returns {Location}
         */
        LocationSvc.getLocationByID = function (locationID) {
            var deferred = $q.defer(),
                query = new breeze.EntityQuery('Locations').where('ID', 'eq', locationID).expand('Name.Literals');

            manager.executeQuery(query).then(function (response) {
                deferred.resolve(new odata.Location(response.results[0].value));
            }, function (error) {
                console.log(error);
            });

            return deferred.promise;
        };

        return LocationSvc;
    }]);

}());
