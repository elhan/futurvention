(function () {
    'use strict';

    var app = angular.module('fvApp');

    /**
     * @ngdoc object
     * @name fvApp.controller:AUTH_EVENTS
     * @description
     * # AUTH_EVENTS
     * All the suported authentication events. Broadcasted through $rootScope
     */
    app.constant('AUTH_EVENTS', {
        registrationSuccess: 'auth-registration-success',
        registrationFailed: 'auth-registration-failed',
        loginSuccess: 'auth-login-success',
        loginFailed: 'auth-login-failed',
        logoutSuccess: 'auth-logout-success',
        sessionTimeout: 'auth-session-timeout',
        notAuthenticated: 'auth-not-authenticated',
        notAuthorized: 'auth-not-authorized'
    });

    /**
     * @ngdoc object
     * @name fvApp.constants:USER_ROLES
     * @description
     * # USER_ROLES
     * All the suported user roles
     */
    app.constant('USER_ROLES', {
        all: '*',
        admin: 'admin',
        user: 'user',
        guest: 'guest'
    });

    /**
     * @ngdoc String
     * @name fvApp.constants:FIREBASE_URL
     * @description
     * # FIREBASE_URL
     * Firebase url registered for fvApp
     */
    app.constant('FIREBASE', {
        URL: 'https://fvappdev.firebaseio.com/',
        ERROR: {
            AUTHENTICATION_DISABLED: 'The specified authentication type is not enabled for this Firebase.',
            EMAIL_TAKEN: 'The specified email address is already in use.',
            INVALID_EMAIL: 'The specified email address is incorrect.',
            INVALID_FIREBASE: 'Invalid Firebase specified.',
            INVALID_ORIGIN: 'Domain not added to the firebase whitelist.',
            INVALID_PASSWORD: 'The specified password is incorrect.',
            INVALID_USER: 'The specified user does not exist.',
            UNKNOWN_ERROR: 'An unknown error occurred. Please contact support@firebase.com.',
            USER_DENIED: 'Authentication request cancelled by the user'
        }
    });

    /**
     * @ngdoc Object
     * @name fvApp.constants:AUTH_PROVIDER_OPTIONS
     * @description
     * # AUTH_PROVIDER_OPTIONS
     * Authentication provider options
     */
    app.constant('AUTH_PROVIDER_OPTIONS', {
        facebook: {
            rememberMe: true,
            scope: 'public_profile, email'
        }
    });
}());
