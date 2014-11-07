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
    app.controller('ForgotPwdCtrl', ['$scope', 'AuthSvc', 'NotificationSvc', function ($scope, AuthSvc, NotificationSvc) {
        $scope.email = '';

        $scope.forgotPassword = function () {
            AuthSvc.forgotPassword($scope.email).then(function (response) {
                //TODO
                console.log(response);
                NotificationSvc.show({
                    content: 'We sent you an email. Follow the instructions to create a new password.',
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
