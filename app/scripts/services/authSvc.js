(function () {
    'use strict';
    var app = angular.module('fvApp');

    /**
     * @ngdoc service
     * @name fvApp.service:AuthSvc
     * @description
     * # AuthSvc
     * A service to handle authentication and authorization.
     */
    app.service('AuthSvc', ['$q', '$http', 'PATHS', 'Utils', function ($q, $http, paths, utils) {
        var AuthSvc = {};

        AuthSvc.register = function (newUser) {
            return $http({
                method: 'POST',
                url: paths.registration,
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                transformRequest: function(obj) {
                    var str = [];
                    for (var p in obj) {
                        if (obj.hasOwnProperty(p)) {
                            //backend needs query strings to be capitalized e.g. ?Email= ...
                            str.push(encodeURIComponent(utils.capitalize(p)) + '=' + encodeURIComponent(obj[p]));
                        }
                    }
                    return str.join('&');
                },
                data: newUser
            });
        };

        AuthSvc.forgotPassword = function (email) {
            //TODO
            var deferred = $q.defer();
            deferred.resolve(email);
            return deferred.promise;
        };

        AuthSvc.resetPassword = function (email) {
            //TODO
            var deferred = $q.defer();
            deferred.resolve(email);
            return deferred.promise;
        };
        return AuthSvc;
    }]);

}());
