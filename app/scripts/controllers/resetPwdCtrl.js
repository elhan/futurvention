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
    app.controller('ResetPwdCtrl', ['$scope', 'MESSAGES', 'AccountSvc', 'NotificationSvc', function ($scope, msg, AccountSvc, NotificationSvc) {
        $scope.oldPassword = '';
        $scope.newPassword = '';
        $scope.confirmPassword = '';

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
            }, function () {
                NotificationSvc.show({
                    content: msg.error.generic,
                    type: 'error'
                });
            });
        };
    }]);

}());
