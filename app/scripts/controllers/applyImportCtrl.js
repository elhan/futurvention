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
    app.controller('ApplyImportCtrl', ['$scope', 'EVENTS', 'Utils', 'ImporterSvc', function ($scope, events, utils, ImporterSvc) {

        $scope.importers = [];

        $scope.selectedImporters = [];

        $scope.oldImporters = []; // old importers are stored in the local storage. Their input elements are disabled

        $scope.toggleSelection = function (importer) {
            switch (true) {
            case $scope.isOld(importer): // if old, ignore
                return;
            case $scope.isSelected(importer):
                _.remove($scope.selectedImporters, importer); // if selected but not old, unselect
                return;
            default: // if new, select
                $scope.selectedImporters.push(importer);
                $scope.$broadcast(events.ui.providerSelected, importer.Provider); // required to auto scroll down
            }
        };

        $scope.isSelected = function (importer) {
            return $scope.selectedImporters.indexOf(importer) > -1;
        };

        $scope.isOld = function (importer) {
            return angular.isDefined(_.find($scope.oldImporters, function (imp) {
                return imp.Provider === importer.Provider;
            }));
        };

        $scope.import = function () {
            _.remove($scope.selectedImporters, function (imp) { return imp.Url === ''; }); // remove importers with no value

            ImporterSvc.import($scope.selectedImporters).then(function () {
                $scope.goToStep(1);
            });
        };

        /*
            If the importer is old remove it from the oldImporters collection & update localStorage,
            otherwise just remove it from the selectedImporters.
        **/
        $scope.removeImporter = function (importer) {

            if ($scope.isOld(importer)) {
                _.remove($scope.oldImporters, importer);
                ImporterSvc.storeImporters($scope.oldImporters);
            }

            $scope.toggleSelection(importer);
        };

        $scope.ignoreInputs = function () {
            var emptyImporters, newImporters;

            newImporters = _.filter($scope.selectedImporters, function (importer) {
                return !$scope.isOld(importer);
            });

            if (!newImporters || newImporters.length === 0) {
                return true;
            }

            emptyImporters = _.filter(newImporters, function (importer) {
                return importer.Url === '';
            });

            emptyImporters = emptyImporters ? emptyImporters : []; // since we are checking its length, make sure this is always an array

            return newImporters.length === emptyImporters.length;
        };

        ///////////////////////////////////////////////////////////
        /// Initialization
        ///////////////////////////////////////////////////////////

        // get all supported importer objects
        $scope.importers = ImporterSvc.getImporters();

        // update importers with the user's guid
        _.each($scope.importers, function (importer) {
            utils.updateProperties(importer, { Guid: $scope.currentUser.Guid });
        });

        // updtate the service collection with the user's guid
        ImporterSvc.setImporters($scope.importers);

        /*
            Fetch all importers for which the user has initiated an import from the local storage
            and update the selectedImporters and oldImporters collections.
        **/

        ImporterSvc.getStoredImporters().then(function (old) {
            var imp;

            _.each(old, function (importer) {

                imp = _.find($scope.importers, function (defaultImporter) {
                    return defaultImporter.Provider === importer.Provider;
                });

                utils.updateProperties(imp, importer); // update the provider's Url

                $scope.oldImporters.push(imp);
                $scope.selectedImporters.push(imp);
            });

        }, function (error) {
            console.log(error);
        });

    }]);

}());
