(function () {
    'use strict';
    var app = angular.module('fvApp');

    /**
     * @ngdoc service
     * @name fvApp.service: OfferSvc
     * @description
     * # OfferSvc
     * Bussiness logic for seller Offers
     */
    app.service('UserSvc', ['$http', '$q', function ($http, $q) {
        var UserSvc = {};

        ///////////////////////////////////////////////////////////
        /// Constructors
        ///////////////////////////////////////////////////////////

        UserSvc.User = function (options) {
            return {
                Avatar: options && options.avatar || '',
                AvatarID: options && options.avatarID || '',
                FirstName: options && options.firstName || '',
                LastName: options && options.firstName || '',
                Guid: options && options.guid || '',
                ID: options && options.userID || '',
                IsAnonymous: options && options.isAnonymous || false,
                IsSystem: options && options.isSystem || false,
                OwnedFiles: options && options.ownedFiles || [],
                PreferredLanguage: options && options.preferredLanguage || {},
                PreferredLanguageID: options && options.preferredLanguageID || 1,
                RegistrationStatus: options && options.registrationStatus || 'Verified', // TODO: change to 'PendingVerification'
                Registrations: options && options.registrations || [],
                Roles: options && options.roles || [],
                SellerProfile: options && options.SellerProfile || null,
                SellerProfileID: options && options.sellerProfileID || null
            };
        };

        return UserSvc;
    }]);
}());
