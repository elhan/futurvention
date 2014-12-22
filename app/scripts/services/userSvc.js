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
    app.service('UserSvc', ['$rootScope', '$http', '$q', 'PATHS', 'EVENTS', 'Odata', 'breeze', 'ImporterSvc', function ($rootScope, $http, $q, paths, events, odata, breeze, ImporterSvc) {
        var UserSvc = {},

            dataService = new breeze.DataService({
                serviceName: paths.public,
                hasServerMetadata: false
            }),

            manager = new breeze.EntityManager({ dataService: dataService });

        /**
         * @ngdoc method
         * @name fvApp.service:UserSvc
         * @function
         *
         * @description
         * Fetches the current user object
         *
         * @returns {User}
         */
        UserSvc.fetchOwnUser = function () {
            var deferred = $q.defer();

            $http.get(paths.user.self).then(function (response) {
                var user = new odata.User(response.data);

                $rootScope.$broadcast(events.user.updateSuccess, user);

                ImporterSvc.updateGuid(user.Guid);

                deferred.resolve(user);

            }, function (error) {
                deferred.reject(error);
            });

            return deferred.promise;
        };

        /**
         * @ngdoc method
         * @name fvApp.service:UserSvc
         * @function
         *
         * @description
         * Fetches a User object
         *
         * @param {Integer} userID
         * @returns {User}
         */
        UserSvc.fetchUser = function (userID) {
            var deferred = $q.defer(),

            query = new breeze.EntityQuery('User/Futurvention.Ergma.DataAccess.EntityFramework.ErgmaUser')
                .expand('Avatar')
                .where('ID', 'eq', userID);

            manager.executeQuery(query).then(function (response) {
                deferred.resolve(response.results[0].value[0]);
            }, function (error) {
                deferred.reject(error);
            });

            return deferred.promise;
        };

        UserSvc.saveExternalAvatar = function (avatarLink) {
            var deferred = $q.defer();

            $http({
                method: 'PUT',
                url: paths.user.ownAvatar,
                params: {
                    url: avatarLink
                }
            }).then(function () {
                UserSvc.fetchOwnUser().then(function (response) {
                    deferred.resolve(response);
                }, function (error) {
                    deferred.reject(error);
                });
            }, function (error) {
                deferred.reject(error);
            });

            return deferred.promise;
        };
        return UserSvc;
    }]);
}());
