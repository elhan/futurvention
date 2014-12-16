(function () {
    'use strict';

    var app = angular.module('fvApp');

    /**
     * @ngdoc Controller
     * @name fvApp.controller:registrationCtrlCtrl
     * @description
     * # RegistrationCtrl
     * Controlls of the registration page
     */
    app.controller('RegistrationCtrl', ['$scope', '$rootScope', 'EVENTS', 'Utils', 'AccountSvc', function ($scope, $rootScope, events, utils, AccountSvc) {

        // the models for the registration form
        $scope.newUser = {
            firstName: '',
            lastName: '',
            email: '',
            password: ''
        };

        // initialize server-side errors
        $scope.authError = {
            email: [],
            password: []
        };

        $scope.register = function (provider) {
            if (provider) { //facebook or linkedin
                AccountSvc.externalLogin(provider);
                return;
            }
            AccountSvc.register($scope.newUser).then(function () {
                $rootScope.$broadcast(events.auth.registrationSuccess);
            }, function (error) {
                // TODO: error handling
                console.log(error);
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

        ///////////////////////////////////////////////////////////
        /// Event handlers
        ///////////////////////////////////////////////////////////

        // Registration error handling
        $scope.$on(events.auth.registrationFailed, function (event, error) {
            switch (error.status) {
            case 'EMAIL_TAKEN':
                // cache last taken email to properly display errors
                $scope.authError.emailTaken = $scope.newUser.email;
                break;
            case 'INVALID_EMAIL':
                $scope.authError.invalidEmail = $scope.newUser.email;
                break;
            default: // the rest of the registration errors should not be displayed to the user, just logged
                // TODO: add to logger when client logging is implemented
                console.log(event, error);
            }
        });

    }]);

}());
