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
            'facebook',
            'ngLinkedIn',
            'config',
            'firebase',
            'angularFileUpload',
            'ngImgCrop',
            'duScroll',
            'angular-carousel'
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
        .when('/apply', {
            templateUrl: 'views/apply.html'
        })
        .when('/storefront/:userId', {
            templateUrl: 'views/storefront.html',
            controller: 'StorefrontCtrl',
            resolve: {
                userExists: ['$q', '$location', 'ProfileSvc', 'EVENTS', function ($q, $location, ProfileSvc, EVENTS) {
                    var deferred = $q.defer();
                    ProfileSvc.fetchPersonalUrlStatus($location.absUrl()).then(function (status) {
                        // redirect to root if the url does not belong to any user
                        status ? deferred.resolve() : deferred.reject(EVENTS.profile.fetchProfileFailed);
                    }, function (error) {
                        console.log(error);
                        deferred.reject(EVENTS.profile.fetchProfileFailed);
                    });
                    return deferred.promise;
                }]
            }
        })
        .otherwise({
            redirectTo: '/'
        });
    }]);

    // Initialize authentication providers. The api keys differ by enviropment (development, production)
    app.config(['FacebookProvider', '$linkedInProvider', '$alertProvider', 'ENV', 'AUTH_PROVIDER_OPTIONS', function(FacebookProvider, $linkedInProvider, $alertProvider, ENV, AUTH_PROVIDER_OPTIONS) {
        var authOptions = AUTH_PROVIDER_OPTIONS;

        FacebookProvider.init(ENV.fbApiKey, authOptions.facebook);

        $linkedInProvider.options({
            appKey: ENV.liApiKey,
            scope: authOptions.linkedIn.scope,
            authorize: authOptions.linkedIn.authorize,
            credentials_cookie: authOptions.linkedIn.credentials_cookie
        });

        angular.extend($alertProvider.defaults, {
            animation: 'am-fade-and-slide-top',
            placement: 'top',
            duration: 4,
            dismissable: false
        });
    }]);

    app.value('duScrollGreedy', true);

}());
