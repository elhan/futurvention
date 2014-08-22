(function () {
    'use strict';

    /**
     * @ngdoc overview
     * @name fvAlphaApp
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
            'ngTouch'
        ]);

    app.config(function ($routeProvider) {
        $routeProvider
        .when('/', {
            templateUrl: 'views/main.html'
        });
//        .when('/import', {
//            templateUrl: 'views/import.html'
//        })
//        .when('/manage', {
//            templateUrl: 'views/manage.html'
//        })
//        .when('/categories', {
//            templateUrl: 'views/categories.html'
//        })
//        .when('/download', {
//            templateUrl: 'views/download.html'
//        })
//        .when('/team', {
//            templateUrl: 'views/team.html'
//        })
//        .otherwise({
//            redirectTo: '/'
//        });
    });
}());
