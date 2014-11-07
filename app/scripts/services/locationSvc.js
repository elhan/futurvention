/*global Predicate */

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
                serviceName: paths.root,
                hasServerMetadata: false
            }),

            manager = new breeze.EntityManager({ dataService: dataService });

        function buildCountriesCollection (response) {
            return _.pluck(response.results[0].value, function (obj) {
                return {
                    name: obj.Name.Literals[0].Text,
                    countryID: obj.ID
                };
            });
        }

        function buildCitiesCollection (response) {
            return _.pluck(response.data.value, function (city) {
                return city.Name.Literals[0].Text;
            });
        }

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
                    'https://futurvention.azurewebsites.net/public.svc/',
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
                deferred.resolve(buildCitiesCollection(response));
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
                deferred.resolve(buildCountriesCollection(response));
            }, function (error) {
                console.log(error);
            });

            return deferred.promise;
        };

        return LocationSvc;
    }]);

}());
