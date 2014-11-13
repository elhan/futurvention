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
        // the models for the registration form
        $scope.newUser = {
            email: '',
            password: ''
        };

        // initialize errors
        $scope.authError = {
            credentials: false
        };

        $scope.clearAuthError =  function () {
            $scope.authError.credentials = false;
        };

        $scope.login = function (provider) {
            if (provider) { // Facebook or LinkedIn
                AccountSvc.externalLogin(provider);
                return;
            }
            AccountSvc.login($scope.newUser).then(function () {
                $rootScope.$broadcast(events.auth.loginSuccess, event);
            }, function (error) {
                console.log(error);
                switch (error.status) {
                case 401: //unauthorized
                    $scope.authError.credentials = true;
                    break;
                default:
                    console.log(event, error);
                    NotificationSvc.show({
                        content: msg.error.generic,
                        type: 'error'
                    });
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
