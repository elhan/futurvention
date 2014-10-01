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
    app.controller('ApplyCtrl', ['$scope', 'ProfileSvc', function ($scope, ProfileSvc) {
        $scope.steps = ProfileSvc.getSteps();
        $scope.activeStep = $scope.steps[0];
        $scope.goToStep = function (step) {
            $scope.activeStep = $scope.steps[step];
        };
    }]);

    /**
     * @ngdoc Controller
     * @name fvApp.controller:ApplyImportCtrl
     * @description
     * # ApplyImportCtrl
     * Controls the apply 'import' step
     */
    app.controller('ApplyImportCtrl', ['$scope', '$timeout', 'EVENTS', 'ProfileSvc', function ($scope, $timeout, events, ProfileSvc) {
        $scope.providers = ProfileSvc.initProviders();
        $scope.selectedProviders = [];

        // toggles the given provider's selection state
        $scope.toggleSelection = function (providerName) {
            var provider = $scope.providers[providerName];
            provider.selected = !provider.selected;
            if (provider.selected) {
                $scope.$broadcast(events.ui.providerSelected, providerName); // required to auto scroll down
                $scope.selectedProviders.push(provider);
            } else {
                _.remove($scope.selectedProviders, function (selectedProvider) {
                    return selectedProvider.name === provider.name;
                });
            }
        };

        // returns the giver provider's selection state
        $scope.isSelected = function (providerName) {
            return $scope.providers[providerName].selected;
        };

        // save a provider link on the backend
        $scope.saveProvider = function (providerName) {
            var provider = $scope.providers[providerName];
            provider.inProgress = true;

            ProfileSvc.saveProvider(provider).then(function (res) {
                console.log(res);
                provider.saved = true;
                provider.inProgress = false;
                ProfileSvc.updateProfile({
                    providers: new ProfileSvc.Provider(provider.name, provider.url)
                });
                console.log(ProfileSvc.getProfile());
            }, function (error) {
                //TODO: error handling
                provider.inProgress = false;
                console.log(error);
            });
        };

        // remove a provider link & corresponding data
        $scope.removeProvider = function (providerName) {
            var provider = $scope.providers[providerName];
            provider.inProgress = true;

            ProfileSvc.removeProvider(provider).then(function () {
                provider.saved = false;
                provider.inProgress = false;
                ProfileSvc.updateProfile({
                    providers: new ProfileSvc.Provider(provider.name, '')
                });
                console.log(ProfileSvc.getProfile());
            }, function (error) {
                //TODO: error handling
                provider.inProgress = false;
                console.log(error);
            });
        };
    }]);

    /**
     * @ngdoc Controller
     * @name fvApp.controller:ApplyInfoCtrl
     * @description
     * # ApplyInfoCtrl
     * Controls the apply 'info' step
     */
    app.controller('ApplyInfoCtrl', ['$scope', '$modal', '$timeout', 'ProfileSvc', function ($scope, $modal, $timeout, ProfileSvc) {
        var modalImageCrop = $modal({
            scope: $scope,
            template: 'views/components/modalImageCrop.html',
            show: false,
            animation: 'am-slide-top',
            keyboard: true
        });

        $scope.profileImage = ProfileSvc.getProfile().image;

        $scope.closeModal = function () {
            $scope.init(false);
            modalImageCrop.hide();
        };

        /*
            Expose the init function on the scope, as the fv-on-drop directive needs to call it.
            progressState is passed as an argument to enable setting the initial progress state to true
            in case of a drop event.
        **/
        $scope.init = function (progressState) {
            $scope.uncroppedImage = ''; // image selected by the user for cropping
            $scope.croppedImage = ''; // final image, after cropping
            $scope.tempImage = ''; // neccessarry to avoid shadow scopping
            $scope.setProgress(progressState);
        };

        $scope.updateCroppedImage = function (img) {
            $scope.croppedImage = img;
        };

        $scope.showImageCropModal = function () {
            modalImageCrop.$promise.then(function () {
                $scope.croppedImage = ''; // reset the croppedImage object
                modalImageCrop.show();
            });
        };

        $scope.onFileSelect =  function ($files) {
            var reader = new FileReader();
            reader.onload = function (e) {
                $timeout(function () { $scope.uncroppedImage = e.target.result; });
            };
            reader.readAsDataURL($files[0]); // Read in the image file as a data URL.
        };

        $scope.setProgress = function (state) { $scope.inProgress = state; };

        $scope.saveProfileImage = function () {
            // TODO: remove mock functionality
            $timeout(function () {
                ProfileSvc.updateProfile({ image: $scope.croppedImage });
                $scope.profileImage = angular.copy($scope.croppedImage);
                $scope.closeModal();
            });
            //            ProfileSvc.saveProfileImage($scope.croppedImage).success(function () {
            //                $scope.updateProfile( {image: $scope.croppedImage} );
            //            }).progress(function () {
            //                // TODO
            //            }).error(function () {
            //                // TODO
            //            });
        };

        $scope.init();
    }]);
}());
