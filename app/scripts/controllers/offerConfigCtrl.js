/*global CameraTag */
/*jshint sub:true*/

(function () {
    'use strict';

    var app = angular.module('fvApp');

    /**
     * @ngdoc Controller
     * @name fvApp.controller: OfferConfigCtrl
     * @description
     * # OfferConfigCtrl
     * Controls the apply 'service config' step
     */
    app.controller('OfferConfigCtrl', ['$scope', '$timeout', '$modal', '$upload', '$location', 'EVENTS', 'PROVIDERS_ENUM', 'PATHS', 'MESSAGES', 'Utils', 'Odata', 'CatalogueSvc', 'ProfileSvc', 'OfferSvc', 'PortfolioSvc', 'NotificationSvc', 'ImporterSvc', function ($scope, $timeout, $modal, $upload, $location, events, providers, paths, msg, utils, odata, CatalogueSvc, ProfileSvc, OfferSvc, PortfolioSvc, NotificationSvc, ImporterSvc) {
        var modalEmbedUrl, modalCameraTag;

        $scope.deadlines = ['1 day', '2 days', '3 days', '4 days', '5 days', '6 days', '7 days', '8 days', '9 days', '10 days'];
        $scope.extraDeadlines = ['1 extra day', '2 extra days', '3 extra days', '4 extra days', '5 extra days', '6 extra days', '7 extra days', '8 extra days', '9 extra days', '10 extra days'];

        $scope.urlsToEmbed = [{ url: '' }];

        /**
         * Items added by embed url modal or file upload
         * @type Array.<SimpleShowcaseItem>
         */
        $scope.showcaseItems = [];

         /** @type Array.<Showcase> */
        $scope.showcaseCollection = [];

        $scope.service = {};
        $scope.priceDiscriminators= [];
        $scope.addons = [];

        $scope.serviceFieldDictionary = [];

        $scope.importedPortfolios = [];
        $scope.selectedPortfolios = [];
        $scope.portfoliosExpanded = [];

        $scope.status = {}; // the current importer status

        // can be 'owned' or 'imported'. Controls which work samples section is visible
        $scope.activeWorkSamples = 'owned';

        // before navigating to this step, the respective controller has ensured OffrSvc.offer is suynced
        $scope.offer =  OfferSvc.getOffer();

        ////////////////////////////////////////////
        /// Panels and panel functions
        ////////////////////////////////////////////

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
                state: 'default',
                textonly: false
            },
            {
                title: 'Pricing / Deadlines',
                state: 'default'
            }
        ];

        $scope.panels.activePanel = 0;

        $scope.setPanelState = function (panel, state) {
            panel.state = state;
        };

        $scope.closePanel = function (panel) {
            switch (panel.title) {
            case 'Work Samples':
                $scope.offer.Showcases = $scope.showcaseCollection;

                OfferSvc.saveShowcases($scope.offer.ID, _.map($scope.showcaseCollection, function (item) {
                    return item.ID;
                })).then(function (response) {
                    console.log(response);
                }, function (error) {
                    console.log(error);
                });

                break;
            case 'Personalize your offering':
                // TODO: save choices properly
            }

            $scope.setPanelState(panel, 'done');

            $scope.panels.activePanel = $scope.panels.indexOf(
                _.find($scope.panels, function (panel) {
                    return panel.state === 'default';
                })
            );
        };

        ////////////////////////////////////////////
        /// Modals & modal functions
        ////////////////////////////////////////////

        modalEmbedUrl = $modal({
            scope: $scope,
            template: 'views/components/modalEmbedUrl.html',
            show: false,
            keyboard: false,
            animation: 'am-slide-top'
        });

        modalCameraTag = $modal({
            scope: $scope,
            template: 'views/components/modalCameraTag.html',
            show: false,
            keyboard: false,
            backdrop: 'static',
            animation: 'am-slide-top'
        });

        $scope.showEmbedUrlModal = _.throttle(function () {
            modalEmbedUrl.$promise.then(function () { modalEmbedUrl.show(); });
        }, 700);

        $scope.showCameraTagModal = function () {
            modalCameraTag.$promise.then(function () { modalCameraTag.show(); });
        };

        $scope.closeEmbedUrlModal = function () {
            $scope.urlsToEmbed.empty();
            modalEmbedUrl.hide();
        };

        $scope.closeCameraTagModal = function () {
            modalCameraTag.hide();
        };

        ////////////////////////////////////////////
        /// Other scope functions
        ////////////////////////////////////////////

        $scope.rearangeShowcaseItems = function (item) {
            // The source (dragged) item link is passed via the fv-data attribute into the drop event
            var sourceIndex, targetIndex,
                source = JSON.parse(this.event.dataTransfer.getData('Text')),
                target = item.link;

            if (source === target) {
                return;
            }

            sourceIndex = $scope.showcaseItems.indexOf(_.where($scope.showcaseItems, { link: source })[0]);
            targetIndex = $scope.showcaseItems.indexOf(_.where($scope.showcaseItems, { link: target })[0]);

            $scope.showcaseItems = $scope.showcaseItems.swap(sourceIndex, targetIndex);
        };

        $scope.togglePortfolioSelection = function (item) {
            var selected  = $scope.selectedPortfolios;
            selected.indexOf(item) === -1 ? selected.push(item) : selected.remove(function (portfolio) {
                return portfolio === item;
            });
        };

        $scope.toggleTextOnly = function () {
            var panel = $scope.panels[$scope.panels.activePanel];
            if (!panel.hasOwnProperty('textonly')) {
                return;
            }
            panel.textonly = ! panel.textonly;
        };

        // for a given importedPortfolio, and a given status, check the completion status
        $scope.getPortfolioCompletionState = function (portfolioProvider) {
            return _.find($scope.status, function (provider) {
                return provider.Provider === providers[portfolioProvider];
            });
        };

        $scope.portfolioDone =  function (portfolioProvider) {
            var state = $scope.getPortfolioCompletionState(portfolioProvider);
            /*
                If all portfolios have finished downloading before the controller is initialized,
                state will be undefined since no status events will be broadcasted.
            **/
            return state ? state.Portfolio.Total === state.Portfolio.Count : true;
        };

        $scope.portfolioImporting =  function (portfolioProvider) {
            var state = $scope.getPortfolioCompletionState(portfolioProvider);
            /*
                If all portfolios have finished downloading before the controller is initialized,
                state will be undefined since no status events will be broadcasted.
            **/
            return state ? state.Portfolio.Total > state.Portfolio.Count : false;
        };

        $scope.getPortfoliosCount = function (portfolioProvider) {
            var state = $scope.getPortfolioCompletionState(portfolioProvider);
            var portfolio = _.find($scope.importedPortfolios, function (portfolio) {
                return portfolio.Provider ===  portfolioProvider;
            });
            return state ? state.Portfolio.Count : portfolio.data.length;
        };

        $scope.toggleActiveWorkSamples = function () {
            $scope.activeWorkSamples = $scope.activeWorkSamples === 'owned' ? 'imported' : 'owned';
        };

        $scope.getImportedLink = function (item) {
            return [
                paths.file.imported,
                $scope.currentUser.Guid, '/',
                item.Provider, '/',
                item.FolderName, '/',
                item.ThumbnailAsset.Folder, '/',
                item.ThumbnailAsset.Name
            ].join('');
        };

        $scope.toggleExpansion = function (portfolio) {
            var expanded = $scope.portfoliosExpanded;
            expanded.indexOf(portfolio) === -1 ? expanded.push(portfolio) : expanded.remove(function (item) {
                return item === portfolio;
            });
        };

        ////////////////////////////////////////////
        /// Sync with backend
        ////////////////////////////////////////////

        $scope.updateShowcaseItems = function (data) {
            var showcase, showcaseItem;
            _.each(data, function (fetchedShowcase) {
                showcase = new odata.Showcase(fetchedShowcase);
                showcaseItem = new odata.ShowcaseItem(showcase.Items[0]);
                $scope.showcaseCollection.push(showcase);
                $scope.showcaseItems.push(showcaseItem.toSimpleShowcaseItem({ state: 'loaded' }));
            });
        };

        $scope.fetchImportedPortfolios = function () {
            ImporterSvc.fetchPortfolios().then(function (portfolios) {
                $scope.importedPortfolios = portfolios.data;
            }, function (error) {
                console.log(error);
            });
        };

        $scope.saveImportedPortfolios = function () {
            if ($scope.selectedPortfolios.length === 0) {
                $scope.toggleActiveWorkSamples();
                return;
            }

            ImporterSvc.saveImportedPortfolios($scope.service.serviceID, $scope.selectedPortfolios).then(function (response) {
                $scope.updateShowcaseItems(response.data);
                $scope.toggleActiveWorkSamples();
            }, function (error) {
                console.log(error);
                NotificationSvc.show({ content: msg.error.profileSaveFailed, type: 'error' });
            });
        };

        $scope.onFileSelect = function (files) {
            var fileNames = [];

            _.each(files, function (file) {
                fileNames.push(file.name);
            });

            $upload.upload({
                url: paths.sellerManagement.showcases + $scope.service.serviceID,
                file: files,
                fileFormDataName: fileNames
            }).then(function (response) {
                $scope.updateShowcaseItems(response.data);
            }, function (error) {
                console.log(error);
                NotificationSvc.show({ content: msg.error.generic, type: 'error' });
            });
        };

        $scope.saveUrls = function () {
            var urls = [];

            _.each($scope.urlsToEmbed, function (obj) {
                urls.push(obj.url);
            });

            modalEmbedUrl.hide();
            modalCameraTag.hide();

            PortfolioSvc.saveUrls(urls, $scope.service.serviceID).then(function (response) {
                $scope.updateShowcaseItems(response.data);
            }, function (error) {
                console.log(error);
                // user tried to embed a type of file not supported for this service
                if (error.data.ExceptionType === 'Futurvention.Ergma.Business.InvalidFileTypeException') {
                    NotificationSvc.show({ content: error.data.ExceptionMessage, type: 'error' });
                }
            });
        };

        // saves the user's answer to a serviceField
        $scope.saveOfferField = function (field, answer) {
            answer && OfferSvc.saveOfferField($scope.offer.ID, field.ID, answer).then(function (response) {
                console.log(response);
            }, function (error) {
                console.log(error);
            });
        };

        ////////////////////////////////////////////
        /// Watchers
        ////////////////////////////////////////////

        $scope.$watch('panels.activePanel', function () {
            var inProgress = _.find($scope.panels, function (panel) {
                return panel.state !== 'done';
            });
            !inProgress && $scope.goToStep(2);
        });

        $scope.$on(events.importer.status, function (event, status) {
            if ($scope.status === status) {
                return;
            }
            $scope.status = status.data;
            $scope.fetchImportedPortfolios();
        });

        $scope.$on('modal.show', function () { // initialize CameraTag when the camera modal loads
            CameraTag.setup();
            CameraTag.observe('fvcam', 'published', function() {
                var cam = CameraTag.cameras['fvcam'];
                var vid = cam.getVideo();
                $scope.urlsToEmbed.empty();
                $scope.urlsToEmbed.push({ url: vid.formats.qvga.video_url });
                $scope.saveUrls();
//                var mp4_url = vid.formats.qvga.mp4_url;
//                var small_thumb_url = vid.formats.qvga.small_thumb_url;
//                var thumb_url = vid.formats.qvga.thumb_url;
//                var video_url = vid.formats.qvga.video_url;
            });
        });

        ////////////////////////////////////////////
        /// Init
        ////////////////////////////////////////////

        CatalogueSvc.getService($scope.offer.ServiceID).then(function (service) {
            $scope.service = service;

            $scope.priceDiscriminators = _.filter(service.options, function (option) {
                return option.isPriceDiscriminator && option.isMandatory;
            });

            $scope.addons = _.filter(service.options, function (option) {
                return option.isPriceDiscriminator && !option.isMandatory;
            });

        }, function (error) {
            console.log(error);
        });

        $timeout(function () { $scope.panels.activePanel = 0; }); // update the UI

        ImporterSvc.fetchCachedPortfolios($scope.currentUser.Guid).then(function (portfolios) {
            $scope.importedPortfolios = _.pick(portfolios.data, function (importer) {
                return importer.data && importer.data.length > 0;
            });
        }, function (error) {
            console.log(error);
        });

        $scope.updateShowcaseItems($scope.offer.Showcases);

    }]);
}());
