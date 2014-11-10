(function () {
    'use strict';
    var app = angular.module('fvApp');

    /**
     * @ngdoc service
     * @name fvApp.service:AccountSvc
     * @description
     * # AccountSvc
     * A service to handle authentication, authorization, and User objects.
     */
    app.service('AccountSvc', ['$q', '$http', 'PATHS', function ($q, $http, paths) {
        var AccountSvc = {};

        AccountSvc.register = function (newUser) {
            return $http.post(paths.account.register, {
                Email: newUser.email,
                Password: newUser.password,
                ConfirmPassword: newUser.password,
                FirstName: newUser.firstName,
                LastName: newUser.lastName
            });
        };

        AccountSvc.login = function (user) {
            return $http.post(paths.account.login, {
                Email: user.email,
                Password: user.password,
                RememberMe: true,
            });
        };

        AccountSvc.logout = function () {
            return $http.post(paths.account.logout, {});
        };

        AccountSvc.forgotPassword = function (email) {
            //TODO
            var deferred = $q.defer();
            deferred.resolve(email);
            return deferred.promise;
        };

        AccountSvc.resetPassword = function (email) {
            //TODO
            var deferred = $q.defer();
            deferred.resolve(email);
            return deferred.promise;
        };

        AccountSvc.getUserInfo = function () {
            return $http.get(paths.account.userInfo);
        };

        return AccountSvc;
    }]);

}());
