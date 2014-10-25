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
    app.controller('ApplyImportCtrl', ['$scope', '$timeout', 'EVENTS', 'ProfileSvc', function ($scope, $timeout, events, ProfileSvc) {
        $scope.providers = ProfileSvc.initProviders();
        $scope.selectedProviders = [];

        // toggles the given provider's selection state
        $scope.toggleSelection = function (providerName) {
            var provider = $scope.providers[providerName];
            provider.selected = !provider.selected;
            if (provider.selected) {
                $scope.$broadcast(events.ui.providerSelected, providerName); // required to auto scroll down
                $scope.selectedProviders.push(provider);
            } else {
                _.remove($scope.selectedProviders, function (selectedProvider) {
                    return selectedProvider.name === provider.name;
                });
            }
        };

        // returns the giver provider's selection state
        $scope.isSelected = function (providerName) {
            return $scope.providers[providerName].selected;
        };

        $scope.hasUnsavedProviders = function () {
            return _.find($scope.selectedProviders, function (provider) {
                return !provider.saved; // return the first unsaved provider in selectedProviders
            });
        };

        // save a provider link on the backend
        $scope.saveProvider = function (providerName) {
            var provider = $scope.providers[providerName];
            provider.inProgress = true;

            ProfileSvc.saveProvider(provider).then(function (res) {
                console.log(res);
                provider.saved = true;
                provider.inProgress = false;
                ProfileSvc.updateProfile({
                    providers: new ProfileSvc.Provider(provider.name, provider.url)
                });
                console.log(ProfileSvc.getProfile());
            }, function (error) {
                //TODO: error handling
                provider.inProgress = false;
                console.log(error);
            });
        };

        // remove a provider link & corresponding data
        $scope.removeProvider = function (provider) {
            provider.inProgress = true;
            ProfileSvc.removeProvider(provider).then(function () {
                provider.selected = false;
                provider.saved = false;
                provider.inProgress = false;
                provider.url = '';
                _.remove($scope.selectedProviders, provider);
                ProfileSvc.updateProfile({
                    providers: new ProfileSvc.Provider(provider.name, '')
                });
                console.log(ProfileSvc.getProfile());
            }, function (error) {
                //TODO: error handling
                provider.inProgress = false;
                console.log(error);
            });
        };

        $scope.editProvider = function (provider) {
            provider.saved = false;
        };
    }]);

}());
