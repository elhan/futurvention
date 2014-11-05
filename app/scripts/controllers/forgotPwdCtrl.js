(function () {
    'use strict';

    var app = angular.module('fvApp');

    /**
     * @ngdoc Controller
     * @name fvApp.controller:ForgotPwdCtrl
     * @description
     * # ForgotPwdCtrl
     * Controls the forgot password page
     */
    app.controller('ForgotPwdCtrl', ['$scope', 'UserSvc', function ($scope, UserSvc) {
        $scope.email = '';

        $scope.resetPassword = function () {
            UserSvc.resetPassword($scope.email).then(function (response) {
                console.log(response);
                //TODO
            }, function () {
                //TODO
            });
        };
    }]);

}());
