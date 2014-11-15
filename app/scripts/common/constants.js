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
            profileImageUpdated: 'profile-image-updated'
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
            portfolioReady: 'imp-portfolio-ready',
            reviewsReady: 'imp-reviews-ready'
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
            import: 'https://futurvention.azurewebsites.net/api/ExtService/import',
            checkProgress: 'https://futurvention.azurewebsites.net/api/ExtService/checkprogress',
            fetchProfile: 'https://futurvention.azurewebsites.net/api/ExtService/getprofiles',
            fetchPortfolio: 'https://futurvention.azurewebsites.net/api/ExtService/getportfolios',
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
        },
        success: {
            createNewPassword: 'We sent you an email. Follow the instructions to create a new password.',
            resetPassword: 'Your password has been reset!'
        }
    });

    // thirdparty profile & portfolio providers
    app.constant('IMPORT_PROVIDERS', ['linkedin', 'odesk', 'elance', 'pph', 'freelancer', 'behance', 'dribbble', 'github']);

}());
