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
    app.controller('ForgotPwdCtrl', ['$scope', 'AuthSvc', '$alert', function ($scope, AuthSvc, $alert) {
        $scope.email = '';

        $scope.forgotPassword = function () {
            AuthSvc.forgotPassword($scope.email).then(function (response) {
                //TODO
                console.log(response);
                $alert({
                    content: 'We sent you an email. Follow the instructions to create a new password.',
                    type: 'success',
                    dismissable: true
                });
                $scope.go('/login');
            }, function () {
                //TODO
            });
        };
    }]);

}());
