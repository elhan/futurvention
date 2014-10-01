(function () {
    'use strict';
    var app = angular.module('fvApp');

    /**
     * @ngdoc service
     * @name fvApp.service:SessionSvc
     * @description
     * # SessionSvc
     * A singleton object following the service style to cash the user's session info.
     */
    app.service('SessionSvc', function () {
        this.create = function (sessionId, userId, provider, userRole) {
            this.id = sessionId;
            this.userId = userId;
            this.userRole = userRole;
        };
        this.destroy = function () {
            this.id = null;
            this.userId = null;
            this.userRole = null;
        };
        return this;
    });

    /**
     * @ngdoc service
     * @name fvApp.service:LocalStorageSvc
     * @description
     * # LocalStorageSvc
     * A service for interacting with the localStorage object.
     */
    app.service('LocalStorageSvc', function () {
        this.getSession = function () {
            return JSON.parse(localStorage.getItem('firebaseSession'));
        };
        return this;
    });

    /**
     * @ngdoc service
     * @name fvApp.service:UserSvc
     * @description
     * # UserSvc
     * Interacts with the server to set, get, and delete User objects.
     */
    app.service('UserSvc', function () {

        this.setUser = function (user) {
            // TODO: post to server
            localStorage.setItem('user', JSON.stringify(user));
        };

        this.getUser = function () {
            // TODO: get from server
            return JSON.parse(localStorage.getItem('user'));
        };

        this.removeUser = function () {
            // TODO: remove from server
            localStorage.removeItem('user');
        };

        return this;
    });

    /**
     * @ngdoc service
     * @name fvApp.service:AuthSvc
     * @description
     * # AuthSvc
     * A service to handle email authentication and authorization.
     */
    app.service('AuthSvc', ['$firebaseSimpleLogin', '$linkedIn', '$cookies', 'SessionSvc', 'AUTH_PROVIDER_OPTIONS', 'ENV',
                            function ($firebaseSimpleLogin, $linkedIn, $cookies, SessionSvc, AUTH_PROVIDER_OPTIONS, ENV) {
        var authOptions = AUTH_PROVIDER_OPTIONS,
            environment = ENV;

        this.isAuthenticated = function () {
            return !!SessionSvc.userId;
        };

        this.isAuthorized = function (authorizedRoles) {
            if (!angular.isArray(authorizedRoles)) {
                authorizedRoles = [authorizedRoles];
            }
            return (this.isAuthenticated() &&
                    authorizedRoles.indexOf(SessionSvc.userRole) !== -1);
        };

        this.firebaseAuth =  function () {
            return $firebaseSimpleLogin(new Firebase(environment.firebaseUrl));
        };

        this.loginLi = function () {
            return $linkedIn.authorize();
        };

        this.getLiProfile = function () {
            return $linkedIn.profile('me', authOptions.linkedIn.fields);
        };

        this.getLiCookie = function () {
            return $cookies[['linkedin_oauth_', environment.liApiKey, '_crc'].join('')];
        };

        return this;
    }]);

    /**
     * @ngdoc service
     * @name fvApp.service:ProfileSvc
     * @description
     * # ProfileSvc
     * CRUD operations for Seller profiles
     */
    app.service('ProfileSvc', ['$http', '$q', '$upload', '$timeout', function ($http, $q, $upload, $timeout) {
        var providerNames = ['linkedIn', 'oDesk', 'elance', 'peoplePerHour', 'freelancer', 'behance', 'dribbble', 'github'],
            steps = ['import', 'info', 'open'], // profile completion steps
            profileSvcUrl = '/profile',
            profile = {};

        this.getProfile = function () {
            return profile;
        };

        this.updateProfile = function (obj) {
            angular.extend(profile, obj);
        };

        // Provider object constructor
        this.Provider = function (name, url) {
            this.name = name;
            this.url = url;
        };

        // returns a new collection of Provider objects that includes all providerNames with blank urls
        this.initProviders = function () {
            var self = this, providers = {};
            _.forEach(providerNames, function (name) {
                providers[name] = new self.Provider(name, '');
            });
            return providers;
        };

        this.getSteps = function () {
            return steps;
        };

        this.saveProvider = function (provider) {
            //return $http.post(profileSvcUrl, { profileLink: provider.url });

            // TODO: remove mock functionality
            var deferred = $q.defer();
            $timeout(function () {
                deferred.resolve('provider saved: ' + provider.toString());
            }, 2000);
            return deferred.promise;
        };

        this.removeProvider = function (provider) {
            //return $http.post(profileSvcUrl, { profileLink: '' });

            // TODO: remove mock functionality
            var deferred = $q.defer();
            $timeout(function () {
                deferred.resolve('provider removed: ' + provider.toString());
            }, 2000);
            return deferred.promise;
        };

        this.saveProfileImage = function (img) {
            return $upload.upload({
                url: profileSvcUrl,
                file: img
            });
        };
    }]);

}());
