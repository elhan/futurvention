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
    app.controller('ApplyInfoCtrl', ['$scope', '$modal', '$timeout', 'EVENTS', 'MESSAGES', 'Utils', 'Odata', 'ProfileSvc', 'LocationSvc', 'ImporterSvc',  'UserSvc', 'NotificationSvc', function ($scope, $modal, $timeout, events, msg, utils, odata, ProfileSvc, LocationSvc, ImporterSvc, UserSvc, NotificationSvc) {

        ///////////////////////////////////////////////////////////
        /// Private variables & functions
        ///////////////////////////////////////////////////////////

        var modalImageCrop = $modal({
            scope: $scope,
            template: 'views/components/modalImageCrop.html',
            show: false,
            animation: 'am-slide-top',
            keyboard: true
        }),

        modalPageLoading = $modal({
            scope: $scope,
            template: 'views/components/modalPageLoading.html',
            show: false,
            animation: 'am-fade',
            keyboard: false,
            backdrop: 'static'
        });

        $scope.avatarLoading = false; // determines if a loader is shown on the user avatar while a new avatar is loading.

        /**
         * Updates the profile object. If the user already has completed a profile, fetch it. Otherwise try
         * to fetch any imported profiles.
         *
         * If no profile is available yet, but there are importers in progress, start polling checkstatus and show the appropriate loader.
         * If a profile is imported before the polling times out, use that, otherwise show an appropriate
         * message and let the user fill in his profile manually.
         *
         * This function must always be called after fetching countries, otherwise city & country will not update properly
         * as they make use of the profile's LocationID
         *
         */
        function updateProfile () {

            //case 1: the user already has a SellerProfile
            ProfileSvc.fetchOwnProfile().then(function (profile) {
                $scope.profileExists = true;

                // populate from existing profile
                $scope.profile = profile;

                LocationSvc.fetchLocationNames($scope.profile.LocationID).then(function (response) {
                    $scope.cityName = response.results[0].value[0].Name.Literals[0].Text;
                    $scope.countryName = response.results[0].value[0].Parent.Name.Literals[0].Text;
                });

                // case 2: the user does not have a SellerProfile, but there are imported profiles available
            }, function () {
                $scope.profileExists = false;

                ImporterSvc.fetchProfile().then(function (response) {

                    $scope.profile = response.profile;

                    // if the fetched profile contains an avatar, and the user does not already have one
                    if (response.avatar && ($scope.currentUser.AvatarID === 0 || $scope.currentUser.AvatarID === null )) {
                        $scope.avatarLoading = true;

                        UserSvc.saveExternalAvatar(response.avatar).then(function () { // this will fire an event that will notify MainCtrl to update currentUser
                            $scope.avatarLoading = false;
                        }, function () {
                            NotificationSvc.show({ content: msg.error.saveAvatarFailed, type: 'error' });
                            $scope.avatarLoading = false;
                        });
                    }

                    if (response.country) {
                        $scope.countryName = response.country; // this will trigger a watcher that will update the country object

                        response.city && $timeout(function () { // timeout to ensure $scope.country has updated

                            $scope.country && LocationSvc.searchCity($scope.country.ID, response.city).then(function (res) {
                                // res is an array of Locations. Pick the first and prefil cityName. This will trigger the cityName watcher.
                                if (res && res[0]) {
                                    $scope.cities = res;
                                    $scope.cityName = res[0].getName();
                                }

                            }, function (error) {
                                console.log(error);
                            });
                        });
                    }

                    /*
                        Try to fill in the user's moniker. Try the client validation it first, then validate it on the server side as well,
                        in order to make sure the moniker is not already taken.
                    **/
                    if (response.userName.length > 3 && response.userName.length < 20 &&  $scope.engAndNum('LukeODwyer')) {
                        ProfileSvc.validateMoniker(response.userName).then(function (res) {
                            if (res.data === 'false') { // returns true if moniker exists
                                $scope.monikerIsValid = true;
                                $scope.profile.Moniker = response.userName;
                            }
                        }, function (err) {
                            console.log(err);
                        });
                    }

                    /*
                        case 3: no SellerProfile, no imported profiles available (yet). Check local storage to see if there are any
                        importers. If so, start polling checkstatus to try and get the user's profile. Polling will emit start, status (update) and end events.
                    **/
                }, function () {
                    ImporterSvc.getStoredImporters().then(function (importers) {
                        importers && importers.length > 0 && ImporterSvc.startPolling({
                            importers: importers,
                            delay: 5000, // check every 5s
                            count: 6 // total duration === 30s
                        });
                    });
                });
            });
        }

        ///////////////////////////////////////////////////////////
        /// Scope variables & functions
        ///////////////////////////////////////////////////////////

        $scope.profile = ProfileSvc.getProfile();
        $scope.profileExists = false; // true if the user has already finished and saved his profile in the past

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
            $scope.country && prefix && LocationSvc.searchCity($scope.country.ID, prefix).then(function (cities) {
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

        $scope.engAndNum = function (str) {
            return utils.matchEngAndNum(str);
        };

        ///////////////////////////////////////////////////////////
        /// Event handling
        ///////////////////////////////////////////////////////////

        // update countryName when profile is updated.
        $scope.$watch('profile', function (newValue, oldValue) {
            var countryMultilingual;

            // $scope.profile.LocationID === 0 only if no location is available
            if (!newValue || newValue === oldValue || $scope.profile.LocationID === 0) {
                return;
            }

            countryMultilingual = _.find($scope.countries, function (country) {
                return country.ID === $scope.profile.LocationID;
            });

            $scope.countryName = countryMultilingual ? countryMultilingual.getName() : null;
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

        // profile avatar is changed by the image crop modal
        $scope.$on(events.profile.profileUpdated, function () {
            $scope.profile = ProfileSvc.getProfile();
        });

        $scope.$on(events.importer.polling.start, function () {
            modalPageLoading.$promise.then(function () {
                modalPageLoading.show();
            });
        });

        $scope.$on(events.importer.polling.end, function () {
            modalPageLoading.hide();
        });

        $scope.$on(events.importer.polling.profileImported, function () {
            //TODO : merge with update function
            ImporterSvc.fetchProfile().then(function (response) {
                ImporterSvc.stopPolling();

                // check profile validity to determine if we should keep polling
                $scope.profile = response.profile;

                // if the fetched profile contains an avatar, and the user does not already have one
                if (response.avatar && ($scope.currentUser.AvatarID === 0 || $scope.currentUser.AvatarID === null )) {
                    $scope.avatarLoading = true;

                    UserSvc.saveExternalAvatar(response.avatar).then(function () { // this will fire an event that will notify MainCtrl to update currentUser
                        $scope.avatarLoading = false;
                    }, function () {
                        NotificationSvc.show({ content: msg.error.saveAvatarFailed, type: 'error' });
                        $scope.avatarLoading = false;
                    });
                }

                if (response.country) {
                    $scope.countryName = response.country; // this will trigger a watcher that will update the country object

                    response.city && $timeout(function () { // timeout to ensure $scope.country has updated

                        $scope.country && LocationSvc.searchCity($scope.country.ID, response.city).then(function (res) {
                            // res is an array of Locations. Pick the first and prefil cityName. This will trigger the cityName watcher.
                            if (res && res[0]) {
                                $scope.cities = res;
                                $scope.cityName = res[0].getName();
                            }

                        }, function (error) {
                            console.log(error);
                        });
                    });
                }

                /*
                        Try to fill in the user's moniker. Try the client validation it first, then validate it on the server side as well,
                        in order to make sure the moniker is not already taken.
                    **/
                if (response.userName.length > 3 && response.userName.length < 20 &&  $scope.engAndNum('LukeODwyer')) {
                    ProfileSvc.validateMoniker(response.userName).then(function (res) {
                        if (res.data === 'false') { // returns true if moniker exists
                            $scope.monikerIsValid = true;
                            $scope.profile.Moniker = response.userName;
                        }
                    }, function (err) {
                        console.log(err);
                    });
                }

            }, function (error) {
                //TODO: log this
                console.log(error);
                ImporterSvc.stopPolling();
                NotificationSvc.show({ content: msg.error.importProfileTimeout, type: 'error' });
            });
        });

        ///////////////////////////////////////////////////////////
        /// Initialization
        ///////////////////////////////////////////////////////////

        // update importers with the user's guid
        _.each(ImporterSvc.getImporters(), function (importer) {
            utils.updateProperties(importer, { Guid: $scope.currentUser.Guid });
        });

        LocationSvc.getCountries().then(function (countries) {
            $scope.countries = countries;

            $scope.countryNames = _.map(countries, function (country) {
                return country.getName();
            });

            updateProfile();

        }, function (error) {
            console.log(error);
            updateProfile();
        });

    }]);

}());
