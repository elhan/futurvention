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
            $scope.go('/');
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

        $scope.hasUnsavedProviders = function () {
            return _.find($scope.selectedProviders, function (provider) {
                return !provider.saved; // return the first unsaved provider in selectedProviders
            });
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
        $scope.removeProvider = function (provider) {
            provider.inProgress = true;
            ProfileSvc.removeProvider(provider).then(function () {
                provider.selected = false;
                provider.saved = false;
                provider.inProgress = false;
                provider.url = '';
                _.remove($scope.selectedProviders, provider);
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

        $scope.editProvider = function (provider) {
            provider.saved = false;
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

        $scope.personalUrlExists = false; // true if the user has set a url that already exists. Used to display error label
        $scope.profileImage = ProfileSvc.getProfile().image; // default, in case the user already has a profile image
        $scope.countries = ProfileSvc.getCountries(); // all available countries - used to populate the dropdown

        $scope.personalUrl = '';
        $scope.title = '';
        $scope.title = '';
        $scope.city = '';
        $scope.country = '';

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
            reader.onloadstart = function () {
                $scope.setProgress(true);
            };
            reader.onload = function (e) {
                $timeout(function () {
                    $scope.uncroppedImage = e.target.result;
                    $scope.setProgress(false);
                });
            };
            reader.readAsDataURL($files[0]); // Read in the image file as a data URL.
        };

        $scope.setProgress = function (state) { $scope.inProgress = state; };

        // expose this on scope as some form inputs need to be aware of the profile completion state
        $scope.getProfile = function () {
            return ProfileSvc.getProfile();
        };

        $scope.saveProfileImage = function () {
            ProfileSvc.saveProfileImage($scope.croppedImage).then(function (res) {
                console.log(res);
                ProfileSvc.updateProfile({ image: $scope.croppedImage });
                $scope.profileImage = angular.copy($scope.croppedImage);
                $scope.closeModal();
            }, function (err) {
                // TODO: error handling
                console.log(err);
            });
        };

        $scope.savePersonalUrl = function () {
            ProfileSvc.savePersonalUrl($scope.personalUrl).then(function (res) {
                console.log(res);
                ProfileSvc.updateProfile({ personalUrl: $scope.personalUrl });
            }, function (err) {
                console.log(err);
                // TODO: check for specific 'url exists' error
                $scope.personalUrlExists = true;
            });
        };

        // on continue, save the rest of the user's info
        $scope.continue = function () {
            var info = {
                title: $scope.title,
                bio: $scope.bio,
                city: $scope.city,
                country: $scope.country
            };
            ProfileSvc.saveProfile(info).then(function (res) {
                console.log(res);
                ProfileSvc.updateProfile(info); // update the cached Profile object once the server has persisted it
                console.log(ProfileSvc.getProfile());
                $scope.goToStep(2);
            }, function (err) {
                // TODO: handle error
                console.log(err);
            });
        };
        $scope.init();
    }]);

    /**
     * @ngdoc Controller
     * @name fvApp.controller: ServiceSelectCtrl
     * @description
     * # ServiceSelectCtrl
     * Controls the apply 'service select' step
     */
    app.controller('ServiceSelectCtrl', ['$scope', '$timeout', 'CatalogueSvc', function ($scope, $timeout, CatalogueSvc) {
        // show thumbnails in batches of 16 (4 rows of 4 thumbnails)
        $scope.batch = 16;

        // add an 'All' option to the category collection and set it as the default active category
        $scope.categories = CatalogueSvc.categories;
        !_.contains($scope.categories, 'All') && $scope.categories.unshift('All');

        // bs-tabs needs the idnex as model, not the string value of the category
        $scope.categories.activeCategoryIndex = 0;

        /*
            Pagination support for available services. This is initailized to 16 since that is the default
            thumbnail batch size. The paginationIndex is passed as an argument when filtering services.
        **/
        $scope.paginationIndex = 16;

        $scope.getServices = function () {
            return CatalogueSvc.getServicesInCategory($scope.categories[$scope.categories.activeCategoryIndex], $scope.paginationIndex);
        };

        $scope.services = $scope.getServices(); // the filtered services (by category and pagination)
        $scope.allServices = CatalogueSvc.services; // all available services - necessary for autocomplete & pagination
        $scope.selectedServices = []; // all services selected by the user
        $scope.selectedService = ''; // the latest services to be selected. Model for autocomplete.

        /*
           Fetch the service object for the given service name from the server. When the promise is resolved successfuly,
           update CatalogueSvc.serviceToEdit (needed to initialize ServiceConfigCtrl), and navigate to the service configuration step
        **/
        $scope.editService = function (serviceName) {
            CatalogueSvc.getService(serviceName).then(function (service) {
                CatalogueSvc.setServiceToEdit(service);
                $scope.goToStep(3);
            },function (error) {
                // TODO: error handling
                console.log(error);
            });
        };

        $scope.removeSelected = function (service) {
            _.remove($scope.selectedServices, function(selectedService) {
                return selectedService === service;
            });
        };

        // loads one more batch of thumbnails
        $scope.showMore = function () {
            $scope.paginationIndex += $scope.batch;
            $scope.services = $scope.getServices();
        };

        // update the filtered services when the category changes
        $scope.$watch('categories.activeCategoryIndex', function (newIndex, oldIndex) {
            if (newIndex === oldIndex) {
                return;
            }
            $scope.services = $scope.getServices();
        });

    }]);

    /**
     * @ngdoc Controller
     * @name fvApp.controller: ServiceConfigCtrl
     * @description
     * # ServiceConfigCtrl
     * Controls the apply 'service config' step
     */
    app.controller('ServiceConfigCtrl', ['$scope', '$timeout', '$modal', '$upload', 'CatalogueSvc', 'EmbedlySvc', 'Utils', function ($scope, $timeout, $modal, $upload, CatalogueSvc, EmbedlySvc, Utils) {

        var modalEmbedUrl = $modal({
            scope: $scope,
            template: 'views/components/modalEmbedUrl.html',
            show: false,
            keyboard: false,
            animation: 'am-slide-top'
        });

        $scope.urlsToEmbed = [{url: ''}];

        $scope.closeModal = function () {
            Utils.emptyArray($scope.urlsToEmbed);
            modalEmbedUrl.hide();
        };

        $scope.service = CatalogueSvc.getServiceToEdit();

        $scope.showcase = [];

        // TODO: dynamically adjust from service model
        $scope.panels = [
            {
                title: 'Service Description',
                state: 'default'
            },
            {
                title: 'Work Samples',
                state: 'default'
            },
            {
                title: 'Personalize your offering',
                state: 'default'
            },
            {
                title: 'Pricing / Deadlines',
                state: 'default'
            }
        ];

        $scope.panels.activePanel = 0;
        $timeout(function () { $scope.panels.activePanel = 0; }); // update the UI

        $scope.setPanelState = function (panel, state) {
            panel.state = state;
        };

        $scope.closePanel = function (panel) {
            $scope.setPanelState(panel, 'done');
            $scope.panels.activePanel = $scope.panels.indexOf(
                _.find($scope.panels, function (panel) {
                    return panel.state === 'default';
                })
            );
        };

        $scope.showEmbedUrlModal = function () {
            modalEmbedUrl.$promise.then(function () { modalEmbedUrl.show(); });
        };

        $scope.addUrls = function () {
            EmbedlySvc.oembed($scope.urlsToEmbed).then(function (res) {
                _.each(res.data, function (obj) {
                    $scope.showcase.push({
                        name: obj.thumbnail_url,
                        link: obj.thumbnail_url,
                        state: 'loaded'
                    });
                    $scope.closeModal();
                });
            }, function (err) {
                console.log(err);
            });
        };

        $scope.onFileSelect = function (files) {
            _.each(files, function (file) {
                var index;

                // check if the file has already been uploaded
                if (_.where($scope.showcase, { name: file.name }).length > 0) {
                    return;
                }

                $scope.showcase.push({
                    name: 'Loading...',
                    link: '',
                    state: 'loading' // possible states are loading, loaded, selected
                });

                index = $scope.showcase.length - 1; // keep the item's correct position in the showcase after pushing

                $upload.upload({
                    url: 'http://fvmock.herokuapp.com/upload',
                    method: 'POST',
                    headers: { 'x-filename': file.name },
                    file: file,
                }).success(function () {
                    var fileReader = new FileReader();
                    fileReader.onload = function (e) {
                        $scope.$apply(function () {
                            _.assign($scope.showcase[index], {
                                name: file.name,
                                link: e.target.result,
                                state: 'loaded'
                            });
                        });
                    };
                    fileReader.readAsDataURL(file);
                })
                .error(function (err) {
                    console.log(err);
                    $scope.showcase.splice(index, 1); // remove the item from the showcase
                });
            });
        };

        $scope.rearangeShowcase = function (item) {
            // The source (dragged) item link is passed via the fv-data attribute into the drop event
            var sourceIndex, targetIndex,
                source = JSON.parse(this.event.dataTransfer.getData('Text')),
                target = item.link;

            if (source === target) {
                return;
            }

            sourceIndex = $scope.showcase.indexOf(_.where($scope.showcase, { link: source })[0]);
            targetIndex = $scope.showcase.indexOf(_.where($scope.showcase, { link: target })[0]);

            $scope.showcase = Utils.swap($scope.showcase, sourceIndex, targetIndex);
        };

        $scope.toggleSelection = function (item) {
            switch (item.state) {
                case 'selected':
                    item.state = 'loaded';
                    break;
                case 'loaded':
                    item.state = 'selected';
                    break;
                default:
                    return;
            }
        };
    }]);

}());
