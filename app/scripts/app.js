(function () {
    'use strict';

    /**
     * @ngdoc overview
     * @name fvApp
     * @description
     * # fvApp
     *
     * Main module of the application.
     */
    var app = angular.module('fvApp',
        [
            'ngAnimate',
            'ngCookies',
            'ngResource',
            'ngRoute',
            'ngSanitize',
            'ngTouch',
            'mgcrea.ngStrap',
            'mgcrea.ngStrap.modal',
            'facebook',
            'ngLinkedIn',
            'config',
            'firebase'
        ]);

    app.config(function ($routeProvider) {
        $routeProvider
        .when('/', {
            templateUrl: 'views/main.html'
        })
        .when('/register', {
            templateUrl: 'views/register.html'
        })
        .when('/login', {
            templateUrl: 'views/login.html'
        })
        .when('/apply', {
            templateUrl: 'views/apply.html'
        });
//        .otherwise({
//            redirectTo: '/'
//        });
    });

    // Initialize authentication providers. The api keys differ by enviropment (development, production)
    app.config(function(FacebookProvider, $linkedInProvider, ENV, AUTH_PROVIDER_OPTIONS) {
        var authOptions = AUTH_PROVIDER_OPTIONS;
        FacebookProvider.init(ENV.fbApiKey, authOptions.facebook);
        $linkedInProvider.options({
            appKey: ENV.liApiKey,
            scope: authOptions.linkedIn.scope,
            authorize: authOptions.linkedIn.authorize,
            credentials_cookie: authOptions.linkedIn.credentials_cookie
        });
    });

}());
