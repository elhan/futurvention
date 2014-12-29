(function () {
    'use strict';
    var app = angular.module('fvApp');

    /**
     * @ngdoc service
     * @name fvApp.service: ReviewSvc
     * @description
     * # ReviewSvc
     * Provider for Review resources
     */
    app.service('ReviewSvc', ['$q', '$http', 'breeze', 'PATHS', 'ENV', function ($q, $http, breeze, paths, env) {
        var ReviewSvc = {},

            dataService = new breeze.DataService({
                serviceName: env.api.endPoint + paths.public,
                hasServerMetadata: false
            }),

            manager = new breeze.EntityManager({ dataService: dataService });

        /**
         * @ngdoc method
         * @name fvApp.service:ReviewSvc
         * @function
         *
         * @description
         * Fetches old imported reviews for a user, uniquely identified by the Guid param
         *
         * @param {String} userID: the user's ID
         * @returns Array.<Object>
         */
        ReviewSvc.fetchReviews = function (userID) {
            var deferred = $q.defer(),
                query = new breeze.EntityQuery('SellerReviews').expand('User, Text.Literals').where('SellerProfile.ID', 'eq', userID);

            manager.executeQuery(query).then(function (response) {
                deferred.resolve(_.filter(response.results[0].value, function (review) {
                    return review.Text.Literals[0].Text !== ''; // remove reviews that have no text
                }));
            }, function (error) {
                deferred.reject(error);
            });

            return deferred.promise;
        };

        return ReviewSvc;
    }]);

}());
