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
    app.controller('ResetPwdCtrl', ['$scope', 'AuthSvc', 'NotificationSvc', function ($scope, AuthSvc, NotificationSvc) {
        $scope.email = '';

        $scope.resetPassword = function () {
            AuthSvc.resetPassword($scope.email).then(function (response) {
                //TODO
                console.log(response);
                NotificationSvc.show({
                    content: 'Your password has been reset!',
                    type: 'success',
                    dismissable: true
                }).then(function () {
                    $scope.go('/login');
                });
            }, function () {
                //TODO
            });
        };
    }]);

}());
