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
    app.controller('ApplyInfoCtrl', ['$scope', '$modal', '$timeout', 'EVENTS', 'ProfileSvc', 'LocationSvc', 'ImporterSvc', function ($scope, $modal, $timeout, events, ProfileSvc, LocationSvc, ImporterSvc) {
        var modalImageCrop = $modal({
            scope: $scope,
            template: 'views/components/modalImageCrop.html',
            show: false,
            animation: 'am-slide-top',
            keyboard: true
        });

        $scope.profile;

        $scope.showImageCropModal = function () {
            modalImageCrop.$promise.then(function () {
                $scope.croppedImage = ''; // reset the croppedImage object
                modalImageCrop.show();
            });
        };

        $scope.personalUrlExists = false; // true if the user has set a url that already exists. Used to display error label

        $scope.personalUrl = '';

        $scope.selectedCity = '';
        $scope.cities = [];

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

        $scope.savePersonalUrl = function () {
            ProfileSvc.savePersonalUrl($scope.personalUrl).then(function (res) {
                console.log(res);
                ProfileSvc.updateProfile({ personalUrl: $scope.personalUrl });
            }, function (err) {
                console.log(err);
                // TODO: check for specific 'url exists' error
                $scope.personalUrlExists = true;
            });
        };

        // on continue, save the rest of the user's info
        $scope.continue = function () {
//            var info = {
//                firstName: $scope.currentUser.firstName,
//                lastName: $scope.currentUser.lastName,
//                title: $scope.title,
//                bio: $scope.bio,
//                city: $scope.selectedCity,
//                country: $scope.country
//            };
//            ProfileSvc.saveProfile(info).then(function (res) {
//                console.log(res);
//                ProfileSvc.updateProfile(info); // update the cached Profile object once the server has persisted it
//                console.log(ProfileSvc.getProfile());
//                $scope.goToStep(2);
//            }, function (err) {
//                // TODO: handle error
//                console.log(err);
//            });
        };

        $scope.searchCity = _.throttle(function (prefix) {
            prefix && LocationSvc.searchCity($scope.country.countryID, prefix).then(function (cities) {
                $timeout(function () {
                    $scope.cities = cities;
                });
            }, function (error) {
                console.log(error);
            });
        }, 700);

        // listen for image update events emmited by the imga ecrop modal
        $scope.$on(events.profile.profileImageUpdated, function () {
            $scope.profileImage = ProfileSvc.getProfile().image;
        });

        $scope.$watch('countryName', function (newValue, oldValue) {
            if (newValue === oldValue) {
                return;
            }
            $scope.country = _.find($scope.countries, function (country) {
                return country.name === $scope.countryName;
            });
        });

        ///////////////////////////////////////////////////////////
        /// Initialization
        ///////////////////////////////////////////////////////////

        // TODO: if profile exists, fetch it from database

        // loadfrom imported
        ImporterSvc.fetchProfile().then(function (profile) {
            $scope.profile = profile || new ProfileSvc.SimpleProfile();
            $scope.profileImage = $scope.profile.image;
            $scope.countryName = $scope.profile.country;
            console.log($scope.profile);
            $scope.$apply();
        }, function (error) {
            console.log(error);
        });
    }]);

}());
