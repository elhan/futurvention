(function () {
    'use strict';

    var app = angular.module('fvApp');

    /**
     * @ngdoc Controller
     * @name fvApp.controller:ResetPwdCtrl
     * @description
     * # ResetPwdCtrl
     * Controls the reset password page
     */
    app.controller('ResetPwdCtrl', ['$scope', 'MESSAGES', 'Utils', 'AccountSvc', 'NotificationSvc', function ($scope, msg, utils, AccountSvc, NotificationSvc) {

        $scope.oldPassword = '';
        $scope.newPassword = '';
        $scope.confirmPassword = '';

        $scope.authError = false;

        $scope.resetPassword = function () {
            var credentials = {
                OldPassword: $scope.oldPassword,
                NewPassword: $scope.newPassword,
                ConfirmPassword: $scope.confirmPassword
            };

            AccountSvc.resetPassword(credentials).then(function () {

                NotificationSvc.show({
                    content: msg.success.resetPassword,
                    type: 'success'
                }).then(function () {
                    $scope.go('/login');
                });

            }, function (error) {
                // TODO: add logging
                console.log(error);

                if (error.status === 400) {
                    try {
                        _.each(error.data.ModelState['_identity'], function (message) {
                            if (message.indexOf('Incorrect password') !== -1) {
                                $scope.authError = msg.error.wrongPassword;
                            }
                        });
                    } catch (error) {
                        // TODO: add logging
                        console.log(error);
                        $scope.authError = msg.error.generic;
                    }
                } else {
                    $scope.authError = msg.error.generic;
                }

            });
        };

        ///////////////////////////////////////////////////////////
        /// Custom validation functions
        ///////////////////////////////////////////////////////////

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
