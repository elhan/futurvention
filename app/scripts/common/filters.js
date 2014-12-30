(function () {
    'use strict';
    var app = angular.module('fvApp');

    app.filter('trusted', ['$sce', function ($sce) {
        return function (url) {
            return $sce.trustAsResourceUrl(url);
        };
    }]);

    app.filter('prizmUrl', function () {
        return function (url) {
            return [
                'http://connect.ajaxdocumentviewer.com/?key=K4102014161530&viewertype=html5&document=',
                url,
                '&viewerheight=100%&viewerwidth=100%&printButton=Yes&toolbarColor=CCCCCC'
            ].join('');
        };
    });

    app.filter('initial', function () {
        return function (str) {
            return str.charAt(0).concat('.');
        };
    });

    app.filter('getProviderName', [ 'PROVIDERS_ENUM', function (providers) {
        return function (importer) {
            return _.findKey(providers, function (provider) {
                return parseInt(importer.Provider) === provider;
            });
        };
    }]);

    app.filter('beautifyProviderNames', function () {
        return function (providerName) {
            switch (providerName) {
            case 'elance':
                return 'Elance';
            case 'behance':
                return 'Behance';
            case 'dribbble':
                return 'Dribbble';
            case 'github':
                return 'Github';
            case 'odesk':
                return 'oDesk';
            case 'peopleperhour':
                return 'PeoplePerHour';
            default:
                return;
            }
        };
    });

    app.filter('displayMediaTypes', function () {
        return function (mediaTypes) {
            return mediaTypes.join(', ').toLowerCase();
        };
    });

    app.filter('importedLink', ['PATHS', 'ENV', function (paths, env) {
        return function (item, guid) {
            return [
                env.api.endPoint + paths.file.imported,
                guid, '/',
                item.Provider, '/',
                item.FolderName, '/',
                item.ThumbnailAsset.Folder, '/',
                item.ThumbnailAsset.Name
            ].join('');
        };
    }]);

    app.filter('notOffered', function () {
        return function (services, offers) {
            var offeredServiceIDs = [];

            if (!services || services.length === 0) {
                return;
            }

            _.each(offers, function (offer) {
                offer.hasOwnProperty('ServiceID') && offeredServiceIDs.push(offer.ServiceID);
            });

            return _.filter(services, function (svc) {
                return offeredServiceIDs.indexOf(svc.serviceID) === -1;
            });
        };
    });

}());
