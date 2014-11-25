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
    app.controller('ApplyImportCtrl', ['$scope', 'EVENTS', 'MESSAGES', 'ImporterSvc', 'NotificationSvc', function ($scope, events, msg, ImporterSvc, NotificationSvc) {
        $scope.importers = ImporterSvc.getImporters();

        $scope.selected = new ImporterSvc.ImporterCollection();
        $scope.selectedImporters = $scope.selected.importers;

        $scope.done = ImporterSvc.getImporters('profileDone');

        // toggles the given provider's selection state
        $scope.toggleSelection = function (importer) {
            if ($scope.isSelected(importer)) {
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

        ///////////////////////////////////////////////////////////
        /// Event handling
        ///////////////////////////////////////////////////////////

        $scope.$on(events.importer.profileReady, function (event, importer) {
            NotificationSvc.show({
                content: msg.success.profileImported + importer.provider,
                type: 'success'
            });
            $scope.goToStep(1);
        });

    }]);

}());
