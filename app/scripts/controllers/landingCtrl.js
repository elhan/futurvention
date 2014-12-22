(function () {
    'use strict';

    var app = angular.module('fvApp');

    /**
     * @ngdoc Controller
     * @name fvApp.controller:LandingCtrl
     * @description
     * # LandingCtrl
     * Controls the landing page
     */
    app.controller('LandingCtrl', ['$scope', function ($scope) {

        $scope.continue = function () {
            $scope.session.hasRegistered ? $scope.go('/apply') : $scope.go('/register');
        };

    }]);

}());
