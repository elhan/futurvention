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
    app.controller('OfferConfigCtrl', ['$scope', '$timeout', '$modal', '$upload', '$location', 'CatalogueSvc', 'EmbedlySvc', 'ProfileSvc', 'OfferSvc', function ($scope, $timeout, $modal, $upload, $location, CatalogueSvc, EmbedlySvc, ProfileSvc, OfferSvc) {

        ////////////////////////////////////////////
        /// Initialisation
        ////////////////////////////////////////////

        $scope.urlsToEmbed = [{ url: '' }];
        $scope.showcaseItems = [];
        $scope.offer = OfferSvc.getOffer();
        $scope.service = {};

        $scope.deadlines = ['1 day', '2 days', '3 days', '4 days', '5 days', '6 days', '7 days', '8 days', '9 days', '10 days'];
        $scope.extraDeadlines = ['1 extra day', '2 extra days', '3 extra days', '4 extra days', '5 extra days', '6 extra days', '7 extra days', '8 extra days', '9 extra days', '10 extra days'];

        OfferSvc.fetchOffer().then(function (offer) {
            offer && OfferSvc.updateOffer(offer);
            $scope.offer =  OfferSvc.getOffer();
        }, function (error) {
            console.log(error);
        });

        CatalogueSvc.getService($scope.offer.serviceName).then(function (service) {
            $scope.service = service;

            // When a new Offer is created, offer.choices is initialy empty, so it needs to be extended to include all ServiceOptions
            if ($scope.offer.choices.length > 0) {
                return;
            }

            _.each(service.ServiceOptions, function (option) {
                $scope.offer.choices.push(option);
            });

            OfferSvc.updateOffer($scope.offer);
        });

        // TODO: dynamically adjust from service model
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
        $timeout(function () { $scope.panels.activePanel = 0; }); // update the UI

        ////////////////////////////////////////////
        /// Modals & modal functions
        ////////////////////////////////////////////

        var modalEmbedUrl = $modal({
            scope: $scope,
            template: 'views/components/modalEmbedUrl.html',
            show: false,
            keyboard: false,
            animation: 'am-slide-top'
        });

        var modalCameraTag = $modal({
            scope: $scope,
            template: 'views/components/modalCameraTag.html',
            show: false,
            keyboard: false,
            backdrop: 'static',
            animation: 'am-slide-top'
        });

        $scope.showEmbedUrlModal = function () {
            modalEmbedUrl.$promise.then(function () { modalEmbedUrl.show(); });
        };

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

        $scope.addUrls = function () {
            EmbedlySvc.oembed($scope.urlsToEmbed).then(function (res) {
                _.each(res.data, function (obj) {
                    $scope.showcaseItems.push({
                        name: obj.thumbnail_url,
                        link: obj.thumbnail_url,
                        state: 'loaded'
                    });
                    $scope.closeEmbedUrlModal();
                });
            }, function (err) {
                console.log(err);
            });
        };

        ////////////////////////////////////////////
        /// Panel functions
        ////////////////////////////////////////////

        $scope.setPanelState = function (panel, state) {
            panel.state = state;
        };

        $scope.closePanel = function (panel) {
            $scope.setPanelState(panel, 'done');
            $scope.panels.activePanel = $scope.panels.indexOf(
                _.find($scope.panels, function (panel) {
                    return panel.state === 'default';
                })
            );
        };

        ////////////////////////////////////////////
        /// Other scope functions
        ////////////////////////////////////////////

        $scope.onFileSelect = function (files) {
            _.each(files, function (file) {
                var index;

                // check if the file has already been uploaded
                if (_.where($scope.showcaseItems, { name: file.name }).length > 0) {
                    return;
                }

                $scope.showcaseItems.push({
                    name: 'Loading...',
                    link: '',
                    state: 'loading' // possible states are loading, loaded, selected
                });

                index = $scope.showcaseItems.length - 1; // keep the item's correct position in the showcase collection after pushing

                $upload.upload({
                    url: 'http://localhost:3000/upload',
                    method: 'POST',
                    headers: { 'x-filename': file.name },
                    file: file,
                }).success(function () {
                    var fileReader = new FileReader();
                    fileReader.onload = function (e) {
                        $scope.$apply(function () {
                            _.assign($scope.showcaseItems[index], {
                                name: file.name,
                                link: e.target.result,
                                state: 'loaded'
                            });
                        });
                    };
                    fileReader.readAsDataURL(file);
                })
                .error(function (err) {
                    console.log(err);
                    //$scope.showcaseItems.splice(index, 1); // remove the temporary item from the showcase collection

                    //TODO: error handling - REMOVE THIS
                    var fileReader = new FileReader();
                    fileReader.onload = function (e) {
                        $scope.$apply(function () {
                            _.assign($scope.showcaseItems[index], {
                                name: file.name,
                                link: e.target.result,
                                state: 'loaded'
                            });
                        });
                    };
                    fileReader.readAsDataURL(file);
                });
            });
        };

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

        $scope.toggleSelection = function (item) {
            switch (item.state) {
                case 'selected':
                    item.state = 'loaded';
                    break;
                case 'loaded':
                    item.state = 'selected';
                    break;
                default:
                    return;
            }
        };

        $scope.toggleTextOnly = function () {
            var panel = $scope.panels[$scope.panels.activePanel];
            if (!panel.hasOwnProperty('textonly')) {
                return;
            }
            panel.textonly = ! panel.textonly;
        };

        $scope.hasAddons = function () {
            return _.find($scope.service.ServiceOptions, function (option) {
                return option.isPriceDiscriminator && option.isOptional;
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

        $scope.$on('modal.show', function () { // initialize CameraTag when the camera modal loads
            CameraTag.setup();
            CameraTag.observe('fvcam', 'published', function() {
                var cam = CameraTag.cameras['fvcam'];
                var vid = cam.getVideo();
                console.log(vid);
                //                var mp4_url = vid.formats.qvga.mp4_url;
                //                var small_thumb_url = vid.formats.qvga.small_thumb_url;
                //                var thumb_url = vid.formats.qvga.thumb_url;
                //                var video_url = vid.formats.qvga.video_url;
            });
        });

    }]);
}());