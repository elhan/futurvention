(function () {
    'use strict';
    var app = angular.module('fvApp');

    /**
     * @ngdoc service
     * @name fvApp.service:ProfileSvc
     * @description
     * # ProfileSvc
     * CRUD operations for Seller profiles
     */
    app.service('ProfileSvc', ['$http', '$q', '$upload', '$timeout', 'IMPORT_PROVIDERS', 'PATHS', 'Utils', function ($http, $q, $upload, $timeout, importProviders, paths, utils) {
        var ProfileSvc = {},
            providerNames = importProviders,
            steps = ['import', 'info', 'service_selection', 'offer_config', 'storefront'], // profile completion steps
            activeStep = 'import',
            profile = {};

        // used to fetch data from importers
        ProfileSvc.SimpleProfile = function (options) {
            return {
                firstName: options.FirstName || '',
                lastName: options.LastName || '',
                bio: options.Bio || '',
                skills: options.Skills || [],
                headline: options.Headline || '',
                country: options.Country || '',
                city: options.City || '',
                image: options.Photo || '',
                moniker: '',
                profileID: ''
            };
        };

//        ProfileSvc.Profile = function (options) {
//            return {
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
//            };
//        };
//
//        ProfileSvc.Profile.prototype.simplify = function () {
//            return new ProfileSvc.SimpleProfile({
//                firstName: this.firstName,
//                lastName: this.lastName,
//                bio: this.description,
//                skills: this.resume,
//                headline: this.status,
//                country: this.location.country,
//                city: this.location.city,
//                image: this.photo
//            });
//        };

        // Provider object constructor
        ProfileSvc.Provider = function (name, url) {
            this.name = name;
            this.url = url;
        };

        // returns a new collection of Provider objects that includes all providerNames with blank urls
        ProfileSvc.initProviders = function () {
            var providers = {};
            _.forEach(providerNames, function (name) {
                providers[name] = new ProfileSvc.Provider(name, '');
            });
            return providers;
        };

        ////////////////////////////////////////////////////////////
        /// Get methods interact with the service's private objects
        ////////////////////////////////////////////////////////////

        ProfileSvc.getActiveStep = function () {
            return activeStep;
        };

        ProfileSvc.getProfile = function () {
            return profile;
        };

        ProfileSvc.getSteps = function () {
            return steps;
        };

        ProfileSvc.getSimpleProfile = function () {
            console.log(ProfileSvc.profile);
            if (!ProfileSvc.profile) {
                return ProfileSvc.SimpleProfile({});
            }
            return angular.extend(ProfileSvc.SimpleProfile({}), {
                firstName: ProfileSvc.profile.user && ProfileSvc.profile.user.firstName,
                lastName: ProfileSvc.profile.user && ProfileSvc.profile.user.lastName,
                bio: ProfileSvc.profile.description,
                skills: ProfileSvc.profile.resume,
                headline: ProfileSvc.profile.title,
                country: ProfileSvc.profile.location && ProfileSvc.profile.location.country,
                city: ProfileSvc.profile.location && ProfileSvc.profile.location.city,
                image: ProfileSvc.profile.user && ProfileSvc.profile.user.avatar,
                moniker: ProfileSvc.profile.moniker,
                profileID: ProfileSvc.profile.ID
            });
        };

        ////////////////////////////////////////////
        /// Set methods
        ////////////////////////////////////////////

        ProfileSvc.setActiveStep = function (step) {
            activeStep = step;
        };

        ////////////////////////////////////////////
        /// Save methods persist data on the server
        ////////////////////////////////////////////

        ProfileSvc.saveProvider = function (provider) {
            // TODO: remove mock functionality
        };

        ProfileSvc.saveProfileImage = function (img) {
            // TODO: remove mock functionality
        };

        ProfileSvc.savePersonalUrl = function (url) {
            // TODO: remove mock functionality
        };

        ProfileSvc.saveProfile = function (profile) {
            return $http.post(paths.sellerManagement.profile, profile);
        };

        ///////////////////////////////////////////////////////////
        /// Update methods
        ///////////////////////////////////////////////////////////

        ProfileSvc.updateProfile = function (profile, userID) {
            return $http({
                method: 'PATCH',
                url: paths.sellerManagement.profile + userID,
                data: profile
            });
        };

        ///////////////////////////////////////////////////////////
        /// Fetch methods fetch data from the server
        ///////////////////////////////////////////////////////////

        ProfileSvc.fetchOwnProfile = function () {
            var deferred = $q.defer();

            $http.get(paths.sellerManagement.ownProfile).then(function (response) {
                ProfileSvc.profile = utils.camelCaseKeys(response.data);
                deferred.resolve();
            }, function (error) {
                deferred.reject(error);
            });

            return deferred.promise;
        };

        ProfileSvc.fetchProfileStatus = function () {
            return $http.get(paths.sellerManagement.profileStatus);
        };

        ProfileSvc.fetchPersonalUrlStatus = function (moniker) {
            return $http.get(paths.sellerManagement.monikerExists(moniker));
        };

        return ProfileSvc;
    }]);

}());
