(function () {
    'use strict';

    var app = angular.module('fvApp');

    /**
     * @ngdoc object
     * @name fvApp.constant:EVENTS
     * @description
     * # EVENTS
     * All the supported $rootScope events.
     */
    app.constant('EVENTS', {
        user: {
            createSuccess: 'user-creation-success',
            createFailed: 'user-creation-failed',
            updateSuccess: 'user-update-success',
            updateFailed: 'user-update-failed'
        },
        auth: {
            registrationSuccess: 'auth-registration-success',
            registrationFailed: 'auth-registration-failed',
            loginSuccess: 'auth-login-success',
            loginFailed: 'auth-login-failed',
            logoutSuccess: 'auth-logout-success',
            sessionTimeout: 'auth-session-timeout',
            notAuthenticated: 'auth-not-authenticated',
            notAuthorized: 'auth-not-authorized'
        },
        firebase: {
            firebaseConnected: 'firebase-connected'
        }
    });

    /**
     * @ngdoc object
     * @name fvApp.constant:USER_ROLES
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
     * @name fvApp.constant:FIREBASE_PARAMS
     * @description
     * # FIREBASE_settings
     * Firebase settings registered for fvApp
     */
    app.constant('FIREBASE_PARAMS', {
        url: 'https://fvappdev.firebaseio.com/',
        error: {
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
     * @name fvApp.constant:AUTH_PROVIDER_OPTIONS
     * @description
     * # AUTH_PROVIDER_OPTIONS
     * Authentication provider options
     */
    app.constant('AUTH_PROVIDER_OPTIONS', {
        facebook: {
//            rememberMe: true,
            scope: 'public_profile, email'
        },
        linkedIn: {
            scope: 'r_emailaddress r_fullprofile',
            fields: ['id', 'first-name', 'last-name', 'email-address'],
            authorize: true,
            credentials_cookie: true // only supported for https!
        }
    });
}());
