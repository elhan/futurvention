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
    app.service('ProfileSvc', ['$http', '$q', '$upload', '$timeout', 'IMPORT_PROVIDERS', function ($http, $q, $upload, $timeout, importProviders) {
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
                image: options.Photo || ''
            };
        };

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

        ProfileSvc.updateProfile = function (obj) {
            angular.extend(profile, obj);
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

        ProfileSvc.saveProfile = function (info) {
            // TODO: remove mock functionality
        };

        ///////////////////////////////////////////////////////////
        /// Fetch methods fetch data from the server
        ///////////////////////////////////////////////////////////

        ProfileSvc.fetchProfile = function (personalUrl) {
            var deferred = $q.defer();
            deferred.resolve();
            return deferred.promise;
        };

        ProfileSvc.fetchPersonalUrlStatus = function (url) {
            // TODO: remove mock code
        };

        ///////////////////////////////////////////////////////////
        /// Remove methods perform delete operations on the server
        ///////////////////////////////////////////////////////////

        ProfileSvc.removeProvider = function (provider) {
            // TODO: remove mock functionality
        };

        return ProfileSvc;
    }]);

}());
