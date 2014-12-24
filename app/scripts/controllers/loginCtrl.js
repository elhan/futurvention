(function () {
    'use strict';

    var app = angular.module('fvApp');

    /**
     * @ngdoc Controller
     * @name fvApp.controller:LoginCtrl
     * @description
     * # LoginCtrl
     * Controller of the login form
     */
    app.controller('LoginCtrl', ['$scope', '$rootScope', 'EVENTS', 'MESSAGES', 'Utils', 'AccountSvc', 'NotificationSvc', function ($scope, $rootScope, events, msg, utils, AccountSvc, NotificationSvc) {

        $scope.email = '';
        $scope.password = '';
        $scope.rememberMe = false;

        // initialize errors
        $scope.authError = false;

        $scope.clearAuthError =  function () {
            $scope.authError = false;
        };

        $scope.login = function (provider) {

            if (provider) { // Facebook or LinkedIn
                AccountSvc.externalLogin(provider);
                return;
            }

            AccountSvc.login({ email: $scope.email, password: $scope.password, rememberMe: $scope.rememberMe }).then(function (response) {

                if (response.status === 401) {
                    $scope.authError = msg.error.wrongCredentials;
                    $rootScope.$broadcast(events.auth.loginFailed, event);
                } else {
                    $rootScope.$broadcast(events.auth.loginSuccess, event);
                }

            }, function (error) {
                var errorMsg;

                console.log(error);

                if (error.status === 400) { // wrong email format
                    try {
                        errorMsg = error.data.ModelState['Email'][0]; // loginModel.Email is a key on ModelState
                        $scope.authError = msg.error.wrongCredentials;
                    } catch (error) { // server data was not formed correctly
                        console.log(error);
                        $scope.authError =  msg.error.generic;
                    }

                } else {
                    $scope.authError =  msg.error.generic;
                }
            });
        };

        ///////////////////////////////////////////////////////////
        /// Custom validation functions
        ///////////////////////////////////////////////////////////

        $scope.isEmail = function (email) {
            return utils.testEmailPattern(email);
        };

        $scope.hasDigits = function (pwd) {
            return /\d+/g.test(pwd);
        };

        $scope.hasNonAlphanumeric = function (pwd) {
            return /\W/g.test(pwd);
        };

        $scope.hasLowercase = function (pwd) {
            return /[a-z]/.test(pwd);
        };

        $scope.hasUppercase = function (pwd) {
            return /[A-Z]/.test(pwd);
        };

    }]);

}());
