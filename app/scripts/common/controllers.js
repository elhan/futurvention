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
    app.controller('MainCtrl', ['$scope', '$location', 'USER_ROLES', 'AuthSvc', 'SessionSvc', 'LocalStorageSvc', 'UserSvc', function ($scope, $location, USER_ROLES, AuthSvc, SessionSvc, LocalStorageSvc, UserSvc) {

        // wrappers added to facilitate controller testability
        $scope.userRoles = USER_ROLES;
        $scope.isAuthorized = AuthSvc.isAuthorized;
        $scope.isAuthenticated = AuthSvc.isAuthenticated;

        // Initialize the Session object when the app first loads if there is a session available in the local storage
        function initSession () {
            var firebaseSession = LocalStorageSvc.getSession(),
                user = UserSvc.getUser();
            if (!user && !firebaseSession) {
                return; // user is not logged in
            }
            // TODO: implement user roles
            $scope.setCurrentUser(UserSvc.getUser());
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

        $scope.go = function (path) {
            $location.path(path);
        };

        $scope.locationAt = function (route) {
            return route === $location.path();
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
            // if the user just registered, redirect him to seller application flow
            $scope.locationAt('/register') ? $scope.go('/apply') : $scope.go('/');
            // TODO: add proper logging
            console.log(event);
        });

        // initialization
        initSession();
    }]);

    /**
     * @ngdoc Controller
     * @name fvApp.controller:LoginCtrl
     * @description
     * # LoginCtrl
     * Controller of the login form
     */
    app.controller('LoginCtrl', ['$scope', '$rootScope', '$linkedIn', 'EVENTS', 'AUTH_PROVIDER_OPTIONS', 'AuthSvc', 'UserSvc', function ($scope, $rootScope, $linkedIn, EVENTS, AUTH_PROVIDER_OPTIONS, AuthSvc, UserSvc) {

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
                UserSvc.setUser({ // if the user is not registered, store a new User object
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
                    UserSvc.setUser({ // if the user is not registered, store a new User object
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
                UserSvc.setUser(newUser); // create a new User object in the database
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

    /**
     * @ngdoc Controller
     * @name fvApp.controller:ApplyCtrl
     * @description
     * # ApplyCtrl
     * Controls the apply page & seller profile completion
     */
    app.controller('ApplyCtrl', ['$scope', function ($scope) {
        // init the new User profile
        $scope.profile = {};

        // profile completion steps
        $scope.steps = ['import', 'complete', 'open'];
        $scope.activeStep = $scope.steps[0];

        // avoid shadow properties
        $scope.updateProfile = function (profileData) {
            angular.extend($scope.profile, profileData);
        };
    }]);

    /**
     * @ngdoc Controller
     * @name fvApp.controller:ApplyImportCtrl
     * @description
     * # ApplyImportCtrl
     * Controls the apply 'import' step
     */
    app.controller('ApplyImportCtrl', ['$scope', 'Utils', function ($scope, Utils) {
        var providerNames = ['linkedIn', 'oDesk', 'elance', 'peoplePerHour', 'freelancer', 'behance', 'dribbble', 'github'];

        function initProviders() {
            _.forEach(providerNames, function (name) {
                $scope.providers[name] = { selected: false, url: '', saved: false };
            });
        }

        $scope.providers = {};

        $scope.pseudoUrlPattern = Utils.PSEUDO_URL_PATTERN;

        // toggles the given provider's selection state
        $scope.toggleSelection = function (providerName) {
            $scope.providers[providerName].selected = !$scope.providers[providerName].selected;
        };

        // returns the giver provider's selection state
        $scope.isSelected = function (providerName) {
            return  $scope.providers[providerName].selected;
        };

        // returns a collection of all the selected providers
        $scope.getSelectedProviders = function () {
            var selectedProviders = [];
            _.forIn($scope.providers, function (provider) {
                provider.selected && selectedProviders.push(provider);
            });
            return selectedProviders;
        };

        initProviders();

    }]);

}());
