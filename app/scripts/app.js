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
        'angucomplete',
        'angularMoment',
        'config'
    ]);

    app.config(['$routeProvider', function ($routeProvider) {
        $routeProvider
        .when('/register', {
            templateUrl: 'views/register.html',
            controller: 'RegistrationCtrl'
        })
        .when('/login', {
            templateUrl: 'views/login.html',
            controller: 'LoginCtrl'
        })
        .when('/forgotPassword', {
            templateUrl: 'views/forgotPassword.html',
            controller: 'ForgotPwdCtrl'
        })
        .when('/resetPassword', {
            templateUrl: 'views/resetPassword.html',
            controller: 'ResetPwdCtrl'
        })
        .when('/apply', {
            templateUrl: 'views/apply.html',
            controller: 'ApplyCtrl'
        })
        .when('/workstream', {
            templateUrl: 'views/workstream.html',
            controller: 'WorkflowCtrl'
        })
        .when('/:moniker', {
            templateUrl: 'views/storefront.html',
            controller: 'StorefrontCtrl',
            resolve: {
                profile: ['$route', '$location', '$q', 'ProfileSvc', function ($route, $location, $q, ProfileSvc) {
                    var deferred = $q.defer();
                    ProfileSvc.fetchProfile($route.current.params.moniker).then(function (profile) {
                        deferred.resolve(profile);
                    }, function (error) {
//                        $location.path('/');
                        deferred.reject(error);
                    });
                    return deferred.promise;
                }]
            }
        })
        .when('/offers/:offerId', {
            templateUrl: 'views/offer.html',
            controller: 'OfferCtrl',
            resolve: {
                offer: ['$route', '$q', 'OfferSvc', function ($route, $q, OfferSvc) {
                    var deferred = $q.defer();
                    OfferSvc.fetchOffer($route.current.params.offerId).then(function (repsonse) {
                        deferred.resolve(repsonse);
                    }, function (error) {
                        deferred.reject(error);
                    });
                    return deferred.promise;
                }]
            }
        })
        .otherwise({
            templateUrl: 'views/landing.html',
            controller: 'LandingCtrl'
        });
    }]);

    app.value('duScrollGreedy', true);

    // Default settings for the alertProvider
    app.config(['$alertProvider', '$httpProvider', function ($alertProvider, $httpProvider) {
        $httpProvider.defaults.withCredentials = true;
        $httpProvider.defaults.useXDomain = true;
        delete $httpProvider.defaults.headers.common['X-Requested-With'];

        // 401 unauthorized interceptor: redirect to login page
        $httpProvider.responseInterceptors.push(['$rootScope', '$q', '$location', 'PATHS', 'ENV', 'MESSAGES', 'EVENTS', function ($rootScope, $q, $location, paths, env, msg, events) {
            return function (promise) {
                return promise.then(function (response) {
                    return response;
                }, function (error) {
                    if (error.status === 401) {
                        console.log(error);
                        // exclude user info calls as they are only used to determine auth status
                        if (error.config.url !== env.api.endPoint + paths.account.userInfo) {
                            $rootScope.$broadcast(events.auth.sessionTimeout, error);
                            $location.path('/login');
                        }
                        return error;
                    }
                    return $q.reject(error);
                });
            };
        }]);

        angular.extend($alertProvider.defaults, {
            animation: 'am-fade-and-slide-top',
            placement: 'top',
            duration: 4,
            dismissable: true,
            template: 'views/components/alert.html'
        });
    }]);

    app.run(['breeze', function (breeze) {
        !breeze && console.log('breeze not loaded!');
    }]);

}());
