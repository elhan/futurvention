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
            'mgcrea.ngStrap.modal'
        ]);

    app.config(function ($routeProvider) {
        $routeProvider
        .when('/', {
            templateUrl: 'views/main.html'
        })
        .when('/apply', {
            templateUrl: 'views/apply.html'
        });
//        .otherwise({
//            redirectTo: '/'
//        });
    });
}());
