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
    app.controller('MainCtrl', ['$scope', '$location', 'USER_ROLES', 'AuthSvc', 'SessionSvc', 'LocalStorageSvc', 'UserSvc', 'EVENTS', function ($scope, $location, USER_ROLES, AuthSvc, SessionSvc, LocalStorageSvc, UserSvc, EVENTS) {

        // wrappers added to facilitate controller testability
        $scope.userRoles = USER_ROLES;
        $scope.isAuthorized = AuthSvc.isAuthorized;
        $scope.isAuthenticated = AuthSvc.isAuthenticated;

        // Initialize the Session object when the app first loads if there is a session available in the local storage
        function initSession () {
            var firebaseSession = LocalStorageSvc.getSession(),
                user = UserSvc.fetchUser();
            if (!user && !firebaseSession) {
                return; // user is not logged in
            }
            // TODO: implement user roles
            $scope.setCurrentUser(UserSvc.fetchUser());
            if (firebaseSession) {
                SessionSvc.create(firebaseSession.sessionKey, firebaseSession.user.id, firebaseSession.user.provider, $scope.userRoles.user);
            } else {
                // TODO: proper linkedIn session
                SessionSvc.create(Math.random(), user.id, 'linkedIn', $scope.userRoles.user);
            }
        }

        /*
            A setter function for the currentUser object. This is neccessary since assigning
            a new value to currentUser from a child scope would otherwise result in a shadow property.
        **/
        $scope.setCurrentUser = function (user) {
            $scope.currentUser = user;
        };

        $scope.updateCurrentUser = function (obj) {
            angular.extend($scope.currentUser, obj);
        };

        $scope.go = function (path) {
            $location.path(path);
        };

        $scope.locationAt = function (route) {
            return route === $location.path();
        };

        ////////////////////////////////////////////
        /// Event handling
        ////////////////////////////////////////////

        $scope.$on('$routeChangeError', function (e, current, previous, rejection) {
            console.log(rejection);
            rejection === EVENTS.profile.fetchProfileFailed && $scope.go('/');
        });

        // update Session object and currentUser model on logout
        $scope.$on('auth-logout-success', function (event) {
            SessionSvc.destroy();
            $scope.setCurrentUser({});
            $scope.go('/');
            // TODO: add proper logging
            console.log(event);
        });

        // update Session object and currentUser model on login
        $scope.$on('auth-login-success', function (event, userId, provider) {
            // TODO: proper sessions for LinkeIn!
            provider === 'linkedIn' && SessionSvc.create(Math.random(), userId, provider, $scope.userRoles.user);
            initSession();
            $scope.setCurrentUser(UserSvc.fetchUser(SessionSvc.userId));
            // if the user just registered, redirect him to seller application flow
            $scope.locationAt('/register') ? $scope.go('/apply') : $scope.go('/');
            // TODO: add proper logging
            console.log(event);
        });

        // initialization
        initSession();
    }]);

}());
