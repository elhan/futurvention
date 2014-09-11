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
     * All the suported usr roles
     */
    app.constant('USER_ROLES', {
        all: '*',
        admin: 'admin',
//        editor: 'editor',
//        guest: 'guest'
    });
}());
