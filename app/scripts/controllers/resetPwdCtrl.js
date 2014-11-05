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
    app.controller('ResetPwdCtrl', ['$scope', 'AuthSvc', '$alert', function ($scope, AuthSvc, $alert) {
        $scope.email = '';

        $scope.resetPassword = function () {
            AuthSvc.resetPassword($scope.email).then(function (response) {
                //TODO
                console.log(response);
                $alert({
                    content: 'Your password has been reset!',
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
