(function () {
    'use strict';

    var app = angular.module('fvApp');

    /**
     * @ngdoc Controller
     * @name fvApp.controller:ApplyImportCtrl
     * @description
     * # ApplyImportCtrl
     * Controls the apply 'import' step
     */
    app.controller('ApplyImportCtrl', ['$scope', 'EVENTS', 'ImporterSvc', function ($scope, events, ImporterSvc) {
        $scope.importers = ImporterSvc.getImporters();

        $scope.selected = new ImporterSvc.ImporterCollection();
        $scope.selectedImporters = $scope.selected.importers;

        $scope.done = ImporterSvc.getImporters('done');

        // toggles the given provider's selection state
        $scope.toggleSelection = function (importer) {
            if($scope.isSelected(importer)) {
                _.remove($scope.selectedImporters, importer);
                return;
            }
            $scope.selectedImporters.push(importer);
            $scope.$broadcast(events.ui.providerSelected, importer.provider); // required to auto scroll down
        };

        $scope.isSelected = function (importer) {
            return $scope.selectedImporters.indexOf(importer) > -1;
        };

        $scope.import = function () {
            ImporterSvc.import($scope.selectedImporters);
        };

//        $scope.$on(events.importer.profileReady, function () {
//            $scope.goToStep(1);
//        });

        $scope.$on(events.importer.portfolioReady, function () {
            console.log(ImporterSvc.getImporters('done'));
            ImporterSvc.fetchPortfolio().then(function (response) {
                console.log(response);
            }, function (error) {
                console.log(error);
            });
        });

        $scope.$on(events.importer.reviewsReady, function () {
            console.log(ImporterSvc.getImporters('done'));
        });
    }]);

}());
