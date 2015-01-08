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

    app.filter('importedLink', ['$filter', 'PATHS', function ($filter, paths) {
        return function (item) {
            var thumbnailLink, thumbnailType;

            switch (true) {
            case !item:
                break;
            case item.hasOwnProperty('ThumbnailAsset') && item.ThumbnailAsset !== null:
                thumbnailLink = [
                    paths.importer.importedData,
                    item.Guid, '/',
                    item.Provider, '/',
                    item.FolderName, '/',
                    item.ThumbnailAsset.Folder, '/',
                    item.ThumbnailAsset.Name
                ].join('');
                break;
            default:
                thumbnailType = $filter('getThumbnailType')({ type: item.MainAsset.ContentType });
                thumbnailLink = $filter('getThumbnailLink')(thumbnailType);
                break;
            }

            return thumbnailLink;
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

    app.filter('invalidFileType', function () {
        return function (fileName, serverErrorMsg) {
            return [
                fileName,
                'could not be uploaded. File type',
                serverErrorMsg.split('\'')[1],
                'is not supported by the service.'
            ].join(' ');
        };
    });

    app.filter('hasShowcaseItems', function () {
        return function (importedPortfolios) {
            return _.filter(importedPortfolios, function (portfolio) {
                return portfolio.hasOwnProperty('data') && portfolio.data instanceof Array && portfolio.data.length > 0;
            });
        };
    });

    app.filter('fetchedPortfoliosCount', ['$filter', function ($filter) {
        return function (importer, importedPortfolios) {
            var importedPortfolio, count = 0;

            importedPortfolio = _.find(importedPortfolios, function (port) {
                return port.Provider === $filter('getProviderName')(importer);
            });

            if (importedPortfolio && importedPortfolio.hasOwnProperty('data') && importedPortfolio.data instanceof Array && importedPortfolio.data.length > 0) {
                count = importedPortfolio.data.length;
            }

            return count;
        };
    }]);

    app.filter('getThumbnailType', ['$filter', 'FILE_TYPE_CONFIG', function ($filter, fileTypeConfig) {
        // mimeTypeObject can be either { ID: Number } or {type: String }
        return function (mimeTypeObj) {
            var typeConfiguration;

            if (!mimeTypeObj) {
                return;
            }

            typeConfiguration = _.find(fileTypeConfig, function (conf) {
                return mimeTypeObj.hasOwnProperty('ID') ? mimeTypeObj.ID === conf.ID : mimeTypeObj.type === conf.ContentCode;
            });

            return typeConfiguration ? typeConfiguration.Thumbnail : null;
        };
    }]);

    app.filter('getThumbnailLink', function () {
        return function (thumbnailType) {
            var thumbnailLink;

            switch (thumbnailType) {
            case 'Excel':
                thumbnailLink = '/images/file-excel.png';
                break;
            case 'Word':
                thumbnailLink = '/images/file-doc.png';
                break;
            case 'Txt':
                thumbnailLink = '/images/file-rtf.png';
                break;
            case 'PDF':
                thumbnailLink = '/images/file-pdf.png';
                break;
            case 'PowerPoint':
                thumbnailLink = '/images/file-ppt.png';
                break;
            default:
                thumbnailLink = '/images/file-default.png';
                break;
            }

            return thumbnailLink;
        };
    });

}());
