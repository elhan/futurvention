(function () {
    'use strict';

    var app = angular.module('fvApp');

    /**
     * @ngdoc Controller
     * @name fvApp.controller:AuthCtrl
     * @description
     * # AuthCtrl
     * Controller of the login form
     */
    app.controller('AuthCtrl', ['$scope', '$rootScope', '$linkedIn', 'EVENTS', 'AUTH_PROVIDER_OPTIONS', 'AuthSvc', 'UserSvc', function ($scope, $rootScope, $linkedIn, EVENTS, AUTH_PROVIDER_OPTIONS, AuthSvc, UserSvc) {

        var authOptions = AUTH_PROVIDER_OPTIONS,
            authEvents = EVENTS.auth,
            firebase = AuthSvc.firebaseAuth();

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
            firebase.$createUser(newUser.email, newUser.password).then(function (session) {
                $rootScope.$broadcast(authEvents.registrationSuccess, session);
                $scope.login(newUser); // auto login user after registration
            }, function (error) {
                $rootScope.$broadcast(authEvents.registrationFailed, error);
            });
        };

        $scope.loginFb = function () {
            firebase.$login('facebook', authOptions.facebook).then(function (res) {
                UserSvc.saveUser({ // if the user is not registered, store a new User object
                    id: res.id,
                    firstName: res.thirdPartyUserData.first_name,
                    lastName: res.thirdPartyUserData.last_name,
                    email: res.thirdPartyUserData.email
                });
                $rootScope.$broadcast(authEvents.loginSuccess, res.id, 'facebook');
            }, function (error) {
                $rootScope.$broadcast(authEvents.loginFailed, error);
            });
        };

        $scope.loginLi = function () {
            AuthSvc.loginLi().then(function () {
                AuthSvc.getLiProfile().then(function (res) {
                    UserSvc.saveUser({ // if the user is not registered, store a new User object
                        id: res.values[0].id,
                        firstName: res.values[0].firstName,
                        lastName: res.values[0].lastName,
                        email: res.values[0].emailAddress
                    });
                    $rootScope.$broadcast(authEvents.loginSuccess, res.values[0].id, 'linkedIn');
                });
            });
        };

        $scope.login = function (newUser) {
            firebase.$login('password', { email: newUser.email, password: newUser.password }).then(function (session) {
                newUser.id = session.id; // this is the firebase userId, not the session's id
                UserSvc.saveUser(newUser); // create a new User object in the database
                $rootScope.$broadcast(authEvents.loginSuccess, session.id, 'password');
            }, function (error) {
                $rootScope.$broadcast(authEvents.loginFailed, error);
            });
        };

        $scope.logout = function () {
            firebase.$logout();
            UserSvc.removeUser();
            $rootScope.$broadcast(authEvents.logoutSuccess, event);
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
                $scope.authError.invalidUser = $scope.newUser.email;
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

}());
