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
    app.service('UserSvc', ['$rootScope', '$http', '$q', 'PATHS', 'EVENTS', 'Odata', function ($rootScope, $http, $q, paths, events, odata) {
        var UserSvc = {};

        UserSvc.fetchUser = function () {
            var deferred = $q.defer();

            $http.get(paths.user.self).then(function (response) {
                var user = new odata.User(response.data);
                $rootScope.$broadcast(events.user.updateSuccess, user);
                deferred.resolve(user);
            }, function (error) {
                deferred.reject(error);
            });

            return deferred.promise;
        };

        return UserSvc;
    }]);
}());
