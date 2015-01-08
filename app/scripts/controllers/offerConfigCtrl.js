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
    app.controller('OfferConfigCtrl', ['$scope', '$timeout', '$modal', '$upload', '$location', '$q', '$alert', '$filter', 'EVENTS', 'PROVIDERS_ENUM', 'PATHS', 'ENV', 'MESSAGES', 'Utils', 'Odata', 'CatalogueSvc', 'ProfileSvc', 'OfferSvc', 'PortfolioSvc', 'NotificationSvc', 'ImporterSvc', function ($scope, $timeout, $modal, $upload, $location, $q, $alert, $filter, events, providers, paths, env, msg, utils, odata, CatalogueSvc, ProfileSvc, OfferSvc, PortfolioSvc, NotificationSvc, ImporterSvc) {

        var modalEmbedUrl, modalCameraTag, modalShowcaseViewer, modalPageLoading;

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
        $scope.addedPortfolios = []; // portfolios that have been added to the showcaseItems collection
        $scope.portfoliosExpanded = [];

        // these are extended importer objects, containing information on current status (==checkstatus response)
        $scope.importersAvailable = [];
        $scope.importersFailed = [];
        $scope.importersInProgress = [];
        $scope.importersFinished = [];

        $scope.status = {}; // the current importer status

        $scope.uploadInProgress = false;
        $scope.saveImportedDataInProgress = false;

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

        modalPageLoading = $modal({
            scope: $scope,
            template: 'views/components/modalPageLoading.html',
            show: true,
            animation: 'am-fade-out',
            backdropAnimation: 'am-fade light',
            keyboard: false,
            backdrop: 'static'
        });

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

        modalShowcaseViewer = $modal({
            scope: $scope,
            template: 'views/components/modalShowcaseViewer.html',
            show: false,
            animation: 'am-slide-top',
            keyboard: true
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
        /// Imported Work Samples tab
        ////////////////////////////////////////////

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
            var state, portfolio;

            state = $scope.getPortfolioCompletionState(portfolioProvider);

            portfolio = _.find($scope.importedPortfolios, function (portfolio) {
                return portfolio.Provider ===  portfolioProvider;
            });

            return state ? state.Portfolio.Count : portfolio.data.length;
        };

        $scope.toggleActiveWorkSamples = function () {
            $scope.activeWorkSamples = $scope.activeWorkSamples === 'owned' ? 'imported' : 'owned';
        };

        $scope.toggleExpansion = function (portfolio) {
            var expanded = $scope.portfoliosExpanded;
            expanded.indexOf(portfolio) === -1 ? expanded.push(portfolio) : expanded.remove(function (item) {
                return item === portfolio;
            });
        };


        /**
         * Checks if imported item has been added to the showcaseItems collection. Neccessary to determin
         * the item's 'selected disabled' status (grey overlay).
         * @param {importedItem} an imported showcase item
         * @returns {Boolean} True if the imported item has been added to the showcaseItems collection.
         */
        $scope.getImportedItemAddedStatus = function (importedItem) {
            return angular.isDefined(_.find($scope.showcaseItems, function (item) {
                return item.file.Name.indexOf(importedItem.ProcessedAsset.Name) !== -1;
            }));
        };

        ////////////////////////////////////////////
        /// Other scope functions
        ////////////////////////////////////////////

        $scope.displayInDetail = function (showcaseitemID) {
            var showcase;

            showcase = _.find($scope.showcaseCollection, function (sc) {
                return sc.Items[0].ID === showcaseitemID;
            });

            PortfolioSvc.setPortfolio(showcase);

            modalShowcaseViewer.$promise.then(function () { modalShowcaseViewer.show(); });
        };

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

        $scope.updateShowcaseTitle = function (item) {
            var showcase = _.find($scope.showcaseCollection, function (sc) {
                return sc.ID === item.ID;
            });

            console.log(showcase.Title, showcase.Title instanceof odata.Multilingual);

            if (showcase) {
                showcase.setMultilingual('Title', item.name);

                PortfolioSvc.updateShowcaseTitle(showcase).then(function (response) {
                    console.log(response);
                }, function (error) {
                    console.log(error);
                });
            }

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

        ////////////////////////////////////////////
        /// Sync with backend
        ////////////////////////////////////////////

        $scope.updateShowcaseItems = function (data) {
            var showcase, showcaseItem;
            _.each(data, function (fetchedShowcase) {
                showcase = new odata.Showcase(fetchedShowcase);
                showcaseItem = new odata.ShowcaseItem(showcase.Items[0]);
                $scope.showcaseCollection.push(showcase);
                $scope.showcaseItems.push(showcaseItem.toSimpleShowcaseItem({ state: 'loaded', name: showcase.multilingualToString('Title') })); // simple showcase objects display the Showcase title
            });
        };

        $scope.fetchImportedPortfolios = function () {
            var simpleImporters = [];

            /*
                For each (expanded) importer in importersAvailable, create a simple importer object needed by fetchPortfolios,
                and fetched the portfolios that have finished
            **/
            simpleImporters = _.map($scope.importersAvailable, function (extendedImporter) {
                return {
                    Provider: $filter('getProviderName')(extendedImporter),
                    Url: '', // this does not need to be specified
                    Guid: extendedImporter.Guid
                };
            });

            ImporterSvc.fetchPortfolios(simpleImporters).then(function (response) {
                var importedPortfolio,
                    importedPortfolioItem,
                    portfolios = response.data;

                _.each(portfolios, function (portfolio) {
                    importedPortfolio = _.find($scope.importedPortfolios, function (port) {
                        return port.Provider === portfolio.Provider;
                    });

                    // If the portfolio has already been added to the importedPortfolios collection, update it's showcase collection
                    if (importedPortfolio) {
                        _.each(portfolio.data, function (showcase) {
                            importedPortfolioItem = _.find(importedPortfolio.data, function (sc) {
                                // try to match items by asset name, if one exists, as it is the safest way to do so
                                if (showcase.hasOwnProperty('ProcessedAsset') && showcase.ProcessedAsset.hasOwnProperty('Name') && showcase.ProcessedAsset.Name) {
                                    return showcase.ProcessedAsset.Name === sc.ProcessedAsset.Name;
                                } else {
                                    return showcase.Title === sc.Title; // this will cover most, but not all cases.
                                }
                            });

                            !importedPortfolioItem && importedPortfolio.data.push(showcase);
                        });
                    } else {
                        // TODO: this should be on server. Make sure only valid files get through. The server sometimes sends unproccessed Items.
                        portfolio && portfolio.hasOwnProperty('data') && _.remove(portfolio.data, function (showcase) {
                            return !showcase.ProcessedAsset;
                        });
                        $scope.importedPortfolios.push(portfolio);
                    }
                });
            }, function (error) {
                console.log(error);
            });
        };

        /**
         * Handles saving imported items that have been selected by the user to Showcases, and toggles the imported pane
         */
        $scope.saveImportedPortfolios = function () {
            if ($scope.saveImportedDataInProgress) {
                return;
            }

            if ($scope.selectedPortfolios.length === 0) {
                $scope.toggleActiveWorkSamples();
                return;
            }

            $scope.saveImportedDataInProgress = true;

            ImporterSvc.saveImportedPortfolios($scope.service.serviceID, $scope.selectedPortfolios).then(function (response) {
                $scope.updateShowcaseItems(response.data);
                $scope.toggleActiveWorkSamples();
                $scope.saveImportedDataInProgress = false;
            }, function (error) {
                console.log(error);
                NotificationSvc.show({ content: msg.error.profileSaveFailed, type: 'error' });
                $scope.saveImportedDataInProgress = false;
            });
        };

        function uploadShowcase (file) {
            var currentNotification, errorMsg,
                deferred = $q.defer();

            $scope.uploadInProgress = true;

            $upload.upload({
                url: env.api.endPoint + paths.sellerManagement.showcases + $scope.service.serviceID,
                file: file,
                fileFormDataName: file.name
            }).then(function (response) {
                $scope.uploadInProgress = false;
                deferred.resolve(response.data); //notify onFileSelect that the upload is done
            }, function (error) {
                console.log(error);

                $scope.uploadInProgress = false;

                deferred.reject(); //notify onFileSelect that the upload has failed

                if (error.status === 500 && error.data && error.data.hasOwnProperty('ExceptionName') && error.data.hasOwnProperty('DisplayMessage') && error.data.ExceptionName === 'Futurvention.Ergma.Business.InvalidFileTypeException') {

                    errorMsg = $filter('invalidFileType')(file.name, error.data.DisplayMessage);

                    currentNotification && currentNotification.hide();
                    currentNotification = $alert({ content: errorMsg, type: 'error', show: true });

                } else {
                    NotificationSvc.show({ content: msg.error.generic, type: 'error' });
                }

            });

            return deferred.promise;
        }

        // sequential file upload
        $scope.onFileSelect = function (files) {
            var placeholderItem, placeholderLink,
                currentFileIndex = 0,
                reader = new FileReader();

            if (files.length === 0) {
                return;
            }

            _.each(files, function (file) {
                placeholderItem = new odata.SimpleShowcaseItem({ name: file.name });
                $scope.showcaseItems.push(placeholderItem); // push a placeholder item to show loading state
            });

            reader.onload = function (e) {
                placeholderLink = e.target.result;

                placeholderItem = _.find($scope.showcaseItems, function (sc) {
                    return sc.name === files[currentFileIndex].name;
                });

                // if the file is an image, update link to show background preview
                if (placeholderItem && placeholderItem.hasOwnProperty('link')) {
                    if (files[currentFileIndex].hasOwnProperty('type') && utils.isImage(files[currentFileIndex].type)) {
                        $scope.$apply(function () {
                            placeholderItem.link = placeholderLink;
                        });
                    }
                }

                uploadShowcase(files[currentFileIndex], placeholderLink).then(function (newShowcaseItem) {
                    _.remove($scope.showcaseItems, placeholderItem);
                    $scope.updateShowcaseItems(newShowcaseItem);

                    currentFileIndex < files.length -1 && reader.readAsDataURL(files[currentFileIndex++]);

                }, function () {
                    _.remove($scope.showcaseItems, placeholderItem);
                    currentFileIndex < files.length -1 && reader.readAsDataURL(files[currentFileIndex++]);
                });
            };

            reader.readAsDataURL(files[currentFileIndex]);
        };

        function uploadExternalLink (url, placeholderItem) {
            var currentNotification, errorMsg;

            PortfolioSvc.saveUrls(url, $scope.service.serviceID).then(function (response) {
                _.remove($scope.showcaseItems, placeholderItem);
                $scope.updateShowcaseItems(response.data);

            }, function (error) {
                _.remove($scope.showcaseItems, placeholderItem);

                if (error.status === 500 && error.data && error.data.hasOwnProperty('ExceptionName') && error.data.hasOwnProperty('DisplayMessage') && error.data.ExceptionName === 'Futurvention.Ergma.Business.InvalidFileTypeException') {

                    errorMsg = $filter('invalidFileType')(url, error.data.DisplayMessage);
                    currentNotification && currentNotification.hide();
                    currentNotification = $alert({ content: errorMsg, type: 'error', show: true });

                } else {
                    NotificationSvc.show({ content: msg.error.generic, type: 'error' });
                }
            });
        }

        $scope.saveUrls = function () {
            var  placeholderItem;

            _.each($scope.urlsToEmbed, function (obj) {

                if (!obj || !obj.hasOwnProperty('url')) {
                    return false;
                }

                placeholderItem = new odata.SimpleShowcaseItem({ name: obj.url }); // a placeholder item to show loading state
                $scope.showcaseItems.push(placeholderItem);
                uploadExternalLink(obj.url, placeholderItem);

            });

            modalEmbedUrl.hide();
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
            PortfolioSvc.fetchOwnOfferShowcases($scope.offer.ID).then(function (response) {
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

        // listen for ImportSvc polling events
        $scope.$on(events.importer.polling.statusUpdated, function (event, status) {
            event.preventDefault();

            if ($scope.status === status) {
                return;
            }

            $scope.status = status.data;

            // update importer collections
            $scope.importersFinished = _.filter($scope.importersAvailable, function (importer) {
                return importer.Portfolio.CurrentStatus === 2 && importer.Portfolio.Count > 0;
            });

            $scope.importersFailed = _.filter($scope.importersAvailable, function (importer) {
                return importer.Portfolio.CurrentStatus === 2 && importer.Portfolio.Count === 0;
            });

            $scope.importersInProgress = _.filter($scope.importersAvailable, function (importer) {
                return $scope.importersFailed.indexOf(importer) === -1 && $scope.importersFinished.indexOf(importer) === -1;
            });

            // update portfolios
            $scope.fetchImportedPortfolios();
        });

        // when the importer polling times out, handle the remaining inProgress importers.
        $scope.$on(events.importer.polling.timeout, function () {
            var port, importerName;

            _.each($scope.importersInProgress, function (importer) {
                importerName = $filter('getProviderName')(importer);

                // check if there are at least some showcases that have been downloaded
                port = _.find($scope.importedPortfolios, function (impPortfolio) {
                    return impPortfolio.Provider === importerName;
                });

                if (port && port.hasOwnProperty('data') && port.data instanceof Array && port.data.length > 0) {
                    $scope.importersFinished.push(importer);
                } else {
                    $scope.importersFailed.push(importer);
                }
            });

            $scope.importersInProgress.empty();
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

        $scope.$on('$destroy', function () {
            ImporterSvc.stopPolling();
        });

        $scope.$watch('activeWorkSamples', function (newValue, oldValue) {
            if (!newValue || newValue === oldValue) {
                return;
            }
            newValue === 'imported' && oldValue === 'owned' && $scope.selectedPortfolios.empty();
        });

        ////////////////////////////////////////////
        /// Init
        ////////////////////////////////////////////

        CatalogueSvc.getService($scope.offer.ServiceID, true).then(function (service) {
            var offeredChoice;

            modalPageLoading.hide();

            $scope.service = service;

            _.each(service.options, function (option) {
                _.each(option.choices, function (serviceChoice) {

                    offeredChoice = _.find($scope.offer.OfferedChoices, function (offeredChoice) {
                        return offeredChoice.ServiceChoiceID === serviceChoice.ID;
                    });

                    if (option.isPriceDiscriminator) {
                        serviceChoice.price = offeredChoice ? offeredChoice.Price : 0;
                    }

                    serviceChoice.days = offeredChoice ? offeredChoice.Days : 1;

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
            modalPageLoading.hide();
            console.log(error);
        });

        $timeout(function () { $scope.panels.activePanel = 0; }); // update the UI

        ImporterSvc.checkStatus().then(function (status) {

            $scope.importersAvailable = _.filter(status, function (importer) { // check if there are any available importers
                return importer.Portfolio !== null && importer.Provider !== 5; // ignore github - no portfolios
            });

            if ($scope.importersAvailable.length > 0) {
                $scope.status = status;

                $scope.importersFinished = _.filter($scope.importersAvailable, function (importer) {
                    return importer.Portfolio.CurrentStatus === 2 && importer.Portfolio.Count > 0;
                });

                $scope.importersFailed = _.filter($scope.importersAvailable, function (importer) {
                    return importer.Portfolio.CurrentStatus === 2 && importer.Portfolio.Count === 0;
                });

                if ($scope.importersAvailable.length === $scope.importersFailed.length) {
                    NotificationSvc.show({ content: msg.error.portfoliosImportFailed, type: 'error' });
                    return;
                }

                // all portfolios have finished
                if ($scope.importersFinished.length + $scope.importersFailed.length === $scope.importersAvailable.length) {
                    $scope.fetchImportedPortfolios();

                } else { //at least some importers in progress
                    $scope.importersInProgress = _.filter($scope.importersAvailable, function (importer) {
                        return $scope.importersFailed.indexOf(importer) === -1 && $scope.importersFinished.indexOf(importer) === -1;
                    });

                    // start polling: this will emit events that will be handled by the coresponding watcher
                    ImporterSvc.startPolling({ importers: $scope.importersAvailable, delay: 5000, count: 24 }); // 2', once every 5"
                }
            }

        }, function (error) {
            console.log(error);
        });

        PortfolioSvc.fetchOwnOfferShowcases($scope.offer.ID).then(function (showcases) {
            // TODO: temporary convention. No need to attach to offer
            $scope.offer.Showcases = showcases;
            $scope.updateShowcaseItems($scope.offer.Showcases);
        });

    }]);
}());
