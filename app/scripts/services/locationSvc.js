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
    app.service('LocationSvc', ['$q', '$http', 'breeze', 'PATHS', function ($q, $http, breeze, paths) {
        var LocationSvc = {},

            dataService = new breeze.DataService({
                serviceName: paths.public,
                hasServerMetadata: false
            }),

            manager = new breeze.EntityManager({ dataService: dataService });

        ///////////////////////////////////////////////////////////
        /// Private functions
        ///////////////////////////////////////////////////////////

        function filterCountriesCollection (response) {
            return _.pluck(response.results[0].value, function (obj) {
                return {
                    name: obj.Name.Literals[0].Text,
                    countryID: obj.ID
                };
            });
        }

        function filterCitiesCollection (response) {
            return _.pluck(response.data.value, function (city) {
                return {
                    name: city.Name.Literals[0].Text,
                    ID: city.ID
                };
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
            console.log(prefix);
            var deferred = $q.defer(),
                url = [
                    paths.public,
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
                console.log(response);
                deferred.resolve(filterCitiesCollection(response));
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
        LocationSvc.getCountries = function () {
            var deferred = $q.defer(),
                query = new breeze.EntityQuery('CountriesLocations').expand('Name.Literals');

            manager.executeQuery(query).then(function (response) {
                console.log(response);
                deferred.resolve(filterCountriesCollection(response));
            }, function (error) {
                console.log(error);
            });

            return deferred.promise;
        };

        return LocationSvc;
    }]);

}());
