(function () {
    'use strict';
    var app = angular.module('fvApp');

    /**
     * @ngdoc service
     * @name fvApp.service:ImporterSvc
     * @description
     * # ImporterSvc
     * CRUD operations for eternal data (importers)
     */
    app.service('ImporterSvc', ['$rootScope', '$http', '$q', '$timeout', '$interval', '$alert', 'PATHS', 'ENV', 'PROVIDERS_ENUM', 'EVENTS', 'MESSAGES', 'Utils', 'Odata', function ($rootScope, $http, $q, $timeout, $interval, $alert, paths, env, providersEnum, events, msg, utils, odata) {

        var polling,

            pollingTimeout,

            providerNames = _.keys(providersEnum),

            importedPortfolios = [],

            importers = [],

            ImporterSvc = {};

        ////////////////////////////////////////////////////////////////////////////
        /// Importer status private functions
        ///
        /// When checking the importers' completion status, there are three possible
        /// status values for Profile, Portfolios and Reviews:
        ///
        /// null: the requested resource does not exist
        /// 0   : resource exists, but has not started importing yet
        /// 1   : import in progress
        /// 2   : import completed
        ///
        ////////////////////////////////////////////////////////////////////////////

        /**
         * Used to determine whether there are any imported profiles.
         *
         * @param {CheckStatusResponse} checkStatusResponse a collection of importers' status
         * @return {Boolean} true if there are any profiles that have finisshed importing
         */
        function profileImported (checkStatusResponse) {
            return typeof _.find(checkStatusResponse, function (imp) {
                return imp.Profile === 2;
            }) !== 'undefined';
        }


        /**
         * Used to determine if all importers have finished
         *
         * @param {CheckStatusResponse} checkStatusResponse a collection of importers' status
         * @returns {Boolean} true if all importers have finished downloading their available data
         */
        function importingDone (checkStatusResponse) {
            var done = false,
                profileReady = false,
                portfolioReady = false,
                reviewsReady = true;

            _.each(checkStatusResponse, function (importer) {
                profileReady = importer.Profile === 2;
                portfolioReady = importer.Portfolio && importer.Portfolio.hasOwnProperty('CurrentStatus') && importer.Portfolio.CurrentStatus === 2;
                reviewsReady = importer.Reviews === 2;

                done = profileReady && portfolioReady && reviewsReady;

                if (!done) { // if at least one of the condition is not met, break the loop
                    return false;
                }
            });

            return done;
        }

        ///////////////////////////////////////////////////////////
        /// Importers
        ///////////////////////////////////////////////////////////

        ImporterSvc.Importer = function (options) {
            var self = this;
            self.Provider = '';
            self.Url = '';
            self.Guid = '';
            utils.updateProperties(self, options);
        };

        ImporterSvc.getImporters = function () {
            return importers;
        };

        ImporterSvc.setImporters = function (imp) {
            importers = imp;
        };

        /**
         * Whenever a user initiates an import, the respective importer is stored in the localStorage.
         * getStoredImporters attempts to retrieve and deserialize the stored importers, then convert them to
         * Importer objects.
         *
         * @public
         *
         * @returns Array.<Importer> a collection of Importer objects
         */
        ImporterSvc.getStoredImporters = function () {
            var stored,
                importerCollection = [],
                deferred = $q.defer();

            try {
                stored = JSON.parse(localStorage.getItem('importers'));

                _.each(stored, function (importer) {
                    importerCollection.push(new ImporterSvc.Importer(importer));
                });

                deferred.resolve(importerCollection);

            } catch (error) {
                deferred.reject(error);
            }

            return deferred.promise;
        };

        /**
         * Updates the importers stored in the localStorage
         *
         * @public
         *
         * @param Array.<Importer> importers: the importers to be stored
         * @returns {Promise.<Boolean>}
         */
        ImporterSvc.storeImporters = function (importers) {
            var deferred = $q.defer();

            try {
                localStorage.setItem('importers', JSON.stringify(importers));
                deferred.resolve();
            } catch (error) {
                deferred.reject(error);
            }

            return deferred.promise;
        };

        ImporterSvc.updateGuid = function (guid) {
            _.each(importers, function (importer) {
                utils.updateProperties(importer, { Guid: guid });
            });
        };

        ///////////////////////////////////////////////////////////
        /// Polling
        ///////////////////////////////////////////////////////////

        ImporterSvc.stopPolling = function () {
            $timeout.cancel(pollingTimeout);
            $interval.cancel(polling);
            $rootScope.$broadcast(events.importer.polling.end);
            polling =  null;
        };

        ImporterSvc.startPolling = function (options) {
            var importers, delay, count, cancelAfter;

            $rootScope.$broadcast(events.importer.polling.start);

            importers = options.hasOwnProperty('importers') ? options.importers : ImporterSvc.getImporters();

            delay = options.hasOwnProperty('delay') ? options.delay : 6000; // tick every 6s by default

            count = options.hasOwnProperty('count') ? options.count : 5; // 30s by default

            cancelAfter = (delay * count) + 1000;

            pollingTimeout = $timeout(function () {
                $alert({ content: msg.error.importProfileTimeout, type: 'error', show: true });
                $rootScope.$broadcast(events.importer.polling.end);
            }, cancelAfter);

            polling = $interval(function () {
                ImporterSvc.checkStatus(importers, true);
            }, delay, count, false);

        };

        ImporterSvc.checkStatus = function (importerCollection, emitEvents) {
            var imp = importerCollection ? importerCollection : importers, // if no collection is passed check the status for all importers

                deferred = $q.defer(); // promises are supported for cases where a single call is required instead of polling

            $http.post(env.api.endPoint + paths.importer.checkProgress, imp).then(function (response) {
                importingDone(response.data) && ImporterSvc.stopPolling();

                profileImported(response.data) && emitEvents && $rootScope.$broadcast(events.importer.polling.profileImported, response);

                deferred.resolve(response.data);

            }, function (error) {
                deferred.reject(error);
            });

            return deferred.promise;
        };

        ///////////////////////////////////////////////////////////
        /// Fetch operations
        ///////////////////////////////////////////////////////////

        ImporterSvc.import = function (importers) {
            var deferred = $q.defer();

            $http.post(env.api.endPoint + paths.importer.import, importers).then(function (response) {
                ImporterSvc.storeImporters(importers);
                deferred.resolve(response);
            }, function (error) {
                deferred.reject(error);
            });

            return deferred.promise;
        };

        /**
         * @ngdoc method
         * @name fvApp.service:ImporterSvc
         * @function
         *
         * @description
         * Checks the done collection for importers that have finished importing their profile,
         * then performs a request to the backend to fetch the profile objects. The retrieved data is
         * be combined into a singgle SimpleProfile object
         *
         * @returns {UserProfile}
         */
        ImporterSvc.fetchProfile = function () {
            var fetchedProfile, photo, country, city,
                importerData = [],
                convertedProfiles = [],
                sellerProfile = new odata.SellerProfile(),
                fetchedProfiles = [],
                deferred = $q.defer();

            $http.post(env.api.endPoint + paths.importer.fetchProfile, importers).then(function (response) {

                _.each(response.data, function (obj) { // data === importers that have data
                    obj.hasOwnProperty('data') && obj.data !== null && importerData.push(obj);
                });

                if (!importerData || importerData.length === 0) { // no importers with data
                    deferred.reject();
                    return;
                }

                _.each(importerData, function (imp) {
                    if (imp.data.response.data && parseInt(imp.data.response.error.errno) < 500) { // TODO: handle specific error codes
                        convertedProfiles.push(new odata.SellerProfile().fromImported(imp.data.response.data.PersonalInfo));
                        fetchedProfiles.push(imp.data.response.data.PersonalInfo);
                    }
                });

                // Iterate over the fetched profiles, and update the sellerProfile object with non-empty values only
                _.each(convertedProfiles, function (profile) {
                    utils.updateProperties(sellerProfile, profile, false);
                });

                /*
                    Country and city are fetched as strings, so they need to be passed to the controllers separately, not
                    as a Profile property. The controller will then match these strings to collections of real Location objects and update the profile.
                **/
                fetchedProfile = _.find(fetchedProfiles, function (prof) {
                    return prof.hasOwnProperty('Country') && prof.Country !== '';
                });

                country = fetchedProfile ? fetchedProfile.Country : '';

                fetchedProfile = _.find(fetchedProfiles, function (prof) {
                    return prof.hasOwnProperty('City') && prof.City !== '';
                });

                city = fetchedProfile ? fetchedProfile.City : '';

                /*
                    Odata.Profile does not cointain Avatars objects, but imported profiles contain a link to the user's Avatar.
                    Pick an avatar from the imported profiles.
                **/
                fetchedProfile = _.find(fetchedProfiles, function (prof) {
                    return prof.hasOwnProperty('Photo') && prof.Photo !== '';
                });

                photo = fetchedProfile ? fetchedProfile.Photo : '';

                deferred.resolve({
                    profile: sellerProfile,
                    avatar: photo,
                    country: country,
                    city: city
                });

            }, function (error) {
                deferred.reject(error);
            });

            return deferred.promise;
        };

        /**
         * @ngdoc method
         * @name fvApp.service:ImporterSvc
         * @function
         *
         * @description
         * Checks the done collection for importers that have finished importing their portfolio,
         * then performs a request to the backend to fetch the portfolio objects.
         *
         * @returns Array.<Object>
         */
        ImporterSvc.fetchPortfolios = function (importerColelction) {
            var payload, deferred = $q.defer();

            payload = importerColelction ? importerColelction : importers;

            $http.post(env.api.endPoint + paths.importer.fetchPortfolios, payload).then(function (response) {
                importedPortfolios = response;
                deferred.resolve(response);
            }, function (error) {
                deferred.reject(error);
            });

            return deferred.promise;
        };

        /**
         * @ngdoc method
         * @name fvApp.service:ImporterSvc
         * @function
         *
         * @description
         * Fetches old imported portfolios.
         *
         * @returns Array.<Object>
         */
        ImporterSvc.fetchCachedPortfolios = function (guid) {
            return $http.post(env.api.endPoint + paths.importer.fetchPortfolios, _.map(providerNames, function (name) {
                return new ImporterSvc.Importer({
                    Guid: guid,
                    Provider: name,
                    Url: ''
                });
            }));
        };

        ///////////////////////////////////////////////////////////
        /// Save operations
        ///////////////////////////////////////////////////////////

        /**
         * @ngdoc method
         * @name fvApp.service:ImporterSvc
         * @function
         *
         * @description
         * Pipes the imported portfolio objects to the backend. The backend processes
         * the imported data into a collection of Showcase objects.
         *
         * @returns Array.<Showcase>
         */
        ImporterSvc.saveImportedPortfolios = function (serviceID, portfolios) {
            return $http.post(env.api.endPoint + paths.sellerManagement.importedShowcases + serviceID, portfolios);
        };

        /**
         * @ngdoc method
         * @name fvApp.service:ImporterSvc
         * @function
         *
         * @description
         * Persists scrapped reviews
         *
         */
        ImporterSvc.saveReviews = function (importers) {
            return $http.post(env.api.endPoint + paths.sellerManagement.ownReviews, importers);
        };

        ///////////////////////////////////////////////////////////
        /// Initialization
        ///////////////////////////////////////////////////////////

        // by default, the importers variable hold all supported importers
        _.each(providerNames, function (name) {
            importers.push(new ImporterSvc.Importer({ Provider: name }));
        });

        return ImporterSvc;
    }]);

}());
