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
    app.controller('LoginCtrl', ['$scope', '$rootScope', 'EVENTS', 'MESSAGES', 'AccountSvc', 'NotificationSvc', function ($scope, $rootScope, events, msg, AccountSvc, NotificationSvc) {
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
            AccountSvc.login(loginData).then(function (response) {
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
                default:
                    console.log(event, error);
                    NotificationSvc.show({
                        content: msg.error.generic,
                        type: 'error'
                    });
                }
            });
        };

    }]);

}());
