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

        this.setUser = function (user) {
            // TODO: post to server
            localStorage.setItem('user', JSON.stringify(user));
        };

        this.getUser = function () {
            // TODO: get from server
            return JSON.parse(localStorage.getItem('user'));
        };

        this.removeUser = function () {
            // TODO: remove from server
            localStorage.removeItem('user');
        };

        return this;
    });

    /**
     * @ngdoc service
     * @name fvApp.service:AuthSvc
     * @description
     * # AuthSvc
     * A service to handle email authentication and authorization.
     */
    app.service('AuthSvc', ['$firebaseSimpleLogin', '$linkedIn', '$cookies', 'SessionSvc', 'AUTH_PROVIDER_OPTIONS', 'ENV',
                            function ($firebaseSimpleLogin, $linkedIn, $cookies, SessionSvc, AUTH_PROVIDER_OPTIONS, ENV) {
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
    app.service('ProfileSvc', ['$http', '$q', '$upload', '$timeout', function ($http, $q, $upload, $timeout) {
        var providerNames = ['linkedIn', 'oDesk', 'elance', 'peoplePerHour', 'freelancer', 'behance', 'dribbble', 'github'],
            steps = ['import', 'info', 'service_selection', 'service_config'], // profile completion steps
//            profileSvcUrl = '/profile',
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
        this.Provider = function (name, url) {
            this.name = name;
            this.url = url;
        };

        // returns a new collection of Provider objects that includes all providerNames with blank urls
        this.initProviders = function () {
            var self = this, providers = {};
            _.forEach(providerNames, function (name) {
                providers[name] = new self.Provider(name, '');
            });
            return providers;
        };

        ////////////////////////////////////////////////////////////
        /// Get methods interact with the service's private objects
        ////////////////////////////////////////////////////////////

        this.getProfile = function () {
            return profile;
        };

        this.getSteps = function () {
            return steps;
        };

        this.getCountries = function () {
            return countries;
        };

        this.updateProfile = function (obj) {
            angular.extend(profile, obj);
        };

        ////////////////////////////////////////////
        /// Save methods persist data on the server
        ////////////////////////////////////////////

        this.saveProvider = function (provider) {
            //return $http.post(profileSvcUrl, { profileLink: provider.url });
            // TODO: remove mock functionality
            var deferred = $q.defer();
            $timeout(function () {
                deferred.resolve('provider saved: ' + provider.toString());
            }, 2000);
            return deferred.promise;
        };

        this.saveProfileImage = function (img) {
            !img && console.log('no img');
            // return $upload.upload({ url: profileSvcUrl, file: img });
            // TODO: remove mock functionality
            var deferred = $q.defer();
            $timeout(function () {
                deferred.resolve('profile image saved');
            });
            return deferred.promise;
        };

        this.savePersonalUrl = function (url) {
            !url && console.log('no url');
            // return $http.post(profileSvcUrl, { personalUrl: url });
            // TODO: remove mock functionality
            var deferred = $q.defer();
            $timeout(function () {
                deferred.resolve('personal url saved');
            });
            return deferred.promise;
        };

        this.saveProfile = function (info) {
            !info && console.log('no info');
            // return $http.post(profileSvcUrl, info);
            // TODO: remove mock functionality
            var deferred = $q.defer();
            $timeout(function () {
                deferred.resolve('profile info saved');
            });
            return deferred.promise;
        };

        ///////////////////////////////////////////////////////////
        /// Remove methods perform delete operations on the server
        ///////////////////////////////////////////////////////////

        this.removeProvider = function (provider) {
            //return $http.post(profileSvcUrl, { profileLink: '' });

            // TODO: remove mock functionality
            var deferred = $q.defer();
            $timeout(function () {
                deferred.resolve('provider removed: ' + provider.toString());
            }, 2000);
            return deferred.promise;
        };

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
        CatalogueSvc.selectedServices = [];
        CatalogueSvc.categories = _.uniq(_.pluck(catalogue, 'Category'));

        ////////////////////////////////////////////////////////////
        /// Public functions
        ////////////////////////////////////////////////////////////

        CatalogueSvc.selectService = function (service) {
            CatalogueSvc.selectedServices.push(service);
        };

        CatalogueSvc.removeSelected = function (service) {
            _.remove(CatalogueSvc.selectedServices, function (selectedService) {
                return selectedService === service;
            });
        };

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
    app.service('OfferSvc', ['$http', '$q', '$timeout', 'Enum', 'ShowcaseSvc', function ($http, $q, $timeout, Enum, ShowcaseSvc) {
        var OfferSvc = {},
            offer = {};

        ///////////////////////////////////////////////////////////
        /// Constructors
        ///////////////////////////////////////////////////////////

        OfferSvc.Offer = function () {
            return Object.seal({
                workSamples: [],
                status: Enum.OfferStatus.DRAFT,
                serviceName: '',
                choices: []
            });
        };

        offer = new OfferSvc.Offer(); // the offer being edited by the user

        ////////////////////////////////////////////////////////////
        /// Setters for the service's private objects
        ////////////////////////////////////////////////////////////

        OfferSvc.setOffer = function (offerObj) {
            // ensure object validity
            if (! (offerObj instanceof OfferSvc.Offer) ) {
                return;
            }
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

        ///////////////////////////////////////////////////////////
        /// Getters for service's private objects
        ///////////////////////////////////////////////////////////

        OfferSvc.getOffer = function () {
            return offer;
        };

        ///////////////////////////////////////////////////////////
        /// Fetch methods
        ///////////////////////////////////////////////////////////

        OfferSvc.fetch = function (serviceId, userId) {
//            return $http.get('/offer', { serviceId: serviceId, userId: userId });
            var deferred = $q.defer();
            $timeout(function () {
                // TODO: remove mock service object
                deferred.resolve(offer);
            });
            return deferred.promise;
        };

        return OfferSvc;
    }]);

    /**
     * @ngdoc service
     * @name fvApp.service: EmbedlySvc
     * @description
     * # EmbedlySvc
     * Integration with EmbedLy API
     */
    app.service('ShowcaseSvc', ['Enum', function (Enum) {
        var ShowcaseSvc = {};

        ///////////////////////////////////////////////////////////
        /// Constructors
        ///////////////////////////////////////////////////////////

        ShowcaseSvc.ShowcaseFile = function (obj) {
            if (obj && obj.hasOwnProperty('type') && !_.contains(_.values(Enum.ShowcaseFileType), obj.type)) {
                throw new TypeError([obj.type, ' is invalid type value'].join(''));
            }
            return Object.seal({
                type: obj.type || Enum.ShowcaseFileType.LINKED,
                embedCode: obj.embedCode || '',
                url: obj.url || '',
                provider: obj.provider || '',
                relativeUrl: obj.relativeUrl || '',
                size: obj.size || 0
            });
        };

        ShowcaseSvc.ShowcaseItem = function (obj) {
            if (obj && obj.hasOwnProperty('type') && !_.contains(_.values(Enum.ShowcaseFileType), obj.type)) {
                throw new TypeError([obj.type, ' is invalid type value'].join(''));
            }
            return Object.seal({
                title: obj.title || '',
                description: obj.description || '',
                file: obj.file || {}
            });
        };

        return ShowcaseSvc;
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
