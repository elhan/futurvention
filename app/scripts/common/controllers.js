(function () {
    'use strict';

    var app = angular.module('fvApp');

    /**
     * @ngdoc function
     * @name fvApp.controller:MainCtrl
     * @description
     * # MainCtrl
     * Controller of the fvApp. Contains global app logic, since we use $rootScope only for event broadcasting.
     */
    app.controller('MainCtrl', ['$scope', '$location', '$modal', 'USER_ROLES', 'AuthSvc', 'SessionSvc', 'LocalStorageSvc', function ($scope, $location, $modal, USER_ROLES, AuthSvc, SessionSvc, LocalStorageSvc) {

        // Initialize the user object when the app first loads. Load user data from the stored sesion, if available
        function initCurrentUser () {
            var user,
                firebaseSession = LocalStorageSvc.getSession();
            if (!firebaseSession) {
                return;
            }

            switch (firebaseSession.user.provider) {
            case 'facebook':
                user = {
                    id: firebaseSession.user.uid,
                    provider: firebaseSession.user.provider,
                    firstName: firebaseSession.user.thirdPartyUserData.first_name,
                    lastName: firebaseSession.user.thirdPartyUserData.last_name,
                    email: firebaseSession.user.thirdPartyUserData.email
                };
                break;
            case 'password':
                user = {
                    id: firebaseSession.user.uid,
                    provider: firebaseSession.user.provider,
                    firstName: firebaseSession.user.firstName,
                    lastName: firebaseSession.user.lastName,
                    email: firebaseSession.user.email
                };
                break;
//            default: {}
            }
            $scope.setCurrentUser(user);
        }

        // Initialize the Session object when the app first loads if there is a stored sesion available
        function initSession () {
            var firebaseSession = LocalStorageSvc.getSession();
            // TODO: implement user roles
            firebaseSession && SessionSvc.create(firebaseSession.sessionKey, firebaseSession.user.id, $scope.userRoles.user);
        }

        // wrappers added to facilitate controller testability
        $scope.userRoles = USER_ROLES;
        $scope.isAuthorized = AuthSvc.isAuthorized;
        $scope.isAuthenticated = AuthSvc.isAuthenticated;

        /*
            A setter function for the currentUser object. This is neccessary since assigning
            a new value to currentUser from a child scope would otherwise result in a shadow property.
        **/
        $scope.setCurrentUser = function (user) {
            $scope.currentUser = user;
        };

        $scope.go = function (path) {
            $location.path(path);
        };

        // update Session object and currentUser model on logout
        $scope.$on('auth-logout-success', function (event) {
            SessionSvc.destroy();
            $scope.setCurrentUser({});
            // TODO: add proper logging
            console.log(event);
        });

        // update Session object and currentUser model on login
        $scope.$on('auth-login-success', function (event, user) {
            initSession();
            $scope.setCurrentUser(user);
            $scope.go('/');
            // TODO: add proper logging
            console.log(event);
        });

        // initialization
        initSession();
        initCurrentUser();
    }]);

    /**
     * @ngdoc function
     * @name fvApp.controller:LoginCtrl
     * @description
     * # LoginCtrl
     * Controller of the login form
     */
    app.controller('LoginCtrl', ['$scope', '$rootScope', 'AUTH_EVENTS', 'AUTH_PROVIDER_OPTIONS', 'FIREBASE', 'AuthSvc', function ($scope, $rootScope, AUTH_EVENTS, AUTH_PROVIDER_OPTIONS, FIREBASE, AuthSvc) {

        // create a new Firebase instance
        var firebase = AuthSvc.firebaseAuth();

        // the models for the registration form
        $scope.newUser = {
            firstName: '',
            lastName: '',
            email: '',
            password: ''
        };

        // initialize errors
        $scope.authError = {
            emailTaken: false,
            invalidEmail: false,
            invalidPassword: false
        };

        $scope.register = function (newUser) {
            firebase.$createUser(newUser.email, newUser.password).then(function (user) {
                $rootScope.$broadcast(AUTH_EVENTS.registrationSuccess, user);
                $scope.login({email: newUser.email, password: newUser.password}); // auto login user after registration
            }, function (error) {
                $rootScope.$broadcast(AUTH_EVENTS.registrationFailed, error);
            });
        };

        $scope.loginFb = function () {
            firebase.$login('facebook', AUTH_PROVIDER_OPTIONS.facebook).then(function (res) {
                var user  = {
                    id: res.uid,
                    provider: 'facebook',
                    firstName: res.thirdPartyUserData.first_name,
                    lastName: res.thirdPartyUserData.last_name,
                    email: res.thirdPartyUserData.email
                };
                $rootScope.$broadcast(AUTH_EVENTS.loginSuccess, user);
            }, function (error) {
                $rootScope.$broadcast(AUTH_EVENTS.loginFailed, error);
            });
        };

        $scope.login = function (newUser) {
            var credentials = {
                email: newUser.email,
                password: newUser.password
            };
            firebase.$login('password', credentials).then(function (res) {
                var user  = {
                    id: res.uid,
                    provider: 'password',
                    firstName: res.firstName,
                    lastName: res.lastName,
                    email: res.email
                };
                $rootScope.$broadcast(AUTH_EVENTS.loginSuccess, user);
            }, function (error) {
                $rootScope.$broadcast(AUTH_EVENTS.loginFailed, error);
            });
        };

        $scope.logout = function () {
            firebase.$logout();
            $rootScope.$broadcast(AUTH_EVENTS.logoutSuccess, event);
        };

        // Registration error handling
        $scope.$on('auth-registration-failed', function (event, error) {
            switch (error.code) {
                case 'EMAIL_TAKEN':
                    // cache last taken email to properly display errors
                    $scope.authError.emailTaken = $scope.newUser.email;
                    break;
                case 'INVALID_EMAIL':
                    $scope.authError.invalidEmail = $scope.newUser.email;
                    break;
                default: // the rest of the registration errors should not be displayed to the user, just logged
                    // TODO: add to logger when client logging is implemented
                    console.log(event, error);
            }
        });

        // Login error handling
        $scope.$on('auth-login-failed', function (event, error) {
            switch (error.code) {
                case 'INVALID_USER':
                    $scope.authError.invalidUser = true;
                    break;
                case 'INVALID_EMAIL':
                    $scope.authError.invalidEmail = $scope.newUser.email;
                    break;
                case 'INVALID_PASSWORD':
                    $scope.authError.invalidPassword= $scope.newUser.password;
                    break;
                default: // the rest of the authentication errors should not be displayed to the user, just logged
                    // TODO: add to logger when client logging is implemented
                    console.log(event, error);
            }
        });

    }]);

    /**
     * @ngdoc function
     * @name fvApp.controller:HeaderCtrl
     * @description
     * # HeaderCtrl
     * Controller of header navigation bar
     */
    app.controller('HeaderCtrl', ['$scope', '$location', function ($scope, $location) {
        // The header needs to be aware of the current location
        $scope.locationAt = function (route) {
            return route === $location.path();
        };
    }]);
}());
