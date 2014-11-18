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
            //                moniker: options.Moniker || '',
            //                firstName: options.FirstName || '',
            //                lastName: options.LastName || '',
            //                title: options.Title || '',
            //                description: options.Description || '',
            //                resume: options.Resume || '',
            //                status: options.Status || 'new',
            //                sourceUrl: options.SourceUrl || '',
            //                location: options.Location || {},
            //                photoID: options.PhotoID || '',
            //                photo: options.Photo || '',
            //                user: options.User || {},
            //                sourceID: options.SourceID || '',
            //                source: options.Source || {},
            //                showcases: options.Showcases || [],
            //                reviews: options.Reviews || [],
            //                profileID: options.ID || '',
            //                creationDate: options.CreationDate || '',
            //                modificationDate: options.modificationDate || ''

            var prof = {
                ID: ProfileSvc.profile.ID,
                Moniker: $scope.moniker
            };

            ProfileSvc.updateProfile(prof).then(function (response) {
                console.log(response);
            }, function (error) {
                console.log(error);
            });
//            ProfileSvc.saveProfile(prof).then(function (response) {
//                console.log(response);
//            }, function (error) {
//                console.log(error);
//            });
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

        $scope.$on(events.importer.portfolioReady, function (event, importer) {
            console.log(ImporterSvc.getImporters('done'));
            ImporterSvc.fetchPortfolio().then(function (response) {
                console.log(response);
                NotificationSvc.show({
                    content: 'Portfolio imported from ' + importer.provider,
                    type: 'success'
                });
            }, function (error) {
                console.log(error);
            });
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
            //profile already exists
            if (response && response !== 'null') {
                ProfileSvc.fetchOwnProfile().then(function () {
                    $timeout(function () {
                        $scope.profile = ProfileSvc.getSimpleProfile();
                        $scope.profileImage = $scope.profile.image;
                        $scope.countryName = $scope.profile.country;
                        $scope.moniker = $scope.profile.moniker;
                    });
                }, function (error) {
                    console.log(error);
                });
            } else {
                // loadfrom imported
                ImporterSvc.fetchProfile().then(function (profile) {
                    $timeout(function () {
                        $scope.profile = profile || new ProfileSvc.SimpleProfile({});
                        $scope.profileImage = $scope.profile.image;
                        $scope.countryName = $scope.profile.country;
                        $scope.moniker = $scope.profile.moniker;
                    });
                }, function (error) {
                    console.log(error);
                });
            }
        }, function (error) {
            console.log(error);
        });


    }]);

}());
