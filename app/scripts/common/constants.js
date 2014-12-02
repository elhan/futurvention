(function () {
    'use strict';

    var app = angular.module('fvApp');

    /**
     * @ngdoc object
     * @name fvApp.constant:EVENTS
     * @description
     * # EVENTS
     * All the supported $rootScope events.
     */
    app.constant('EVENTS', {
        profile: {
            fetchProfileFailed: 'fetch-profile-failed',
            profileUpdated: 'profile-updated'
        },
        user: {
            createSuccess: 'user-creation-success',
            createFailed: 'user-creation-failed',
            updateSuccess: 'user-update-success',
            updateFailed: 'user-update-failed',
        },
        auth: {
            registrationSuccess: 'auth-registration-success',
            registrationFailed: 'auth-registration-failed',
            loginSuccess: 'auth-login-success',
            loginFailed: 'auth-login-failed',
            logoutSuccess: 'auth-logout-success',
            sessionTimeout: 'auth-session-timeout',
            notAuthenticated: 'auth-not-authenticated',
            notAuthorized: 'auth-not-authorized'
        },
        importer: {
            profileReady: 'imp-profile-ready',
            portfoliosReady: 'imp-portfolios-ready',
            reviewsReady: 'imp-reviews-ready',
            status: 'imp-status'
        },
        ui: {
            providerSelected: 'ui-provider-selected'
        }
    });

    /**
     * @ngdoc object
     * @name fvApp.constant:USER_ROLES
     * @description
     * # USER_ROLES
     * All the suported user roles
     */
    app.constant('USER_ROLES', {
        all: '*',
        admin: 'admin',
        user: 'user',
        guest: 'guest'
    });

    /**
     * @ngdoc Object
     * @name fvApp.constant:PATHS
     * @description
     * # PATHS
     * Rest paths
     */
    app.constant('PATHS', {
        root: 'https://futurvention.azurewebsites.net',
        public: 'https://futurvention.azurewebsites.net/public.svc/',
        cached: 'https://futurvention.azurewebsites.net/CachedPublic.svc/',
        account: {
            register: 'https://futurvention.azurewebsites.net/api/Account/Register',
            login: 'https://futurvention.azurewebsites.net/api/Account/Login',
            logout: 'https://futurvention.azurewebsites.net/api/Account/Logout',
            userInfo: 'https://futurvention.azurewebsites.net/api/Account/UserInfo',
            resetPassword: 'https://futurvention.azurewebsites.net/api/Account/ChangePassword',
            externalLogins: 'https://futurvention.azurewebsites.net/api/Account/ExternalLogins?returnUrl=http://client.futurvention.com:9000&generateState=true'
        },
        importer: {
            importedData: 'https://extservicesdata.blob.core.windows.net:443/crawleddata/',
            import: 'https://futurvention.azurewebsites.net/api/ExtService/import',
            checkProgress: 'https://futurvention.azurewebsites.net/api/ExtService/checkprogress',
            fetchProfile: 'https://futurvention.azurewebsites.net/api/ExtService/getprofiles',
            fetchPortfolios: 'https://futurvention.azurewebsites.net/api/ExtService/getportfolios',
        },
        sellerManagement: {
            profile: 'https://futurvention.azurewebsites.net/api/SellerManagement/Profiles/',
            ownProfile: 'https://futurvention.azurewebsites.net/api/SellerManagement/Profiles/OwnProfile',
            profileStatus: 'https://futurvention.azurewebsites.net/api/SellerManagement/Profiles/OwnProfile/Status',
            importedShowcases: 'https://futurvention.azurewebsites.net/api/SellerManagement/Profiles/OwnProfile/ImportedShowcases?serviceID=',
            showcases: 'https://futurvention.azurewebsites.net/api/SellerManagement/SellerProfiles/OwnProfile/SingleItemShowcases?serviceID=',
            reviews: 'https://futurvention.azurewebsites.net/api/SellerManagement/Profiles/OwnProfile/reviews',
            monikerExists: function (moniker) {
                return [
                    'https://futurvention.azurewebsites.net/api/SellerManagement/Profiles/',
                    moniker,
                    '/exists'
                ].join('');
            }
        },
        user: {
            self: 'https://futurvention.azurewebsites.net/api/Self?expand=Avatar',
            ownAvatar: 'https://futurvention.azurewebsites.net/api/Self/Avatar'
        },
        file: {
            hosted: 'https://ergmaimages.blob.core.windows.net/userdata/',
            imported: 'https://extservicesdata.blob.core.windows.net:443/crawleddata/'
        },
        offerManagement: {
            ownOffers: 'https://futurvention.azurewebsites.net/api/OffersManagement/OwnOffers'
        }
    });

    app.constant('ROUTES', {
        public: ['/', '/login', '/register']
    });

    app.constant('EMBEDLY', {
        key: '05b548d0a515404f8f3da52d93eb402f',
        domain: 'http://api.embed.ly/1/',
        oembedAPI: 'oembed'
    });

    app.constant('MESSAGES', {
        error: {
            generic: 'Something went wrong. Please try again later.',
            logoutFailed: 'Something went wrong. Please try logging out again.',
            profileImportFailed: 'No profiles could be imported',
            profileSaveFailed: 'Something went wrong! Please try saving your profiles again.'
        },
        success: {
            createNewPassword: 'We sent you an email. Follow the instructions to create a new password.',
            resetPassword: 'Your password has been reset!',
            profileImported: 'Your profile has been imported from '
        }
    });

    // thirdparty profile & portfolio providers
    app.constant('IMPORT_PROVIDERS', ['linkedin', 'odesk', 'elance', 'pph', 'freelancer', 'behance', 'dribbble', 'github']);

    // Used to determine imported file paths
    app.constant('PROVIDERS_ENUM', {
        behance: 1,
        dribbble: 2,
        elance: 3,
        freelancer: 4,
        github: 5,
        odesk: 6,
        peopleperhour: 7
    });

}());
