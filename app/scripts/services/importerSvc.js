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
    app.service('ImporterSvc', ['$rootScope', '$http', '$q', '$timeout', '$interval', 'PATHS', 'IMPORT_PROVIDERS', 'EVENTS', 'MESSAGES', 'Odata', function ($rootScope, $http, $q, $timeout, $interval, paths, providerNames, events, msg, odata) {
        var all, done, profileDone, reviewsDone, portfoliosDone, inProgress, polling, stopPolling, startPolling,
            ImporterSvc = {};

        // return an array of completed jobs, depending on status byte flags
        function getComplete (status) {
            if (!status) {
                return;
            }

            var complete = [];

            // 0 = importing, 1 = downloading, 2 = completed, null = does not exist
            status.Profile !== null && status.Profile === 2 && complete.push('profile');
            status.Reviews !== null && status.Reviews === 2 && complete.push('reviews');
            status.Portfolio !== null && status.Portfolio.CurrentStatus === 2 && complete.push('portfolio');

            switch (complete.length) {
            case 0:
                return ['none'];
            case 3:
                return ['all'];
            default:
                return complete;
            }
        }

        function broadcastImporterEvent(type, importer) {
            var event;
            switch (type) {
            case 'profile':
                event = events.importer.profileReady;
                break;
            case 'portfolios':
                event = events.importer.portfoliosReady;
                break;
            case 'reviews':
                event = events.importer.reviewsReady;
                break;
            }
            $timeout(function () { $rootScope.$broadcast(event, importer); });
        }

        // callback for status polling
        function checkStatus () {
            $http.post(paths.importer.checkProgress, inProgress.capitalize()).then(function (response) {
                var idx, importer;
                _.each(response.data, function (obj) {
                    idx = _.pluck(inProgress.importers, 'guid').indexOf(obj.Guid); // find the index of the corresponding importer in progress
                    importer = idx > -1 ? inProgress.importers[idx] : null;

                    if (!importer || getComplete(obj).indexOf('none') !== -1) {
                        return;
                    }

                    if (getComplete(obj).indexOf('all') > -1 && (done.importers.length === 0 || done.importers.indexOf(importer) === -1)) {
                        done.importers.indexOf(importer) === -1 && done.importers.push(importer);
                        inProgress.importers.splice(idx, 1);
                        broadcastImporterEvent('profile', importer);
                        broadcastImporterEvent('portfolios', importer);
                        broadcastImporterEvent('reviews', importer);
                        return;
                    }

                    if (getComplete(obj).indexOf('profile') > -1 && (profileDone.importers.length === 0 || profileDone.importers.indexOf(importer) === -1)) {
                        profileDone.importers.push(importer);
                        broadcastImporterEvent('profile', importer);
                    }

                    if (getComplete(obj).indexOf('portfolio') > -1 && (portfoliosDone.importers.length === 0 || portfoliosDone.importers.indexOf(importer) === -1)) {
                        portfoliosDone.importers.push(importer);
                        broadcastImporterEvent('portfolios', importer);
                    }

                    if (getComplete(obj).indexOf('reviews') > -1 && (reviewsDone.importers.length === 0 || reviewsDone.importers.indexOf(importer) === -1)) {
                        reviewsDone.importers.push(importer);
                        broadcastImporterEvent('reviews', importer);
                    }

                    if (inProgress.importers.length === 0) {
                        stopPolling();
                    }

                });
            }, function (error) {
                console.log(error);
            });
        }

        stopPolling = function () {
            $interval.cancel(polling);
        };

        startPolling = function () {
            checkStatus(); // execute immediately
            polling = $interval(function () {
                inProgress.getImporters().length > 0 ? checkStatus() : stopPolling();
            }, 6000, 100, false);
        };

        ///////////////////////////////////////////////////////////
        /// Public API
        ///////////////////////////////////////////////////////////

        ImporterSvc.Importer = function (options) {
            this.provider = options.Provider || '';
            this.url = options.Url || '';
            this.guid = options.Guid || '';
        };

        ImporterSvc.Importer.prototype.capitalize = function () {
            return {
                Provider: this.provider,
                Url: this.url,
                Guid: this.guid
            };
        };

        ImporterSvc.ImporterCollection = function () {
            this.importers = [];
        };

        ImporterSvc.ImporterCollection.prototype.getImporters = function () {
            return this.importers;
        };

        ImporterSvc.ImporterCollection.prototype.setImporters = function (importers) {
            this.importers = importers;
        };

        ImporterSvc.ImporterCollection.prototype.addImporters = function (importers) {
            this.importers.merge(importers);
        };

        ImporterSvc.ImporterCollection.prototype.capitalize = function () {
            return _.map(this.importers, function (importer) {
                return importer.capitalize();
            });
        };

        function filterFetchedImporters (response) {
            return _.map(response.data, function (fetchedProvider) {
                return new ImporterSvc.Importer(fetchedProvider);
            });
        }

        ImporterSvc.getImporters = function (type) {
            switch(type) {
            case 'inProgress':
                return inProgress.getImporters();
            case 'done':
                return done.getImporters() ;
            case 'profileDone':
                return profileDone.getImporters();
            case 'portfoliosDone':
                return portfoliosDone.getImporters();
            default:
                return all.getImporters();
            }
        };

        ///////////////////////////////////////////////////////////
        /// Sync with backend
        ///////////////////////////////////////////////////////////

        ImporterSvc.import = function (selected) {
            var deferred = $q.defer();

            $http.post(paths.importer.import, selected).then(function (response) {
                inProgress.addImporters(filterFetchedImporters(response));
                !angular.isDefined(polling) && startPolling(); // if polling is not in progress, start it
            }, function (error) {
                console.log(error);
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
            var deferred = $q.defer();

            profileDone.length === 0 && deferred.reject(msg.error.profileImportFailed);

            profileDone.length > 0 && $http.post(paths.importer.fetchProfile, profileDone.capitalize()).then(function (response) {
                deferred.resolve(new odata.SellerProfile(response.data[0].data.response.data.PersonalInfo));
            }, function (error) {
                console.log(error);
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
         * @returns {Portfolio}
         */
        ImporterSvc.fetchPortfolios = function () {
            var deferred = $q.defer();
//            portfoliosDone && portfoliosDone.importers.length > 0 && console.log(portfoliosDone.importers, portfoliosDone.importers.capitalize());
            portfoliosDone && portfoliosDone.importers.length > 0 && $http.post(paths.importer.fetchPortfolios, portfoliosDone.importers).then(function (response) {
                console.log(response);
                deferred.resolve();
            }, function (error) {
                console.log(error);
                deferred.reject(error);
            });

            return deferred.promise;
        };

        ///////////////////////////////////////////////////////////
        /// Watchers
        ///////////////////////////////////////////////////////////

        $rootScope.$on(events.auth.sessionTimeout, function () {
            stopPolling();
        });

        ///////////////////////////////////////////////////////////
        /// Initialization
        ///////////////////////////////////////////////////////////

        all = new ImporterSvc.ImporterCollection();
        done = new ImporterSvc.ImporterCollection(); // Importers that have finished profile, reviews & portfolios
        inProgress = new ImporterSvc.ImporterCollection(); // all Importers currently in progress
        profileDone = new ImporterSvc.ImporterCollection(); // all Importers with profile complete
        reviewsDone = new ImporterSvc.ImporterCollection(); // all Importers with reviews status complete
        portfoliosDone = new ImporterSvc.ImporterCollection(); // all Importers with portfolios complete

        _.each(providerNames, function (providerName) {
            all.importers.push(new ImporterSvc.Importer({ Provider: providerName }));
        });

        return ImporterSvc;
    }]);

}());
