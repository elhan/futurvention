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
    app.controller('ApplyInfoCtrl', ['$scope', '$modal', '$timeout', 'EVENTS', 'ProfileSvc', 'LocationSvc', 'ImporterSvc', 'NotificationSvc', function ($scope, $modal, $timeout, events, ProfileSvc, LocationSvc, ImporterSvc, NotificationSvc) {
        var modalImageCrop = $modal({
            scope: $scope,
            template: 'views/components/modalImageCrop.html',
            show: false,
            animation: 'am-slide-top',
            keyboard: true
        });

        $scope.profile = new ProfileSvc.SimpleProfile({});
        $scope.profileExists = false;

        $scope.showImageCropModal = function () {
            modalImageCrop.$promise.then(function () {
                $scope.croppedImage = ''; // reset the croppedImage object
                modalImageCrop.show();
            });
        };

        $scope.personalUrlExists = false; // true if the user has set a url that already exists. Used to display error label

        $scope.moniker = '';

        $scope.selectedCity = '';
        $scope.cities = [];
        $scope.cityNames = [];

        $scope.country = '';
        $scope.countries = []; // all available countries
        $scope.countryName = ''; //model for the country dropdown
        $scope.countryNames = []; //data dor the countries dropdown

        LocationSvc.getCountries().then(function (countries) {
            $scope.countries = countries;
            $scope.countryNames = _.pluck(countries, 'name');
        }, function (error) {
            console.log(error);
        });

        // expose this on scope as some form inputs need to be aware of the profile completion state
        $scope.getProfile = function () {
            return ProfileSvc.getProfile();
        };

        $scope.checkPersonalUrl = function () {
            ProfileSvc.fetchPersonalUrlStatus($scope.moniker).then(function (res) {
                $scope.personalUrlExists = res.data;
            }, function (err) {
                console.log(err);
            });
        };

        // on continue, save the rest of the user's info
        $scope.continue = function () {
            var payload = {
                Moniker: $scope.moniker,
                Title: $scope.profile.headline,
                Description: $scope.profile.bio,
                Location: _.find($scope.cities, function (city) {
                    return city.name === $scope.selectedCity;
                }).ID
            };

            if ($scope.profileExists) { // update existing profile
                ProfileSvc.updateProfile(payload, $scope.profile.profileID).then(function (response) {
                    console.log(response);
                }, function (error) {
                    console.log(error);
                });
            } else { // create a new profile
                payload.UserID = $scope.currentUser.ID;
                ProfileSvc.saveProfile(payload).then(function (response) {
                    console.log(response);
                }, function (error) {
                    console.log(error);
                });
            }
        };

        $scope.searchCity = _.throttle(function (prefix) {
            prefix && LocationSvc.searchCity($scope.country.countryID, prefix).then(function (cities) {
                $timeout(function () {
                    $scope.cities = cities;
                    $scope.cityNames = _.pluck(cities, 'name');
                });
            }, function (error) {
                console.log(error);
            });
        }, 700);

        ///////////////////////////////////////////////////////////
        /// Event handling
        ///////////////////////////////////////////////////////////

        $scope.$watch('countryName', function (newValue, oldValue) {
            if (newValue === oldValue) {
                return;
            }
            $scope.country = _.find($scope.countries, function (country) {
                return country.name === $scope.countryName;
            });
        });

        $scope.$watch('moniker', function (newValue, oldValue) {
            newValue && newValue !== oldValue && $scope.checkPersonalUrl();
        });

        $scope.$on(events.importer.reviewsReady, function (event, importer) {
            console.log(ImporterSvc.getImporters('done'));
            NotificationSvc.show({
                content: 'Reviews imported from ' + importer.provider,
                type: 'success'
            });
        });

        $scope.$on(events.profile.profileUpdated, function (event) {
            $timeout(function () {
                $scope.profile = ProfileSvc.getSimpleProfile();
                $scope.profileImage = $scope.profile.image;
                $scope.countryName = $scope.profile.country;
                $scope.moniker = $scope.profile.moniker;
            });
        });

        ///////////////////////////////////////////////////////////
        /// Initialization
        ///////////////////////////////////////////////////////////

        ProfileSvc.fetchProfileStatus().then(function (response) {
            $scope.profileExists = response && response !== 'null';

            // load existing profiles from the backend
            $scope.profileExists && ProfileSvc.fetchOwnProfile().then(function () {
                $timeout(function () {
                    $scope.profile = ProfileSvc.getSimpleProfile();
                    $scope.profileImage = $scope.profile.image;
                    $scope.countryName = $scope.profile.country;
                    $scope.moniker = $scope.profile.moniker;
                });
            }, function (error) {
                console.log(error);
            });

            // populate new profiles from imported
            !$scope.profileExists && ImporterSvc.fetchProfile().then(function (profile) {
                $timeout(function () {
                    $scope.profile = profile || new ProfileSvc.SimpleProfile({});
                    $scope.profileImage = $scope.profile.image;
                    $scope.countryName = $scope.profile.country;
                    $scope.moniker = $scope.profile.moniker;
                });
            }, function (error) {
                console.log(error);
            });

        }, function (error) {
            console.log(error);
        });

    }]);

}());
