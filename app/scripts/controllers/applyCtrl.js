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
    app.controller('ApplyCtrl', ['$scope', 'EVENTS', 'ProfileSvc', function ($scope, events, ProfileSvc) {
        $scope.steps = ProfileSvc.getSteps();

        $scope.activeStep = ProfileSvc.getActiveStep() ? ProfileSvc.getActiveStep() : 'import';

        $scope.goToStep = function (step) {
            $scope.activeStep = $scope.steps[step];
        };

        ////////////////////////////////////////////
        /// Watchers
        ////////////////////////////////////////////

        $scope.$watch('activeStep', function (newValue, oldValue) { // keep latest step in local storage
            if (!newValue || newValue === oldValue) {
                return;
            }
            ProfileSvc.setActiveStep($scope.activeStep);
        });

        ////////////////////////////////////////////
        /// Initialization
        ////////////////////////////////////////////

        $scope.goToStep($scope.steps.indexOf($scope.activeStep));
    }]);

}());
