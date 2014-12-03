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
    app.controller('ApplyCtrl', ['$scope', 'EVENTS', 'ProfileSvc', 'ImporterSvc', function ($scope, events, ProfileSvc, ImporterSvc) {
        $scope.steps = ProfileSvc.getSteps();
        $scope.activeStep = ProfileSvc.getActiveStep();

        $scope.goToStep = function (step) {
            $scope.activeStep = $scope.steps[step];
            ProfileSvc.setActiveStep($scope.activeStep);
        };

        ////////////////////////////////////////////
        /// Watchers
        ////////////////////////////////////////////

        $scope.$on(events.importer.reviewsReady, function (event, importer) {
            ImporterSvc.fetchReviews().then(function (response) {
                console.log(response);
            }, function (error) {
                console.log(error);
            });
        });

        ////////////////////////////////////////////
        /// Initialization
        ////////////////////////////////////////////

        $scope.goToStep($scope.steps.indexOf($scope.activeStep));
    }]);

}());
