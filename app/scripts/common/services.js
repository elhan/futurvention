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
    app.service('UserSvc', ['$firebase', '$rootScope', 'FIREBASE_PARAMS', 'EVENTS', function ($firebase, $rootScope, FIREBASE_PARAMS, EVENTS) {
        var users,
            firebaseEvents = EVENTS.firebase,
            firebaseParams = FIREBASE_PARAMS,
            usersRef = new Firebase(firebaseParams.url + '/users'),
            sync = $firebase(usersRef).$asObject();

        // broadcast an event when firebase has done connecting
        sync.$loaded().then(function () {
            $rootScope.$broadcast(firebaseEvents.firebaseConnected);
        });

        this.setUser = function (user) {
            sync.$push(user).then(function (newChildRef) {
                // TODO: add proper logging
                console.log('added new user with key: ', newChildRef.name());
            });
        };

        this.getUsers = function () {
            return users;
        };

        this.getUser = function (id) {
            return _.find(users, function (user) {
                return user.id === id;
            });
        };

        // Synchronise the user collection
        usersRef.on('value', function (snapshot) {
            users = snapshot.val();
        }, function (errorObject) {
            console.log('The firebase read failed: ' + errorObject.code);
        });

        return this;
    }]);

    /**
     * @ngdoc service
     * @name fvApp.service:AuthSvc
     * @description
     * # AuthSvc
     * A service to handle email authentication and authorization.
     */
    app.service('AuthSvc', ['$http', '$firebaseSimpleLogin', '$linkedIn', '$cookies', 'SessionSvc', 'FIREBASE_PARAMS', 'AUTH_PROVIDER_OPTIONS', 'ENV',
                            function ($http, $firebaseSimpleLogin, $linkedIn, $cookies, SessionSvc, FIREBASE_PARAMS, AUTH_PROVIDER_OPTIONS, ENV) {
        var authOptions = AUTH_PROVIDER_OPTIONS,
            firebaseParams = FIREBASE_PARAMS,
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
            return $firebaseSimpleLogin(new Firebase(firebaseParams.url));
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
}());
