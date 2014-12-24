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
    app.service('AccountSvc', ['$q', '$http', 'PATHS', 'MESSAGES', 'NotificationSvc', function ($q, $http, paths, msg, NotificationSvc) {
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

        AccountSvc.login = function (inputData) {
            return $http.post(paths.account.login, {
                Email: inputData.email,
                Password: inputData.password,
                RememberMe: inputData.rememberMe
            });
        };

        AccountSvc.logout = function () {
            var deferred = $q.defer();

            $http.post(paths.account.logout, {}).then(function () {
                localStorage.removeItem('importers');
                localStorage.removeItem('activeStep');
                deferred.resolve();
            }, function (error) {
                deferred.reject(error);
            });

            return deferred.promise;
        };

        AccountSvc.forgotPassword = function (email) {
            //TODO
            var deferred = $q.defer();
            deferred.resolve(email);
            return deferred.promise;
        };

        AccountSvc.resetPassword = function (credentials) {
            return $http.post(paths.account.resetPassword, credentials);
        };

        AccountSvc.getUserInfo = function () {
            var deferred = $q.defer();

            $http.get(paths.account.userInfo).then(function (response) {
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
            return $http.get(paths.account.externalLogins);
        };

        AccountSvc.externalLogin = function (authProvider) {
            AccountSvc.externalLogins().then(function (response) {
                window.location.replace(paths.root + _.find(response.data, function (provider) {
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
