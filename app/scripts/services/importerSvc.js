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
    app.service('ImporterSvc', ['$rootScope', '$http', '$q', '$timeout', '$interval', 'PATHS', 'IMPORT_PROVIDERS', 'EVENTS', 'ProfileSvc', function ($rootScope, $http, $q, $timeout, $interval, paths, providerNames, events, ProfileSvc) {
        var all, done, inProgress, polling, stopPolling, startPolling,
            ImporterSvc = {};

        // return an array of completed jobs, depending on status byte flags
        function getComplete (status) {
            switch (status) {
            case 1:
                return ['profile'];
            case 3:
                return ['portfolio'];
            case 4:
                return ['profile', 'portfolio'];
            case 5:
                return ['reviews'];
            case 6:
                return ['profile', 'reviews'];
            case 8:
                return ['portfolio', 'reviews'];
            case 9:
                return ['profile', 'portfolio', 'reviews'];
            }
        }

        // callback for status polling
        function checkStatus () {
            $http.post(paths.importer.checkProgress, inProgress.capitalize()).then(function (response) {
                var idx, removed;
                _.each(response.data, function (obj) {
                    if (getComplete(obj.Status) && getComplete(obj.Status).indexOf('profile') === -1) {
                        return;
                    }
                    idx = _.pluck(inProgress.importers, 'guid').indexOf(obj.Guid); // find the index of the corresponding importer in progress
                    // remove the importer from the progress collection and ad it to the done collection
//                    removed = idx > -1 ? inProgress.importers.splice(idx, 1) : null;
                    // if there are no more importers in progress, stop polling
//                    removed && done.importers.indexOf(removed) === -1 && done.importers.merge(removed);
                    removed = inProgress.importers[idx];
                    done.importers.indexOf(removed) === -1 && done.importers.merge(removed);
                    $timeout(function () {
                        // notify controllers that at least one profile is ready
                        $rootScope.$broadcast(events.importer.profileReady);
                    });
                    // TODO: REMOVE
                    getComplete(obj.Status).indexOf('portfolio') !== -1 && $rootScope.$broadcast(events.importer.portfolioReady);
                    getComplete(obj.Status).indexOf('reviews') !== -1 && $rootScope.$broadcast(events.importer.reviewsReady);
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

            $http.post(paths.importer.fetchProfile, done.capitalize()).then(function (response) {
                deferred.resolve(new ProfileSvc.SimpleProfile(response.data[0].data.response.data.PersonalInfo));
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
        ImporterSvc.fetchPortfolio = function () {
            var deferred = $q.defer();

            $http.post(paths.importer.fetchPortfolio, done.capitalize()).then(function (response) {
                console.log(response, new ProfileSvc.SimpleProfile(response.data[0].data.response.data.PersonalInfo));
                deferred.resolve(new ProfileSvc.SimpleProfile(response.data[0].data.response.data.PersonalInfo));
            }, function (error) {
                console.log(error);
                deferred.reject(error);
            });

            return deferred.promise;
        };

        ///////////////////////////////////////////////////////////
        /// Initialization
        ///////////////////////////////////////////////////////////

        all = new ImporterSvc.ImporterCollection(),
        done = new ImporterSvc.ImporterCollection(),
        inProgress = new ImporterSvc.ImporterCollection();

        _.each(providerNames, function (providerName) {
            all.importers.push(new ImporterSvc.Importer({ Provider: providerName }));
        });

        return ImporterSvc;
    }]);

}());
