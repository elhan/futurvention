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
    app.service('AccountSvc', ['$q', '$http', '$timeout', 'PATHS', 'MESSAGES', 'ENV', 'NotificationSvc', function ($q, $http, $timeout, paths, msg, env, NotificationSvc) {
        var AccountSvc = {};

        AccountSvc.register = function (newUser) {
            return $http.post(env.api.endPoint + paths.account.register, {
                Email: newUser.email,
                Password: newUser.password,
                ConfirmPassword: newUser.password,
                FirstName: newUser.firstName,
                LastName: newUser.lastName
            });
        };

        AccountSvc.login = function (inputData) {
            return $http.post(env.api.endPoint + paths.account.login, {
                Email: inputData.email,
                Password: inputData.password,
                RememberMe: inputData.rememberMe
            });
        };

        AccountSvc.logout = function () {
            var deferred = $q.defer();

            $http.post(env.api.endPoint + paths.account.logout, {}).then(function () {
                localStorage.removeItem('importers');
                deferred.resolve();
            }, function (error) {
                deferred.reject(error);
            });

            return deferred.promise;
        };

        AccountSvc.forgotPassword = function (email) {
            var deferred = $q.defer();
            deferred.resolve(email);
            return deferred.promise;
        };

        AccountSvc.resetPassword = function (credentials) {
            return $http.post(env.api.endPoint + paths.account.resetPassword, credentials);
        };

        AccountSvc.getUserInfo = function () {
            var deferred = $q.defer();

            $http.get(env.api.endPoint + paths.account.userInfo).then(function (response) {
                deferred.resolve({
                    email: response.data.UserName,
                    userID: response.data.UserID,
                    authProvider: response.data.LoginProvider,
                    hasRegistered: response.data.HasRegistered
                });
            }, function (error) {
                console.log(error);
                deferred.reject(error);
            });

            return deferred.promise;
        };

        AccountSvc.externalLogins = function () {
            return $http.get(env.api.externalLogins);
        };

        AccountSvc.externalLogin = function (authProvider) {
            AccountSvc.externalLogins().then(function (response) {
                window.location.replace(env.api.endPoint + _.find(response.data, function (provider) {
                    return provider.Name === authProvider;
                }).Url);
            }, function (error) {
                console.log(error);
                NotificationSvc.show({
                    content: msg.error.generic,
                    type: 'error'
                });
            });
        };

        return AccountSvc;
    }]);

}());
