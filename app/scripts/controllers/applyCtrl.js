(function () {
    'use strict';

    var app = angular.module('fvApp');

    /**
     * @ngdoc Controller
     * @name fvApp.controller:ApplyCtrl
     * @description
     * # ApplyCtrl
     * Controls the apply page & seller profile completion
     */
    app.controller('ApplyCtrl', ['$scope', 'ProfileSvc', function ($scope, ProfileSvc) {
        $scope.steps = ProfileSvc.getSteps();
        $scope.activeStep = ProfileSvc.getActiveStep();

        $scope.goToStep = function (step) {
            $scope.activeStep = $scope.steps[step];
            ProfileSvc.setActiveStep($scope.activeStep);
        };

        $scope.goToStep(2);
    }]);

}());
