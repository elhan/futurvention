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
    app.service('ProfileSvc', ['$http', '$q', '$upload', '$timeout', 'IMPORT_PROVIDERS', 'PATHS', 'breeze', 'Utils', 'Odata', function ($http, $q, $upload, $timeout, importProviders, paths, breeze, utils, odata) {
        var ProfileSvc = {},
            providerNames = importProviders,
            steps = ['import', 'info', 'service_selection', 'offer_config', 'storefront'], // profile completion steps
            activeStep = 'import',
            profile = new odata.SellerProfile(),

            dataService = new breeze.DataService({
                serviceName: paths.public,
                hasServerMetadata: false
            }),

            manager = new breeze.EntityManager({ dataService: dataService });

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

        ////////////////////////////////////////////
        /// Set methods
        ////////////////////////////////////////////

        ProfileSvc.setActiveStep = function (step) {
            activeStep = step;
        };

        ProfileSvc.updateProfile = function (obj) {
            utils.updateProperties(profile, obj);
        };

        ////////////////////////////////////////////
        /// Create methods persist data on the server
        ////////////////////////////////////////////

        ProfileSvc.createProfile = function (profile) {
            return $http.post(paths.sellerManagement.ownProfile, profile);
        };

        ///////////////////////////////////////////////////////////
        /// Patch methods update objects on the backend
        ///////////////////////////////////////////////////////////

        ProfileSvc.patchProfile = function (profile) {
            return $http({
                method: 'PATCH',
                url: paths.sellerManagement.ownProfile,
                data: profile
            });
        };

        ///////////////////////////////////////////////////////////
        /// Fetch methods fetch data from the server
        ///////////////////////////////////////////////////////////

        ProfileSvc.fetchOwnProfile = function () {
            var deferred = $q.defer();

            $http.get(paths.sellerManagement.ownProfile + '?expand=User, Title/Literals, Description/Literals').then(function (response) {
                utils.updateProperties(profile, response.data);
                deferred.resolve(profile);
            }, function (error) {
                deferred.reject(error);
            });

            return deferred.promise;
        };

        ProfileSvc.fetchProfile = function (moniker) {
            var deferred = $q.defer(),

                url = [
                    paths.sellerManagement.profile,
                    moniker,
                    '?expand=Location/Name/Literals,',
                    'Title/Literals,',
                    'Description/Literals'
                ].join('');

            $http.get(url).then(function (response) {
                utils.updateProperties(profile, response.data);
                deferred.resolve(profile);
            }, function (error) {
                deferred.reject(error);
            });

            return deferred.promise;
        };

        ProfileSvc.fetchProfileById = function (userID) {
             var deferred = $q.defer(),

                 query = new breeze.EntityQuery('SellerProfiles')
                    .where('ID', 'eq', userID)
                    .expand([
                        'User',
                        'User.Avatar',
                        'Location.Name.Literals',
                        'Title.Literals',
                        'Description.Literals'
                    ].join(','));

            manager.executeQuery(query).then(function (response) {
                console.log(response);
                deferred.resolve(response.results[0].value);
            }, function (error) {
                console.log(error);
                deferred.reject(error);
            });

            return deferred.promise;
        };

        ProfileSvc.fetchProfileStatus = function () {
            var deferred = $q.defer();

            $http.get(paths.sellerManagement.profileStatus).then(function (response) {
                response && response.data !== 'null' ? deferred.resolve() : deferred.reject();
            }, function (error) {
                console.log(error);
            });

            return deferred.promise;
        };

        ProfileSvc.validateMoniker = function (moniker) {
            return $http.get(paths.sellerManagement.monikerExists(moniker));
        };

        return ProfileSvc;
    }]);

}());
