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
        $scope.email = '';

        $scope.resetPassword = function () {
            AccountSvc.resetPassword($scope.email).then(function () {
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
