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
    app.controller('MainCtrl', ['$scope', '$location', 'USER_ROLES', 'AuthSvc', 'SessionSvc', 'LocalStorageSvc', 'UserSvc', function ($scope, $location, USER_ROLES, AuthSvc, SessionSvc, LocalStorageSvc, UserSvc) {

        // wrappers added to facilitate controller testability
        $scope.userRoles = USER_ROLES;
        $scope.isAuthorized = AuthSvc.isAuthorized;
        $scope.isAuthenticated = AuthSvc.isAuthenticated;

        // Initialize the Session object when the app first loads if there is a session available in the local storage
        function initSession () {
            var firebaseSession = LocalStorageSvc.getSession();
            if (!firebaseSession) {
                return;
            }
            // TODO: implement user roles
            $scope.setCurrentUser(UserSvc.getUser(firebaseSession.user.id));
            SessionSvc.create(firebaseSession.sessionKey, firebaseSession.user.id, firebaseSession.user.provider, $scope.userRoles.user);
        }

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
        $scope.$on('auth-login-success', function (event, userId, provider) {
            // TODO: proper sessions for LinkeIn!
            provider === 'linkedIn' && SessionSvc.create(Math.random(), userId, provider, $scope.userRoles.user);
            initSession();
            $scope.setCurrentUser(UserSvc.getUser(SessionSvc.userId));
            $scope.go('/');
            // TODO: add proper logging
            console.log(event);
        });

        // initialization
        initSession();
    }]);

    /**
     * @ngdoc function
     * @name fvApp.controller:LoginCtrl
     * @description
     * # LoginCtrl
     * Controller of the login form
     */
    app.controller('LoginCtrl', ['$scope', '$rootScope', '$linkedIn', 'AUTH_EVENTS', 'AUTH_PROVIDER_OPTIONS', 'AuthSvc', 'UserSvc', function ($scope, $rootScope, $linkedIn, AUTH_EVENTS, AUTH_PROVIDER_OPTIONS, AuthSvc, UserSvc) {

        var authOptions = AUTH_PROVIDER_OPTIONS,
            authEvents = AUTH_EVENTS,
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
                newUser.id = session.id; // this is the firebase userId, not the session's id
                UserSvc.setUser(newUser); // create a new User object in the database
                $scope.login({email: newUser.email, password: newUser.password}); // auto login user after registration
            }, function (error) {
                $rootScope.$broadcast(authEvents.registrationFailed, error);
            });
        };

        $scope.loginFb = function () {
            firebase.$login('facebook', authOptions.facebook).then(function (res) {
                var user = UserSvc.getUser(res.values[0].id); // try fetch the user from the server
                !user && UserSvc.setUser({ // if the user is not registered, store a new User object
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
                    var user = UserSvc.getUser(res.values[0].id); // try fetch the user from the server
                    user&& UserSvc.setUser({ // if the user is not registered, store a new User object
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
            firebase.$login('password', { email: newUser.email, password: newUser.password }).then(function (res) {
                $rootScope.$broadcast(authEvents.loginSuccess, res.id, 'password');
            }, function (error) {
                $rootScope.$broadcast(authEvents.loginFailed, error);
            });
        };

        $scope.logout = function () {
            firebase.$logout();
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
