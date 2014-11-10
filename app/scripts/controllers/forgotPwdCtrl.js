(function () {
    'use strict';

    var app = angular.module('fvApp');

    /**
     * @ngdoc Controller
     * @name fvApp.controller:ForgotPwdCtrl
     * @description
     * # ForgotPwdCtrl
     * Controls the reset password page
     */
    app.controller('ForgotPwdCtrl', ['$scope', 'AccountSvc', 'MESSAGES', 'NotificationSvc', function ($scope, AccountSvc, msg, NotificationSvc) {
        $scope.email = '';

        $scope.forgotPassword = function () {
            AccountSvc.forgotPassword($scope.email).then(function (response) {
                //TODO
                console.log(response);
                NotificationSvc.show({
                    content: msg.success.createNewPassword,
                    type: 'success',
                    dismissable: true
                }).then(function () {
                    $scope.go('/login');
                });
            }, function () {
                NotificationSvc.show({
                    content: msg.error.generic,
                    type: 'error',
                    dismissable: true
                });
            });
        };
    }]);

}());
