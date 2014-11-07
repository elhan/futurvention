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
  app.controller('RegistrationCtrl', ['$scope', '$rootScope', 'EVENTS', 'AuthSvc', function ($scope, $rootScope, EVENTS, AuthSvc) {

        // the models for the registration form
        $scope.newUser = {
            firstName: '',
            lastName: '',
            email: '',
            password: ''
        };

        // initialize errors
        $scope.authError = {
            emailTaken: false,
            invalidEmail: false,
            invalidPassword: false
        };

        $scope.register = function (newUser) {
            AuthSvc.register(newUser).then(function (response) {
                console.log(response);
            }, function () {
                //TODO
            });
        };

        // Registration error handling
        $scope.$on('auth-registration-failed', function (event, error) {
            switch (error.code) {
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
