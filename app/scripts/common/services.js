(function () {
    'use strict';
    var app = angular.module('fvApp');

    /**
     * @ngdoc service
     * @name fvApp.service:SessionSvc
     * @description
     * # SessionSvc
     * A singleton object following the service style to cash the user's session info.
     */
    app.service('SessionSvc', function () {
        this.create = function (sessionId, userId, provider, userRole) {
            this.id = sessionId;
            this.userId = userId;
            this.userRole = userRole;
        };
        this.destroy = function () {
            this.id = null;
            this.userId = null;
            this.userRole = null;
        };
        return this;
    });

    /**
     * @ngdoc service
     * @name fvApp.service:LocalStorageSvc
     * @description
     * # LocalStorageSvc
     * A service for interacting with the localStorage object.
     */
    app.service('LocalStorageSvc', function () {
        this.getSession = function () {
            return JSON.parse(localStorage.getItem('firebaseSession'));
        };
        return this;
    });

    /**
     * @ngdoc service
     * @name fvApp.service:UserSvc
     * @description
     * # UserSvc
     * Interacts with the server to set, get, and delete User objects.
     */
    app.service('UserSvc', function () {
        var UserSvc = {},
            user = {};

        UserSvc.User = function (firstName, lastName, id) {
            return {
                firstName: '' || firstName,
                lastName: '' || lastName,
                id: id || generateUserId()
            };
        };

       user = new UserSvc.User();

        function generateUserId () {
            var d = new Date().getTime();
            var id = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                var r = (d + Math.random()*16)%16 | 0;
                d = Math.floor(d/16);
                return (c=='x' ? r : (r&0x7|0x8)).toString(16);
            });
            return 'user-'.concat(id);
        }

        UserSvc.setUser = function (obj) {
            user = obj;
        };

        UserSvc.getUser = function () {
            return user;
        };

        UserSvc.saveUser = function (user) {
            // TODO: post to server
            localStorage.setItem('user', JSON.stringify(user));
        };

        UserSvc.fetchUser = function () {
            // TODO: get from server
            return JSON.parse(localStorage.getItem('user'));
        };

        UserSvc.removeUser = function () {
            // TODO: remove from server
            localStorage.removeItem('user');
        };

        return UserSvc;
    });

    /**
     * @ngdoc service
     * @name fvApp.service:AuthSvc
     * @description
     * # AuthSvc
     * A service to handle email authentication and authorization.
     */
    app.service('AuthSvc', ['$firebaseSimpleLogin', '$linkedIn', '$cookies', 'SessionSvc', 'AUTH_PROVIDER_OPTIONS', 'ENV', function ($firebaseSimpleLogin, $linkedIn, $cookies, SessionSvc, AUTH_PROVIDER_OPTIONS, ENV) {
        var authOptions = AUTH_PROVIDER_OPTIONS,
            environment = ENV;

        this.isAuthenticated = function () {
            return !!SessionSvc.userId;
        };

        this.isAuthorized = function (authorizedRoles) {
            if (!angular.isArray(authorizedRoles)) {
                authorizedRoles = [authorizedRoles];
            }
            return (this.isAuthenticated() &&
                    authorizedRoles.indexOf(SessionSvc.userRole) !== -1);
        };

        this.firebaseAuth =  function () {
            return $firebaseSimpleLogin(new Firebase(environment.firebaseUrl));
        };

        this.loginLi = function () {
            return $linkedIn.authorize();
        };

        this.getLiProfile = function () {
            return $linkedIn.profile('me', authOptions.linkedIn.fields);
        };

        this.getLiCookie = function () {
            return $cookies[['linkedin_oauth_', environment.liApiKey, '_crc'].join('')];
        };

        return this;
    }]);

    /**
     * @ngdoc service
     * @name fvApp.service:ProfileSvc
     * @description
     * # ProfileSvc
     * CRUD operations for Seller profiles
     */
    app.service('ProfileSvc', ['$http', '$q', '$upload', '$timeout', 'EVENTS', function ($http, $q, $upload, $timeout, EVENTS) {
        var ProfileSvc = {},
            providerNames = ['linkedIn', 'oDesk', 'elance', 'peoplePerHour', 'freelancer', 'behance', 'dribbble', 'github'],
            steps = ['import', 'info', 'service_selection', 'offer_config', 'storefront'], // profile completion steps
            activeStep = 'import',
            countriesUrl = '/countries', //TODO: fix this
            countries = [],
            profile = {};

        // Initialize the available countries when the service is first instantiated
        (function initCountries () {
            $http.get(countriesUrl).success(function (res) {
                countries = res;
            }).error(function (error) {
                //TODO: handle errors & defaults
                countries = ['Uk', 'USA', 'Greece'];
                console.log(error);
            });
        }());

        // Provider object constructor
        ProfileSvc.Provider = function (name, url) {
            this.name = name;
            this.url = url;
        };

        // returns a new collection of Provider objects that includes all providerNames with blank urls
        ProfileSvc.initProviders = function () {
            var self = this, providers = {};
            _.forEach(providerNames, function (name) {
                providers[name] = new self.Provider(name, '');
            });
            return providers;
        };

        ProfileSvc.updateProfile = function (obj) {
            angular.extend(profile, obj);
        };

        ////////////////////////////////////////////////////////////
        /// Get methods interact with the service's private objects
        ////////////////////////////////////////////////////////////

        ProfileSvc.getActiveStep = function () {
            return activeStep;
        };

        ProfileSvc.getProfile = function () {
            return profile;
        };

        ProfileSvc.getSteps = function () {
            return steps;
        };

        ProfileSvc.getCountries = function () {
            return countries;
        };

        ////////////////////////////////////////////
        /// Set methods
        ////////////////////////////////////////////

        ProfileSvc.setActiveStep = function (step) {
            activeStep = step;
        };

        ////////////////////////////////////////////
        /// Save methods persist data on the server
        ////////////////////////////////////////////

        ProfileSvc.saveProvider = function (provider) {
            //return $http.post(profileSvcUrl, { profileLink: provider.url });
            // TODO: remove mock functionality
            var deferred = $q.defer();
            $timeout(function () {
                deferred.resolve('provider saved: ' + provider.toString());
            }, 2000);
            return deferred.promise;
        };

        ProfileSvc.saveProfileImage = function (img) {
            console.log(!img);
            // return $upload.upload({ url: profileSvcUrl, file: img });
            // TODO: remove mock functionality
            var deferred = $q.defer();
            $timeout(function () {
                deferred.resolve('profile image saved');
            });
            return deferred.promise;
        };

        ProfileSvc.savePersonalUrl = function (url) {
            console.log(url);
            // return $http.post(profileSvcUrl, { personalUrl: url });
            // TODO: remove mock functionality
            var deferred = $q.defer();
            $timeout(function () {
                deferred.resolve('personal url saved');
            });
            return deferred.promise;
        };

        ProfileSvc.saveProfile = function (info) {
            console.log(info);
            // return $http.post(profileSvcUrl, info);
            // TODO: remove mock functionality
            var deferred = $q.defer();
            $timeout(function () {
                deferred.resolve('profile info saved');
            });
            return deferred.promise;
        };

        ///////////////////////////////////////////////////////////
        /// Fetch methods fetch data from the server
        ///////////////////////////////////////////////////////////

        ProfileSvc.fetchProfile = function (personalUrl) {
            // TODO: remove mock functionality
            // return $http.get('/profile', {userId: userId});
            var deferred = $q.defer();
            $timeout(function () {
                if (personalUrl !== 'http://localhost:9000/#/storefront/666997733407685') {
                    deferred.reject(EVENTS.profile.fetchProfileFailed);
                }
                deferred.resolve({
                    image: 'images/backgrounds/bg3.jpg',
                    firstName: 'Doug',
                    lastName: 'Zagofsky',
                    title: 'Web & Logo Designer',
                    city: 'New York',
                    country: 'USA',
                    personalUrl: 'http://localhost:9000/#/storefront/666997733407685',
                    status: 'ProfileComplete',
                    bio: 'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. '
                });
            });
            return deferred.promise;
        };

        ProfileSvc.fetchPersonalUrlStatus = function (url) {
            // TODO: remove mock code
            var deferred = $q.defer();
            $timeout(function () {
                deferred.resolve(url === 'http://localhost:9000/#/storefront/666997733407685');
            }, 2000);
            return deferred.promise;
        };

        ///////////////////////////////////////////////////////////
        /// Remove methods perform delete operations on the server
        ///////////////////////////////////////////////////////////

        ProfileSvc.removeProvider = function (provider) {
            //return $http.post(profileSvcUrl, { profileLink: '' });

            // TODO: remove mock functionality
            var deferred = $q.defer();
            $timeout(function () {
                deferred.resolve('provider removed: ' + provider.toString());
            }, 2000);
            return deferred.promise;
        };

        return ProfileSvc;
    }]);

    /**
     * @ngdoc service
     * @name fvApp.service: CatalogueSvc
     * @description
     * # CatalogueSvc
     * CRUD operations for Catalogue items (services, categories etc)
     */
    app.service('CatalogueSvc', ['$http', '$q', '$timeout', 'SERVICE_CATALOGUE', function ($http, $q, $timeout, catalogue) {
        var CatalogueSvc = {};

        ////////////////////////////////////////////////////////////
        /// Public variables
        ////////////////////////////////////////////////////////////

        CatalogueSvc.services = _.uniq(_.pluck(catalogue, 'Title'));
        CatalogueSvc.categories = _.uniq(_.pluck(catalogue, 'Category'));

        /*
            Filters the available services by category and returns an array of service titles.
            The pagination array defines the number of services returned in one batch.
            If category == All, return all (unique) services.
        **/
        CatalogueSvc.getServicesInCategory = function (category, paginationIndex) {
            // if category is 'All' do not fitler
            var filteredCatalogue = category === 'All' ? catalogue : _.where(catalogue, { 'Category': category });
            return _.chain(filteredCatalogue).pluck('Title').uniq().slice(0, paginationIndex).valueOf();
        };

        CatalogueSvc.getService = function (serviceName) {
            !serviceName && console.log('no service was selected');
            //             return  $http.get(serviceUrl, {serviceName: serviceName});
            // TODO: remove mock functionality
            var deferred = $q.defer();
            $timeout(function () {
                // TODO: remove mock service object
                deferred.resolve( _.where(catalogue, { 'Title': 'Logo Design' })[0] );
            });
            return deferred.promise;
        };

        return CatalogueSvc;
    }]);

    /**
     * @ngdoc service
     * @name fvApp.service: OfferSvc
     * @description
     * # OfferSvc
     * Bussiness logic for seller Offers
     */
    app.service('OfferSvc', ['$http', '$q', '$timeout', 'Enum', function ($http, $q, $timeout, Enum) {
        var OfferSvc = {},
            offer = {},
            offers = [];

        function generateOfferId () {
            var d = new Date().getTime();
            var id = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                var r = (d + Math.random()*16)%16 | 0;
                d = Math.floor(d/16);
                return (c=='x' ? r : (r&0x7|0x8)).toString(16);
            });
            return id;
        }

        ///////////////////////////////////////////////////////////
        /// Constructors
        ///////////////////////////////////////////////////////////

        OfferSvc.Offer = function () {
            return {
                id: generateOfferId(),
                workSamples: [],
                status: Enum.OfferStatus.DRAFT,
                serviceName: '',
                choices: [],
                lowestPrice: ''
            };
        };

        offer = new OfferSvc.Offer(); // the offer being edited by the user

        ///////////////////////////////////////////////////////////
        /// Public functions
        ///////////////////////////////////////////////////////////

        OfferSvc.setOffer = function (offerObj) {
            offer = offerObj;
        };

        OfferSvc.updateOffer = function (obj) {
            angular.extend(offer, obj);
        };

        /*
            Syntactic sugar. Allows controllers to make use of a clean API without having to worry about
            converting their $scope models to ShowcaseItem format.
        **/
        OfferSvc.addWorkSamples = function (samples) {
            samples && _.each(samples, function (sample) {
                // TODO: convert to ShowcaseItem
                offer.workSmaples.push(sample);
            });
        };

        OfferSvc.addOffer = function (obj) {
            var newOffer = obj || offer; // if no args, user the current offer object
            offers.push(newOffer);
        };

        OfferSvc.removeOffer = function (serviceName) {
            var offeredServiceName = serviceName || offer.serviceName;
            offers.remove(function (offer) {
                return offer.serviceName === offeredServiceName;
            });
        };

        OfferSvc.getOffer = function () {
            return offer;
        };

        ///////////////////////////////////////////////////////////
        /// Fetch functions
        ///////////////////////////////////////////////////////////

        OfferSvc.fetchOffer = function (serviceId, userId) {
            serviceId && console.log(serviceId, userId);
//            var sid = serviceId || offer.serviceId; //if no serviceId is passed, use the one in the offer obj
//            return $http.get('/offer', { serviceId: sid });
            var deferred = $q.defer();
            $timeout(function () {
                // TODO: remove mock service object
                deferred.resolve(offer);
            });
            return deferred.promise;
        };

        OfferSvc.fetchOffers = function () {
            // TODO: remove mock service object
            var offerCount = _.random(3, 20);
            var newOffer = {};

            for (var i = 0; i < offerCount; i++) {
                newOffer = new OfferSvc.Offer();
                angular.extend(newOffer, {
                    serviceName: 'Logo Design',
                    lowestPrice: '$100'
                });
                offers.push(newOffer);
            }

            var deferred = $q.defer();
            $timeout(function () {
                deferred.resolve(offers);
            });
            return deferred.promise;
        };

        return OfferSvc;
    }]);

    /**
     * @ngdoc service
     * @name fvApp.service: PortfolioSvc
     * @description
     * # PortfolioSvc
     * Manage Portfolio items
     */
    app.service('PortfolioSvc', ['$http', '$q', '$timeout', function ($http, $q, $timeout) {
        var PortfolioSvc = {},
            portfolio = {};

        PortfolioSvc.updatePortfolio = function (obj) {
            angular.extend(portfolio, obj);
        };

        PortfolioSvc.getPortfolio = function () {
            return portfolio;
        };

        PortfolioSvc.fetchPortfolio = function (userId, index, offset) {
            console.log(userId, index, offset);

            // TODO: remove mock service object
            var PortfolioItem = function () {
                return {
                  title: 'Logo Design',
                  url: 'http://www.accusoft.com/html5viewer/img/btn-file-icon-ppt-sm.png',
                  name: 'btn-file-icon-ppt-sm.png'
                };
            };

            var itemCount = _.random(3, 20);
            var portfolioItems = [];

            for (var i = 0; i < itemCount; i++) {
                portfolioItems.push(new PortfolioItem());
            }

            var deferred = $q.defer();
            $timeout(function () {
                deferred.resolve({
                    items: portfolioItems
                });
            });
            return deferred.promise;
        };

        return PortfolioSvc;
    }]);

    /**
     * @ngdoc service
     * @name fvApp.service: ReviewSvc
     * @description
     * # ReviewSvc
     * Manage Reviews
     */
    app.service('ReviewSvc', ['$http', '$q', '$timeout', 'Enum', function ($http, $q, $timeout, Enum) {
        var ReviewSvc = {};

        ReviewSvc.fetchReceivedReviews = function (userId, index, offset) {
            console.log(userId, index, offset);

            // TODO: remove mock service object
            var providers = _.values(Enum.Providers);
            var randProvider = _.random(0, providers.length);

            var Review = function () {
                return {
                    reviewer: {
                        firstName: 'Mark',
                        lastName: 'Twain'
                    },
                    provider: providers[randProvider],
                    rating: _.random(1, 5),
                    timeAgo: '3 days ago',
                    text: 'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. '
                };
            };
            var itemCount = _.random(3, 20);
            var reviews = [];

            for (var i = 0; i < itemCount; i++) {
                reviews.push(new Review());
            }

            var deferred = $q.defer();
            $timeout(function () {
                deferred.resolve(reviews);
            });
            return deferred.promise;

        };

        return ReviewSvc;
    }]);

    /**
     * @ngdoc service
     * @name fvApp.service: MessagingSvc
     * @description
     * # MessagingSvc
     * Handle sending messages and email to users
     */
    app.service('MessagingSvc', ['$http', '$q', '$timeout', function ($http, $q, $timeout) {
        var MessagingSvc = {};

        MessagingSvc.sendMessage = function (receiverId, senderId, senderFirstName, senderLastName, message) {
            // TODO: remove mock functionality
            console.log(message);
            var deferred = $q.defer();
            $timeout(function () {
                deferred.resolve(message);
            });
            return deferred.promise;
        };

        return MessagingSvc;
    }]);

    /**
     * @ngdoc service
     * @name fvApp.service: NotificationSvc
     * @description
     * # NotificationSvc
     * Display alerts, system messages, notifications
     */
    app.service('NotificationSvc', ['$http', '$q', '$alert', function ($http, $q, $alert) {
        var NotificationSvc = {};

        NotificationSvc.show = function (options) {
            var alert = $alert(options);
            var deferred = $q.defer();
            deferred.resolve(alert);
            return deferred.promise;
        };

        return NotificationSvc;
    }]);

    /**
     * @ngdoc service
     * @name fvApp.service: EmbedlySvc
     * @description
     * # EmbedlySvc
     * Integration with EmbedLy API
     */
    app.service('EmbedlySvc', ['$http', 'EMBEDLY', function ($http, embedly) {
        this.oembed = function (links, maxWidth, maxHeight) {
            return $http.get([
                embedly.domain, embedly.oembedAPI,
                '?key=', embedly.key,
                '&urls=', _.pluck(links, 'url').map(encodeURI).join(','),
                '&maxwidth=', maxWidth,
                '&maxheight=', maxHeight,
                '&format=json'
            ].join(''));
        };
    }]);

}());
