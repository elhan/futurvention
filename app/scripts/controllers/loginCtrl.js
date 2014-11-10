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
    app.controller('LoginCtrl', ['$scope', '$rootScope', 'EVENTS', 'AccountSvc', function ($scope, $rootScope, events, AccountSvc) {
        // the models for the registration form
        $scope.newUser = {
            email: '',
            password: ''
        };

        // initialize errors
        $scope.authError = {
            invalidEmail: false,
            invalidPassword: false
        };

        $scope.login = function (loginData) {
            AccountSvc.register(loginData).then(function (response) {
                console.log(response);
                $rootScope.$broadcast(events.auth.loginSuccess, event);
            }, function (error) {
                // TODO: sync with new backend
                switch (error.code) {
                case 'INVALID_USER':
                    $scope.authError.invalidUser = $scope.newUser.email;
                    break;
                case 'INVALID_EMAIL':
                    $scope.authError.invalidEmail = $scope.newUser.email;
                    break;
                case 'INVALID_PASSWORD':
                    $scope.authError.invalidPassword= $scope.newUser.password;
                    break;
                default: // the rest of the authentication errors should not be displayed to the user, just logged
                    // TODO: add to logger when client logging is implemented
                    console.log(event, error);
                }
            });
        };

    }]);

}());
