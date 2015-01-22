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
                thumbnailLink = '/images/svg/file-excel.svg';
                break;
            case 'Word':
                thumbnailLink = '/images/svg/file-doc.svg';
                break;
            case 'Txt':
                thumbnailLink = '/images/svg/file-rtf.svg';
                break;
            case 'PDF':
                thumbnailLink = '/images/svg/file-pdf.svg';
                break;
            case 'PowerPoint':
                thumbnailLink = '/images/svg/file-ppt.svg';
                break;
            default:
                thumbnailLink = '/images/svg/file-default.svg';
                break;
            }

            return thumbnailLink;
        };
    });

    app.filter('bytesToSize', function() {
        return function(bytes, precision) {
            var units, number;

            if (isNaN(parseFloat(bytes)) || !isFinite(bytes)) {
                return '-';
            }

            if (typeof precision === 'undefined') {
                precision = 1;
            }

            units = ['bytes', 'kB', 'MB', 'GB', 'TB', 'PB'],
            number = Math.floor(Math.log(bytes) / Math.log(1024));

            return (bytes / Math.pow(1024, Math.floor(number))).toFixed(precision) +  ' ' + units[number];
        };
    });

    app.filter('ellipsis', function () {
        return function formatTextEllipsis(text, lineLength, lineCount) {
            var words, totalLines, maxLineLength, lines = [],
                line = '',
                ellipsisText = '...',
                ellipsis = false;

            if (!text) {
                return;
            }

            // defaults
            totalLines = angular.isDefined(lineCount) ? parseInt(lineCount) : 2;
            maxLineLength = angular.isDefined(lineLength) ? parseInt(lineLength) : 20;

            text = text.replace( /  +/g, ' ' );

            console.log({
                text: text,
                max: maxLineLength,
                check: text.length < maxLineLength * totalLines,
            });

            // check if the maximum input is shorter than the maximum allowed
            if (text.length < maxLineLength * totalLines) {
                return text;
            }

            // replace multiple whitespace with a single one, then tokenize
            words = text.split(' ');

            for (var i = 0; i < words.length; i++) {
                // the new word should be pushed in new line
                if (words[i].length + line.length + 1 > maxLineLength){
                    lines.push(line);
                    line = '';
                }

                // if num of lines exceed requested lines break
                if (lines.length >= totalLines){
                    ellipsis = true;
                    break;
                }

                // append the word in line with a space
                line = line + words[i] + ' ';

                // check if this is the last word that is needed to be pushed in lines
                // i.e. when the total text length fits in total lines needed
                var lastWordIndex = words.length - 1;
                lastWordIndex === i && lines.push(line);
            }

            // if the text does not fit in total lines requested, append ...
            if (ellipsis) {
                // remove words until the ... fits in last line
                while (lines[totalLines - 1].length + ellipsisText.length > maxLineLength){
                    // trim the last line (for the space after the word)
                    var lineTrim = lines[totalLines - 1].trim();

                    var lastIndex = lineTrim.lastIndexOf(' ') + 1;
                    var shorterLine = lineTrim.slice(0, lastIndex);
                    lines[totalLines - 1] = shorterLine;
                }

                lines[totalLines - 1] += ellipsisText;
            }

            console.log(lines.join(' '));
            return lines.join(' ');
        };
    });

    app.filter('trimMoniker', function () {
        return function (str) {
            var restrictedChars = ['-', '_', ' '];

            if (!str) {
                return;
            }

            _.each(str.split(''), function (ch) {
                if (restrictedChars.indexOf(ch) !== -1) {
                    str = str.replace(ch, '');
                }
            });

            return str;
        };
    });

}());
