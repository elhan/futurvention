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
            fetchProfileSuccess: 'fetch-profile-success',
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
            portfoliosReady: 'imp-portfolios-ready',
            reviewsReady: 'imp-reviews-ready',
            polling: {
                start: 'imp-polling-start',
                profileImported: 'imp-profile-imported',
                statusUpdated: 'imp-status-updated',
                end: 'imp-polling-end',
                timeout: 'imp-polling-timeout'
            }
        },
        ui: {
            providerSelected: 'ui-provider-selected',
            cameraReady: 'ui-camera-ready',
            loaderClosed: 'ui-loader-closed',
            alertClosed: 'ui-alert-closed'
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
        public: '/public.svc/',
        cached: '/CachedPublic.svc/',
        account: {
            register: '/api/Account/Register',
            login: '/api/Account/Login',
            logout: '/api/Account/Logout',
            userInfo: '/api/Account/UserInfo',
            resetPassword: '/api/Account/ChangePassword'
        },
        importer: {
            importedData: 'https://extservicesdata.blob.core.windows.net/crawleddata/',
            import: '/api/ExtService/import',
            checkProgress: '/api/ExtService/checkprogress',
            fetchProfile: '/api/ExtService/getprofiles',
            fetchPortfolios: '/api/ExtService/getportfolios',
        },
        sellerManagement: {
            profile: '/api/SellerManagement/Profiles/',
            ownProfile: '/api/SellerManagement/Profiles/OwnProfile',
            ownShowcase: '/api/SellerManagement/Profiles/OwnProfile/Showcases',
            profileStatus: '/api/SellerManagement/Profiles/OwnProfile/Status',
            importedShowcases: '/api/SellerManagement/Profiles/OwnProfile/ImportedShowcases?serviceID=',
            showcases: '/api/SellerManagement/SellerProfiles/OwnProfile/SingleItemShowcases?serviceID=',
            ownReviews: '/api/SellerManagement/Profiles/OwnProfile/reviews',
            statistics: '/api/SellerManagement/Profiles/OwnProfile/statistics',
            monikerExists: function (moniker) {
                return [
                    '/api/SellerManagement/Profiles/',
                    moniker,
                    '/exists'
                ].join('');
            }
        },
        user: {
            self: '/api/Self?expand=Avatar',
            ownAvatar: '/api/Self/Avatar'
        },
        offerManagement: {
            ownOffers: '/api/OffersManagement/OwnOffers',
            offeredServices: '/api/OffersManagement/OwnOffers?expand=Service/ShortTitle/Literals,Service/ThumbnailFile'
        }
    });

    app.constant('ROUTES', {
        public: ['/', '/login', '/register', '/forgotPassword', '/resetPassword']
    });

    app.constant('MESSAGES', {
        error: {
            generic: 'An error has occured. Please try again later.',
            logoutFailed: 'Something went wrong. Please try logging out again.',
            profileImportFailed: 'No profiles could be imported',
            portfoliosImportFailed: 'No portfolios could be imported at this time.',
            profileSaveFailed: 'Something went wrong! Please try saving your profiles again.',
            wrongCredentials: 'Wrong email or password',
            wrongEmailFormat: 'The email you entered is incorrect.',
            wrongPassword: 'The password you entered is incorrect.',
            emailTaken: 'The email you entered is already taken',
            importProfileTimeout: 'There was a problem importing your profile information. You can still create your profile manually.',
            saveAvatarFailed: 'There was a problem importing your avatar. You can still upload one manually.',
            invalidFileType: 'Invalid file type.',
            createProfileFailed: 'There was a problem creating your profile. Please try again.',
            updateProfileFailed: 'There was a problem updating your profile. Please try again.'
        },
        success: {
            createNewPassword: 'We sent you an email. Follow the instructions to create a new password.',
            resetPassword: 'Your password has been reset!',
            profileImported: 'Your profile has been imported from ',
            showcaseDeleteSuccess: 'Successfully deleted '
        },
        warning: {
            tooLong: 'This is taking longer than expected...'
        }
    });

    // thirdparty profile & portfolio providers
    app.constant('IMPORT_PROVIDERS', ['linkedin', 'odesk', 'elance', 'pph', 'behance', 'dribbble', 'github']);

    // Used to determine imported file paths
    app.constant('PROVIDERS_ENUM', {
        behance: 1,
        dribbble: 2,
        elance: 3,
//        freelancer: 4,
        github: 5,
        odesk: 6,
        peopleperhour: 7
    });

    app.constant('SELLER_PROFILE_STATUS_ENUM', {
        new: 0,
        importing: 1,
        settingProfileFields: 2,
        creatingOffers: 3,
        ready: 4,
        inactive: 5
    });

    app.constant('FILE_TYPE_CONFIG', [
        {
            'ID': 1,
            'ContentCode': 'image/x-jg',
            'Viewer': 'Prizma',
            'Thumbnail': 'General'
        },
        {
            'ID': 2,
            'ContentCode': 'video/avs-video',
            'Viewer': 'Html5 video',
            'Thumbnail': 'General'
        },
        {
            'ID': 3,
            'ContentCode': 'image/bmp',
            'Viewer': 'Html5 image',
            'Thumbnail': 'General'
        },
        {
            'ID': 4,
            'ContentCode': 'text/csv',
            'Viewer': 'Prizma',
            'Thumbnail': 'Excel'
        },
        {
            'ID': 5,
            'ContentCode': 'application/x-director',
            'Viewer': 'Prizma',
            'Thumbnail': 'General'
        },
        {
            'ID': 6,
            'ContentCode': 'video/x-dv',
            'Viewer': 'Html5 video',
            'Thumbnail': 'General'
        },
        {
            'ID': 7,
            'ContentCode': 'application/msword',
            'Viewer': 'Prizma',
            'Thumbnail': 'Word'
        },
        {
            'ID': 8,
            'ContentCode': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'Viewer': 'Prizma',
            'Thumbnail': 'Word'
        },
        {
            'ID': 9,
            'ContentCode': 'image/vnd.dwg',
            'Viewer': 'Prizma',
            'Thumbnail': 'General'
        },
        {
            'ID': 10,
            'ContentCode': 'image/vnd.dxf',
            'Viewer': 'Prizma',
            'Thumbnail': 'General'
        },
        {
            'ID': 11,
            'ContentCode': 'message/rfc822',
            'Viewer': 'Prizma',
            'Thumbnail': 'General'
        },
        {
            'ID': 12,
            'ContentCode': 'application/postscript',
            'Viewer': 'Prizma',
            'Thumbnail': 'General'
        },
        {
            'ID': 13,
            'ContentCode': 'video/x-atomic3d-feature',
            'Viewer': 'Html5 video',
            'Thumbnail': 'General'
        },
        {
            'ID': 14,
            'ContentCode': 'image/g3fax',
            'Viewer': 'Prizma',
            'Thumbnail': 'General'
        },
        {
            'ID': 15,
            'ContentCode': 'image/gif',
            'Viewer': 'Html5 image',
            'Thumbnail': 'General'
        },
        {
            'ID': 16,
            'ContentCode': 'text/html',
            'Viewer': 'Prizma',
            'Thumbnail': 'General'
        },
        {
            'ID': 17,
            'ContentCode': 'image/x-icon',
            'Viewer': 'Prizma',
            'Thumbnail': 'General'
        },
        {
            'ID': 18,
            'ContentCode': 'image/jpeg',
            'Viewer': 'Html5 image',
            'Thumbnail': 'General'
        },
        {
            'ID': 19,
            'ContentCode': 'image/vnd.fujixerox.edmics-mmr',
            'Viewer': 'Prizma',
            'Thumbnail': 'General'
        },
        {
            'ID': 20,
            'ContentCode': 'audio/mpeg3',
            'Viewer': 'Html5 audio',
            'Thumbnail': 'General'
        },
        {
            'ID': 21,
            'ContentCode': 'application/mp4',
            'Viewer': 'Html5 video',
            'Thumbnail': 'General'
        },
        {
            'ID': 22,
            'ContentCode': 'application/vnd.mophun.certificate',
            'Viewer': 'Prizma',
            'Thumbnail': 'General'
        },
        {
            'ID': 23,
            'ContentCode': 'application/vnd.mobius.msl',
            'Viewer': 'Prizma',
            'Thumbnail': 'General'
        },
        {
            'ID': 24,
            'ContentCode': 'application/vnd.oasis.opendocument.graphics',
            'Viewer': 'Prizma',
            'Thumbnail': 'General'
        },
        {
            'ID': 25,
            'ContentCode': 'application/vnd.oasis.opendocument.presentation',
            'Viewer': 'Prizma',
            'Thumbnail': 'General'
        },
        {
            'ID': 26,
            'ContentCode': 'application/vnd.oasis.opendocument.spreadsheet',
            'Viewer': 'Prizma',
            'Thumbnail': 'Excel'
        },
        {
            'ID': 27,
            'ContentCode': 'application/vnd.oasis.opendocument.text',
            'Viewer': 'Prizma',
            'Thumbnail': 'Txt'
        },
        {
            'ID': 28,
            'ContentCode': 'application/vnd.oasis.opendocument.graphics-template',
            'Viewer': 'Prizma',
            'Thumbnail': 'General'
        },
        {
            'ID': 29,
            'ContentCode': 'application/vnd.oasis.opendocument.text-template',
            'Viewer': 'Prizma',
            'Thumbnail': 'General'
        },
        {
            'ID': 30,
            'ContentCode': 'image/x-pict',
            'Viewer': 'Prizma',
            'Thumbnail': 'General'
        },
        {
            'ID': 31,
            'ContentCode': 'image/x-pcx',
            'Viewer': 'Prizma',
            'Thumbnail': 'General'
        },
        {
            'ID': 32,
            'ContentCode': 'application/vnd.palm',
            'Viewer': 'Prizma',
            'Thumbnail': 'General'
        },
        {
            'ID': 33,
            'ContentCode': 'application/pdf',
            'Viewer': 'Prizma',
            'Thumbnail': 'PDF'
        },
        {
            'ID': 34,
            'ContentCode': 'application/x-font-type1',
            'Viewer': 'Prizma',
            'Thumbnail': 'General'
        },
        {
            'ID': 35,
            'ContentCode': 'image/x-portable-graymap',
            'Viewer': 'Prizma',
            'Thumbnail': 'General'
        },
        {
            'ID': 36,
            'ContentCode': 'image/pict',
            'Viewer': 'Prizma',
            'Thumbnail': 'General'
        },
        {
            'ID': 37,
            'ContentCode': 'image/png',
            'Viewer': 'Html5 image',
            'Thumbnail': 'General'
        },
        {
            'ID': 38,
            'ContentCode': 'image/x-portable-anymap',
            'Viewer': 'Prizma',
            'Thumbnail': 'General'
        },
        {
            'ID': 39,
            'ContentCode': 'image/x-portable-pixmap',
            'Viewer': 'Prizma',
            'Thumbnail': 'General'
        },
        {
            'ID': 40,
            'ContentCode': 'application/vnd.ms-powerpoint',
            'Viewer': 'Prizma',
            'Thumbnail': 'PowerPoint'
        },
        {
            'ID': 41,
            'ContentCode': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            'Viewer': 'Prizma',
            'Thumbnail': 'General'
        },
        {
            'ID': 42,
            'ContentCode': 'image/vnd.adobe.photoshop',
            'Viewer': 'Prizma',
            'Thumbnail': 'General'
        },
        {
            'ID': 43,
            'ContentCode': 'image/x-cmu-raster',
            'Viewer': 'Prizma',
            'Thumbnail': 'General'
        },
        {
            'ID': 44,
            'ContentCode': 'image/x-rgb',
            'Viewer': 'Prizma',
            'Thumbnail': 'General'
        },
        {
            'ID': 45,
            'ContentCode': 'application/rtf',
            'Viewer': 'Prizma',
            'Thumbnail': 'Txt'
        },
        {
            'ID': 46,
            'ContentCode': 'application/vnd.stardivision.draw',
            'Viewer': 'Prizma',
            'Thumbnail': 'General'
        },
        {
            'ID': 47,
            'ContentCode': 'application/vnd.stardivision.calc',
            'Viewer': 'Prizma',
            'Thumbnail': 'Excel'
        },
        {
            'ID': 48,
            'ContentCode': 'application/vnd.stardivision.impress',
            'Viewer': 'Prizma',
            'Thumbnail': 'General'
        },
        {
            'ID': 49,
            'ContentCode': 'application/vnd.stardivision.writer',
            'Viewer': 'Prizma',
            'Thumbnail': 'General'
        },
        {
            'ID': 50,
            'ContentCode': 'application/vnd.sun.xml.calc.template',
            'Viewer': 'Prizma',
            'Thumbnail': 'Excel'
        },
        {
            'ID': 51,
            'ContentCode': 'application/vnd.sun.xml.draw.template',
            'Viewer': 'Prizma',
            'Thumbnail': 'General'
        },
        {
            'ID': 52,
            'ContentCode': 'application/vnd.sun.xml.impress.template',
            'Viewer': 'Prizma',
            'Thumbnail': 'General'
        },
        {
            'ID': 53,
            'ContentCode': 'application/step',
            'Viewer': 'Prizma',
            'Thumbnail': 'General'
        },
        {
            'ID': 54,
            'ContentCode': 'application/vnd.sun.xml.writer.template',
            'Viewer': 'Prizma',
            'Thumbnail': 'General'
        },
        {
            'ID': 55,
            'ContentCode': 'image/svg+xml',
            'Viewer': 'Prizma',
            'Thumbnail': 'General'
        },
        {
            'ID': 56,
            'ContentCode': 'application/x-shockwave-flash',
            'Viewer': 'Html5 video',
            'Thumbnail': 'General'
        },
        {
            'ID': 57,
            'ContentCode': 'application/vnd.sun.xml.calc',
            'Viewer': 'Prizma',
            'Thumbnail': 'Excel'
        },
        {
            'ID': 58,
            'ContentCode': 'application/vnd.sun.xml.draw',
            'Viewer': 'Prizma',
            'Thumbnail': 'General'
        },
        {
            'ID': 59,
            'ContentCode': 'application/vnd.sun.xml.impress',
            'Viewer': 'Prizma',
            'Thumbnail': 'General'
        },
        {
            'ID': 60,
            'ContentCode': 'application/vnd.sun.xml.writer',
            'Viewer': 'Prizma',
            'Thumbnail': 'General'
        },
        {
            'ID': 61,
            'ContentCode': 'image/tiff',
            'Viewer': 'Prizma',
            'Thumbnail': 'General'
        },
        {
            'ID': 62,
            'ContentCode': 'application/x-font-ttf',
            'Viewer': 'Prizma',
            'Thumbnail': 'General'
        },
        {
            'ID': 63,
            'ContentCode': 'text/plain',
            'Viewer': 'Prizma',
            'Thumbnail': 'Txt'
        },
        {
            'ID': 64,
            'ContentCode': 'text/x-uil',
            'Viewer': 'Prizma',
            'Thumbnail': 'General'
        },
        {
            'ID': 65,
            'ContentCode': 'image/vnd.wap.wbmp',
            'Viewer': 'Prizma',
            'Thumbnail': 'General'
        },
        {
            'ID': 66,
            'ContentCode': 'application/x-msmetafile',
            'Viewer': 'Prizma',
            'Thumbnail': 'General'
        },
        {
            'ID': 67,
            'ContentCode': 'image/x-xbitmap',
            'Viewer': 'Prizma',
            'Thumbnail': 'General'
        },
        {
            'ID': 68,
            'ContentCode': 'application/xhtml+xml',
            'Viewer': 'Prizma',
            'Thumbnail': 'General'
        },
        {
            'ID': 69,
            'ContentCode': 'application/vnd.ms-excel',
            'Viewer': 'Prizma',
            'Thumbnail': 'Excel'
        },
        {
            'ID': 70,
            'ContentCode': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Viewer': 'Prizma',
            'Thumbnail': 'Excel'
        },
        {
            'ID': 71,
            'ContentCode': 'application/excel',
            'Viewer': 'Prizma',
            'Thumbnail': 'Excel'
        },
        {
            'ID': 72,
            'ContentCode': 'application/xml',
            'Viewer': 'Prizma',
            'Thumbnail': 'General'
        },
        {
            'ID': 73,
            'ContentCode': 'image/x-xpixmap',
            'Viewer': 'Prizma',
            'Thumbnail': 'General'
        },
        {
            'ID': 74,
            'ContentCode': 'image/x-xwindowdump',
            'Viewer': 'Prizma',
            'Thumbnail': 'General'
        },
        {
            'ID': 75,
            'ContentCode': 'application/prezi',
            'Viewer': 'Prizma',
            'Thumbnail': 'General'
        }
    ]);

}());
