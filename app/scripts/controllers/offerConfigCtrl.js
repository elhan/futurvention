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
    app.controller('OfferConfigCtrl', ['$scope', '$timeout', '$modal', '$upload', '$location', '$q', 'EVENTS', 'PROVIDERS_ENUM', 'PATHS', 'MESSAGES', 'Utils', 'Odata', 'CatalogueSvc', 'ProfileSvc', 'OfferSvc', 'PortfolioSvc', 'NotificationSvc', 'ImporterSvc', function ($scope, $timeout, $modal, $upload, $location, $q, events, providers, paths, msg, utils, odata, CatalogueSvc, ProfileSvc, OfferSvc, PortfolioSvc, NotificationSvc, ImporterSvc) {
        var modalEmbedUrl, modalCameraTag;

        $scope.deadlines = ['1 day', '2 days', '3 days', '4 days', '5 days', '6 days', '7 days', '8 days', '9 days', '10 days'];
        $scope.extraDeadlines = ['1 extra day', '2 extra days', '3 extra days', '4 extra days', '5 extra days', '6 extra days', '7 extra days', '8 extra days', '9 extra days', '10 extra days'];

        $scope.urlsToEmbed = [{ url: '' }];

        // before navigating to this step, the respective controller has ensured OffrSvc.offer is suynced
        $scope.offer =  OfferSvc.getOffer();

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

        $scope.fieldDictionary = [];

        $scope.importedPortfolios = [];
        $scope.selectedPortfolios = [];
        $scope.portfoliosExpanded = [];

        $scope.status = {}; // the current importer status

        // can be 'owned' or 'imported'. Controls which work samples section is visible
        $scope.activeWorkSamples = 'owned';

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

                PortfolioSvc.saveShowcases($scope.offer.ID, _.map($scope.showcaseCollection, function (item) {
                    return item.ID;
                })).then(function (response) {
                    console.log(response);
                }, function (error) {
                    console.log(error);
                });

                break;
            case 'Personalize your offering':
                $scope.saveOfferField($scope.service.interview, $scope.service.interview.answer);
                $scope.service.fields.length > 0 && $scope.saveOfferField($scope.service.fields[0], $scope.service.fields[0].answer);
                break;
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
            $scope.urlsToEmbed.empty = [''];
            modalEmbedUrl.hide();
        };

        $scope.closeCameraTagModal = function () {
            var deferred = $q.defer();
            modalCameraTag.$promise.then(function () {
                modalCameraTag.hide();
                deferred.resolve();
            });
            return deferred.promise;
        };

        $scope.matchUrlPattern = function (value) {
            return utils.matchUrlPattern(value);
        };

        ////////////////////////////////////////////
        /// Other scope functions
        ////////////////////////////////////////////

        $scope.removeShowcase = function (item) {
            var showcase = _.find($scope.showcaseCollection, function (sc) {
                return sc.Items[0].ID === item.ID;
            });

            PortfolioSvc.deleteShowcase(showcase.ID).then(function () {

                NotificationSvc.show({ content: msg.success.showcaseDeleteSuccess, type: 'success' });

                _.remove($scope.showcaseItems, function (sc) {
                    return sc.ID === item.ID;
                });

                _.remove($scope.showcaseCollection, function (sc) {
                    return sc.Items[0].ID === item.ID;
                });

            }, function (error) {
                console.log(error);
                NotificationSvc.show({ content: msg.error.generic, type: 'error' });
            });
        };

        $scope.rearangeShowcaseItems = function (item) {
            // The source (dragged) item link is passed via the fv-data attribute into the drop event
            var sourceIndex, targetIndex, sourceParent, targetParent,
                source = JSON.parse(this.event.dataTransfer.getData('Text')),
                target = item.link;

            if (source === target) {
                return;
            }

            sourceIndex = $scope.showcaseItems.indexOf(_.where($scope.showcaseItems, { link: source })[0]);
            targetIndex = $scope.showcaseItems.indexOf(_.where($scope.showcaseItems, { link: target })[0]);

            $scope.showcaseItems = $scope.showcaseItems.swap(sourceIndex, targetIndex);

            // update the showcase collection - this will be persisted on the backend
            sourceParent = $scope.showcaseCollection.indexOf(
                _.find($scope.showcaseCollection, function (showcase) {
                    return showcase.Items[0].ID === $scope.showcaseItems[sourceIndex].ID;
                })
            );

            targetParent = $scope.showcaseCollection.indexOf(
                _.find($scope.showcaseCollection, function (showcase) {
                    return showcase.Items[0].ID === $scope.showcaseItems[targetIndex].ID;
                })
            );

            $scope.showcaseCollection = $scope.showcaseCollection.swap(sourceParent, targetParent);
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
                obj.url && urls.push(obj.url);
            });

            modalEmbedUrl.hide();

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
            answer && answer.length && OfferSvc.saveOfferField($scope.offer.ID, field.ID, answer).then(function (response) {
                console.log(response);
            }, function (error) {
                console.log(error);
            });
        };

        $scope.saveOfferedChoice = function (choice) {
            choice.price > 0 && OfferSvc.saveOfferChoice({
                offerID: $scope.offer.ID,
                serviceChoiceID: choice.ID,
                price: choice.price,
                days: parseInt(choice.days)
            }).then(function (response) {
                console.log(response);
            });
        };

        $scope.fetchShowcases = function () {
            PortfolioSvc.fetchShowcases($scope.offer.ID).then(function (response) {
                console.log(response);
            }, function (error) {
                console.log(error);
            });
        };

        $scope.saveInterviewVideo = function (url, thumbnailUrl) {
            OfferSvc.saveInterviewVideo($scope.offer.ID, $scope.service.interview.ID, url, thumbnailUrl).then(function () {
              $scope.service.interview.videoUuid = utils.getCameraTagUuid(url);
              $scope.service.interview.videoUrl = url;
            }, function (error) {
              console.log(error);
              NotificationSvc.show({ content: msg.error.generic, type: 'error' });
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

        $scope.$on('modal.show', function () {
            if (!CameraTag) {
                return;
            }

            CameraTag.setup();

            CameraTag.observe('fvcam', 'processed', function() {
                var cam = CameraTag.cameras['fvcam'];
                var vid = cam.getVideo();
                var url = 'http:' + vid.formats.qvga.mp4_url;
                var thumbnailUrl = 'http:' + vid.formats.qvga.thumb_url;

                $scope.closeCameraTagModal().then(function () {
                    _.throttle(function () { $scope.saveInterviewVideo(url, thumbnailUrl); }, 3000);
                });

            });
        });

        ////////////////////////////////////////////
        /// Init
        ////////////////////////////////////////////

        CatalogueSvc.getService($scope.offer.ServiceID, true).then(function (service) {
            var offeredChoice;

            $scope.service = service;

            _.each(service.options, function (option) {
                _.each(option.choices, function (serviceChoice) {

                    offeredChoice = _.find($scope.offer.OfferedChoices, function (offeredChoice) {
                        return offeredChoice.ServiceChoiceID === serviceChoice.ID;
                    });

                    if (option.isPriceDiscriminator) {
                        serviceChoice.price = offeredChoice ? offeredChoice.Price : 0;
                    }

                    if (option.isDaysDiscriminator) {
                        serviceChoice.days = offeredChoice ? offeredChoice.Days : 1;
                    }

                });

                 option.isPriceDiscriminator && option.isMandatory && $scope.priceDiscriminators.push(option);
                 option.isPriceDiscriminator && !option.isMandatory && $scope.addons.push(option);
            });

            // update service field answers. This only works due to soft service field constrains
            _.each($scope.offer.Fields, function (field) {
                if (field.ServiceFieldID === service.interview.ID) {
                    $scope.service.interview.answer = field.Text.Literals[0].Text;
                } else {
                    $scope.service.fields[0].answer = field.Text.Literals[0].Text;
                }
            });

            /*
                The offer object passed in the route resolve is created by OfferSvc.fetchOwnOffer, which
                does not allow expand operations. Thus, to get the full offer interview object a new call
                must be made.
            **/
            OfferSvc.fetchOffer($scope.offer.ID).then(function (offer) {
                $scope.offer.Fields = offer.Fields;
                if (offer.Fields[0] && offer.Fields[0].File && offer.Fields[0].File.Url) {
                    $scope.service.interview.videoUuid = utils.getCameraTagUuid(offer.Fields[0].File.Url);
                    $scope.service.interview.videoUrl = offer.Fields[0].File.Url;
                    CameraTag.setup();
                }
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

        PortfolioSvc.fetchShowcases($scope.offer.ID).then(function (showcases) {
            // TODO: temporary convention. No need to attach to offer
            $scope.offer.Showcases = showcases;
            $scope.updateShowcaseItems($scope.offer.Showcases);
        });

    }]);
}());
