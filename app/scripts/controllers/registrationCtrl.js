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
    app.controller('RegistrationCtrl', ['$scope', '$rootScope', '$timeout', 'EVENTS', 'MESSAGES', 'Utils', 'AccountSvc', function ($scope, $rootScope, $timeout, events, msg, utils, AccountSvc) {

        // the models for the registration form
        $scope.newUser = {
            firstName: '',
            lastName: '',
            email: '',
            password: ''
        };

        // initialize server-side errors
        $scope.authError = false;

        $scope.registrationInProgress = false;

        $scope.register = _.throttle(function (provider) {
            $scope.registrationInProgress = true;

            if (provider) { //facebook or linkedin
                AccountSvc.externalLogin(provider);
                return;
            }

            AccountSvc.register($scope.newUser).then(function (response) {
                $scope.registrationInProgress = false;
                $rootScope.$broadcast(events.auth.registrationSuccess);
            }, function (error) {
                var messages;

                $scope.registrationInProgress = false;

                $rootScope.$broadcast(events.auth.registrationFailed);

                if (error.status === 400) {
                    try {
                        messages = error.data.ModelState['_identity'];

                        _.each(messages, function (message) {
                            if (message.indexOf('is already taken') !== -1) {
                                $scope.authError = msg.error.emailTaken;
                            }
                        });

                    } catch (error) { // malformed response
                        console.log(error);
                        $scope.authError = msg.error.generic;
                    }
                }
            });
        }, 1000);

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
