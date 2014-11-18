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
    app.controller('MainCtrl', ['$scope', '$location', '$q', '$cookies', '$timeout', 'EVENTS', 'MESSAGES', 'ROUTES', 'Utils', 'AccountSvc', 'NotificationSvc', 'ProfileSvc', 'UserSvc', function ($scope, $location, $q, $cookies, $timeout, events, msg, routes, utils, AccountSvc, NotificationSvc, ProfileSvc, UserSvc) {
        $scope.currentUser = {};
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

        ////////////////////////////////////////////
        /// Event handling
        ////////////////////////////////////////////

        $scope.$on('$routeChangeStart', function (e, next) {
            !$scope.session.hasRegistered && routes.public.indexOf(next.originalPath) === -1 && $scope.go('/');
        });

        $scope.$on('$routeChangeError', function (e, current, previous, rejection) {
            console.log(rejection);
            NotificationSvc.show({
                content: msg.error.generic,
                type: 'error'
            });
            $scope.go('/');
        });

        $scope.$on(events.auth.loginSuccess, function () {
            AccountSvc.getUserInfo().then(function (session) {
                $scope.session = session;
                // TODO redirect user depending on profile completetion state
                $scope.locationAt('/register') ? $scope.go('/apply') : $scope.go('/');
            }, function (error) {
                console.log(error);
                NotificationSvc.show({
                    content: msg.error.generic,
                    type: 'error'
                });
            });
        });

        $scope.$on(events.auth.logoutSuccess, function () {
            $scope.session = {};
            $scope.go('/');
        });

        $scope.$on(events.auth.logoutFailed, function () {
            NotificationSvc.show({
                content: msg.error.logoutFailed,
                type: 'error'
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
                ProfileSvc.fetchProfileStatus().then(function (response) {
                    if (response.data !== 'null') { // profile exists
                        ProfileSvc.fetchOwnProfile().then(function () {
                            $scope.currentUser = ProfileSvc.profile.user;
                        }, function (error) {
                            // TODO: error handling
                            console.log(error);
                        });
                    } else {
                        $scope.currentUser = utils.camelCaseKeys(new UserSvc.User());
                    }
                }, function (error) {
                    console.log(error);
                });

                ProfileSvc.fetchOwnProfile().then(function () {
                    $scope.currentUser = ProfileSvc.profile ? ProfileSvc.profile.user : utils.camelCaseKeys(new UserSvc.User());
                }, function (error) {
                    // TODO: error handling
                    console.log(error);
                });
            }
        });

        ////////////////////////////////////////////
        /// Initialization
        ////////////////////////////////////////////

        //if there are any authentication errors passed as query string by the backend, show the appropriate message and redirect to login
        $location.search().error && $scope.go('/login').then(function () {
            $location.url($location.path()); // clear the error param
            NotificationSvc.show({
                content: $location.search().error,
                type: 'error'
            });
        });

        // check user authentication status when loading the app
        AccountSvc.getUserInfo().then(function (session) {
            $scope.session = session;
        }, function (error) {
            console.log(error);
        });

    }]);

}());
