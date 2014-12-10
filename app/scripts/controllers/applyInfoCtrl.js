(function () {
    'use strict';

    var app = angular.module('fvApp');

    /**
     * @ngdoc Controller
     * @name fvApp.controller:ApplyInfoCtrl
     * @description
     * # ApplyInfoCtrl
     * Controls the apply 'info' step
     */
    app.controller('ApplyInfoCtrl', ['$scope', '$modal', '$timeout', 'EVENTS', 'Utils', 'Odata', 'ProfileSvc', 'LocationSvc', 'ImporterSvc', 'NotificationSvc', function ($scope, $modal, $timeout, events, utils, odata, ProfileSvc, LocationSvc, ImporterSvc, NotificationSvc) {
        var modalImageCrop = $modal({
            scope: $scope,
            template: 'views/components/modalImageCrop.html',
            show: false,
            animation: 'am-slide-top',
            keyboard: true
        });

        $scope.profile = ProfileSvc.getProfile();
        $scope.profileExists = false;

        $scope.showImageCropModal = function () {
            modalImageCrop.$promise.then(function () {
                $scope.croppedImage = ''; // reset the croppedImage object
                modalImageCrop.show();
            });
        };

        $scope.monikerIsValid = false; // true if the user has set a url that already exists. Used to display error label

        $scope.city = {};
        $scope.cities = [];
        $scope.cityName = '';
        $scope.cityNames = [];

        $scope.countries = []; // all available countries
        $scope.countryName = ''; //model for the country dropdown
        $scope.countryNames = []; //data dor the countries dropdown

        $scope.validateMoniker = function () {
            ProfileSvc.validateMoniker($scope.profile.Moniker).then(function (res) {
                $scope.monikerIsValid = !res.data; // returns true if moniker exists
            }, function (err) {
                console.log(err);
            });
        };

        // on continue, save the rest of the user's info
        $scope.continue = function () {
            switch (true) {
            case $scope.profileInfoForm.$pristine:
                break;
            case $scope.profileExists:
                ProfileSvc.patchProfile(utils.removeEmptyProperties($scope.profile), $scope.profile.ID).then(function (response) {
                    console.log(response);
                }, function (error) {
                    console.log(error);
                });
                break;
            default:
                ProfileSvc.createProfile(utils.removeEmptyProperties($scope.profile)).then(function (response) {
                    console.log(response);
                }, function (error) {
                    console.log(error);
                });
            }

            $scope.goToStep(2);
        };

        $scope.searchCity = _.throttle(function (prefix) {
            prefix && LocationSvc.searchCity($scope.country.ID, prefix).then(function (cities) {
                $timeout(function () {
                    $scope.cities = cities;
                    $scope.cityNames = _.map(cities, function (city) {
                        return city.getName();
                    });
                });

            }, function (error) {
                console.log(error);
            });
        }, 700);

        $scope.hasNonAlphanumeric = function (pwd) {
            return /\W/g.test(pwd);
        };

        ///////////////////////////////////////////////////////////
        /// Event handling
        ///////////////////////////////////////////////////////////

        // update countryName when profile is updated.
        $scope.$watch('profile', function (newValue, oldValue) {
            if (!newValue || newValue === oldValue) {
                return;
            }

            $scope.countryName = _.find($scope.countries, function (country) {
                return country.ID === $scope.profile.LocationID;
            }).getName();
        });

        // profile.LocationID should always be the ID of the selected city.
        $scope.$watch('cityName', function (newValue, oldValue) {
            if (!newValue || newValue === oldValue) {
                return;
            }

            $scope.city = _.find($scope.cities, function (city) {
                return city.getName() === $scope.cityName;
            });

            $scope.profile.LocationID = $scope.city && $scope.city.ID;
        });

        // searching for cities depends on the ID of the selected country
        $scope.$watch('countryName', function (newValue, oldValue) {
            if (!newValue || newValue === oldValue) {
                return;
            }

            $scope.country = _.find($scope.countries, function (country) {
                return country.getName() === $scope.countryName;
            });
        });

        $scope.$watch('profile.Moniker', function (newValue, oldValue) {
            // TODO: add client validation and handle server validation messages
            newValue && newValue !== oldValue && $scope.validateMoniker();
        });

        $scope.$on(events.importer.reviewsReady, function (event, importer) {
            NotificationSvc.show({
                content: 'Reviews imported from ' + importer.provider,
                type: 'success'
            });
        });

        $scope.$on(events.profile.profileUpdated, function () {
            $timeout(function () {
                $scope.profile = ProfileSvc.getProfile();
            });
        });

        ///////////////////////////////////////////////////////////
        /// Initialization
        ///////////////////////////////////////////////////////////

        LocationSvc.getCountries().then(function (countries) {
            $scope.countries = countries;

            $scope.countryNames = _.map(countries, function (country) {
                return country.getName();
            });

        }, function (error) {
            console.log(error);
        });

        // must always be called after fetching countries, otherwise city & country will not update properly
        ProfileSvc.fetchProfileStatus().then(function () {
            $scope.profileExists = true;

            // populate from existing profile
            ProfileSvc.fetchOwnProfile().then(function () {
                $scope.profile = ProfileSvc.getProfile();

                LocationSvc.fetchLocationNames($scope.profile.LocationID).then(function (response) {
                    $scope.cityName = response.results[0].value[0].Name.Literals[0].Text;
                    $scope.countryName = response.results[0].value[0].Parent.Name.Literals[0].Text;
                });

            }, function (error) {
                console.log(error);
            });

        }, function () {
            $scope.profileExists = false;
            //check if there are any imported profiles, then populate new profiles from imported
            ImporterSvc.fetchProfile().then(function () {
                $timeout(function () {
                    $scope.profile = ProfileSvc.getProfile();
                });
            }, function (error) {
                console.log(error);
            });
        });

    }]);

}());
