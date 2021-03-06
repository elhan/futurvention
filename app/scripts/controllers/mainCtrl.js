(function () {
    'use strict';

    var app = angular.module('fvApp');

    /**
     * @ngdoc Controller
     * @name fvApp.controller:MainCtrl
     * @description
     * # MainCtrl
     * Controller of the fvApp. Contains global app logic, since we use $rootScope only for event broadcasting.
     */
    app.controller('MainCtrl', ['$scope', '$location', '$q', '$cookies', '$timeout', 'EVENTS', 'MESSAGES', 'ROUTES', 'PATHS', 'ENV', 'Utils', 'Odata', 'AccountSvc', 'NotificationSvc', 'ProfileSvc', 'UserSvc', function ($scope, $location, $q, $cookies, $timeout, events, msg, routes, paths, env, utils, odata, AccountSvc, NotificationSvc, ProfileSvc, UserSvc) {
        $scope.currentUser = {};
        $scope.avatar = {};
        $scope.session = {};

        $scope.updateCurrentUser = function (obj) {
            angular.extend($scope.currentUser, obj);
        };

        $scope.go = function (path) {
            var deferred = $q.defer();
            $location.path(path);
            deferred.resolve();
            return deferred.promise;
        };

        $scope.locationAt = function (route) {
            return route === $location.path();
        };

        $scope.handleSignIn = function () {
            AccountSvc.getUserInfo().then(function (session) {
                $scope.session = session;
                // TODO redirect user depending on profile completetion state
                $scope.locationAt('/register') ? $scope.go('/apply') : $scope.go('/');
            }, function (error) {
                console.log(error);
                NotificationSvc.show({ content: msg.error.generic, type: 'error' });
            });
        };

        ////////////////////////////////////////////
        /// Event handling
        ////////////////////////////////////////////

//        $scope.$on('$routeChangeStart', function (e, next) {
//            !$scope.session.hasRegistered && routes.public.indexOf(next.originalPath) === -1 && $scope.go('/');
//        });

//        $scope.$on('$locationChangeStart', function (event, next) {
//            var requiresAuth = true;
//
//            if (!$scope.session.hasRegistered) {
//
//                _.each(routes.public, function (route) {
//                    if ($location.path().match(route)) {
//                        requiresAuth = false;
//                    }
//                });
//
//                requiresAuth && event.preventDefault();
//            }
//        });

        $scope.$on('$routeChangeError', function (e, current, previous, rejection) {
            console.log(rejection);
            rejection && NotificationSvc.show({ content: msg.error.generic, type: 'error' });
            $scope.go('/');
        });

        $scope.$on(events.auth.loginSuccess, function () {
            $scope.handleSignIn();
        });

        $scope.$on(events.auth.registrationSuccess, function () {
            $scope.handleSignIn();
        });

        $scope.$on(events.auth.logoutSuccess, function () {
            ProfileSvc.setProfile({}); // reset profile in case user signs in with different account
            $scope.session = {};
            $scope.go('/');
        });

        $scope.$on(events.auth.logoutFailed, function () {
            $scope.currentUser = {};
            $scope.avatar = {};
            $scope.session = {};
            console.log($cookies);
            NotificationSvc.show({ content: msg.error.logoutFailed, type: 'error' });
        });

        $scope.$on(events.user.updateSuccess, function (event, user) {
            $scope.currentUser = user;
            $scope.avatar = user && user.Avatar ? encodeURI(env.api.hostedFiles + user.Avatar.RelativeUrl) : null;

            ProfileSvc.fetchOwnProfile().then(function (profile) {
                $scope.currentUser.Profile = profile;
                $scope.$broadcast(events.profile.fetchProfileSuccess);
            });
        });

        $scope.$watch('session', function (newValue, oldValue) {
            switch (true) {
            case newValue === oldValue:
                return;
            case _.isEmpty(newValue): //logout
                $scope.currentUser = {};
                break;
            default: // login
                UserSvc.fetchOwnUser();
            }
        });

        ////////////////////////////////////////////
        /// Initialization
        ////////////////////////////////////////////

        //if there are any authentication errors passed as query string by the backend, show the appropriate message and redirect to login
        $location.search().error && $scope.go('/login').then(function () {
            $location.url($location.path()); // clear the error param
            NotificationSvc.show({ content: $location.search().error, type: 'error' });
        });

        // check user authentication status when loading the app
        AccountSvc.getUserInfo().then(function (session) {
            $scope.session = session;
        }, function (error) {
            console.log(error);
        });

    }]);

}());
