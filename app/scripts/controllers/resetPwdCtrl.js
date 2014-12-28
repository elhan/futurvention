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
    app.controller('ResetPwdCtrl', ['$scope', '$alert', 'MESSAGES', 'EVENTS', 'Utils', 'AccountSvc', 'ProfileSvc', function ($scope, $alert, msg, events, utils, AccountSvc, ProfileSvc) {

        var alert;

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

                // wrap this in try catch: if the alert is not open angularstrap will throw an error
                try {
                    alert && alert.hide();
                } catch (error) {
                    console.log(error);
                }

                alert = $alert({ content: msg.success.resetPassword, type: 'success', dismissable: true, show: true, duration: false });

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

        $scope.onPwdInputChange = function () {
            $scope.authError = false;

            // wrap this in try catch: if the alert is not open angularstrap will throw an error
            try {
                alert && alert.hide();
            } catch (error) {
                console.log(error);
            }

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

        ///////////////////////////////////////////////////////////
        /// Event handling
        ///////////////////////////////////////////////////////////

        // After completion the user should get redirected to their storefront, if they have one.
        $scope.$on(events.ui.alertClosed, function () {
            ProfileSvc.fetchOwnProfile().then(function (profile) {
                $scope.go('/' + profile.Moniker);
            }, function () {
                $scope.go('/');
            });
        });

        $scope.$on('$destroy', function () {
            // wrap this in try catch: if the alert is not open angularstrap will throw an error
            try {
                alert && alert.hide();
            } catch (error) {
                console.log(error);
            }
        });
    }]);

}());
