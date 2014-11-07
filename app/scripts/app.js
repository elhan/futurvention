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
        'mgcrea.ngStrap.helpers.dimensions',
        'mgcrea.ngStrap.helpers.parseOptions',
        'mgcrea.ngStrap.tooltip',
        'mgcrea.ngStrap.select',
        'mgcrea.ngStrap.tab',
        'mgcrea.ngStrap.collapse',
        'mgcrea.ngStrap.button',
        'mgcrea.ngStrap.alert',
        'mgcrea.ngStrap.typeahead',
        'config',
        'angularFileUpload',
        'ngImgCrop',
        'duScroll',
        'angular-carousel',
        'ui.validate',
        'breeze.angular',
        'angucomplete'
    ]);

    app.config(['$routeProvider', function ($routeProvider) {
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
        .when('/forgotPassword', {
            templateUrl: 'views/forgotPassword.html'
        })
        .when('/resetPassword', {
            templateUrl: 'views/resetPassword.html'
        })
        .when('/apply', {
            templateUrl: 'views/apply.html'
        })
        .when('/storefront/:userId', {
            templateUrl: 'views/storefront.html',
            controller: 'StorefrontCtrl',
            resolve: {
                profile: ['$location', '$route', 'ProfileSvc', function ($location, $route, ProfileSvc) {
                    return ProfileSvc.fetchProfile($location.absUrl());
                }],
                userId: ['$route', function ($route) {
                    return $route.current.params.userId;
                }]
            }
        })
        .when('/offer/:offerId', {
            templateUrl: 'views/offer.html',
            controller: 'OfferCtrl',
            resolve: {
                offer: ['$route', 'OfferSvc', function ($route, OfferSvc) {
                    return OfferSvc.fetchOffer($route.current.params.offerId);
                }]
            }
        })
        .otherwise({
            redirectTo: '/'
        });
    }]);

    app.value('duScrollGreedy', true);

    // Default settings for the alertProvider
    app.config(['$alertProvider', function($alertProvider) {
        angular.extend($alertProvider.defaults, {
            animation: 'am-fade-and-slide-top',
            placement: 'top',
            duration: 4,
            dismissable: false
        });
    }]);

    app.run(['breeze', function (breeze) {
        !breeze && console.log('breeze not loaded!');
    }]);
}());
