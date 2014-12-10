(function () {
    'use strict';

    var app = angular.module('fvApp');

    /**
     * @ngdoc directive
     * @name fvApp.directive: fv-order-box
     * @restrict E
     *
     * @description
     * Creates a custom order box element. The following rules regarding ServiceOptions,
     * ServiceOption.Choices, OfferedChoices are valid, but not database restrains:
     *
     * 1. Only one option can be both mandatory & price discriminator
     * 2. Addons are non-mandatory price discriminators
     * 3. Addons have one choice at most
     * 4. Price discriminators are always days discriminators too
     * 5. Filters are service options that are not price discriminators. They are ignored
     *    by this directive
     * 6. Interviews are always the first servic field. All services have exactly one interview.
     *    Interviews can be answered by text or video.
     * 7. Services can have a maximum of one extra field, ανδ ιτ is always ansered by text.
     *
     * @example
     * <fv-order-box offer="offer"></fv-order-box>
     */
    app.directive('fvOrderBox', ['$location', 'MESSAGES', 'EVENTS', 'ProfileSvc', 'OfferSvc', 'NotificationSvc', function ($location, msg, events, ProfileSvc, OfferSvc, NotificationSvc) {
        return {
            restrict: 'E',
            scope: {
                offer: '='
            },
            replace: true,
            templateUrl: 'views/directives/fv-order-box.html',
            link: function (scope) {

                var addon,
                    offer = scope.offer,
                    service = scope.offer.Service;

                ///////////////////////////////////////////////////////////
                /// Scope variables
                ///////////////////////////////////////////////////////////

                scope.addons = [];
                scope.mainPriceDiscriminator = {};
                scope.isCurrentUser = false;

                ///////////////////////////////////////////////////////////
                /// Scope functions
                ///////////////////////////////////////////////////////////

                scope.editOffer = function () {
                    OfferSvc.fetchOwnOffer(service.ID).then(function () {
                        ProfileSvc.setActiveStep('offer_config');
                        $location.path('/apply');
                    }, function () {
                        NotificationSvc.show({ content: msg.error.generic, type: 'error' });
                    });
                };

                ///////////////////////////////////////////////////////////
                /// Watchers
                ///////////////////////////////////////////////////////////

                scope.$on(events.profile.fetchProfileSuccess, function (event, isCurrentUser) {
                    scope.isCurrentUser = isCurrentUser;
                });

                ///////////////////////////////////////////////////////////
                /// Initialization
                ///////////////////////////////////////////////////////////

                _.each(service.Options, function (option) {
                    switch (true) {
                    case !option.IsPriceDiscriminator: // ignore filters
                        break;
                    case option.IsMandatory:
                        scope.mainPriceDiscriminator = option;
                        break;
                    default:
                        scope.addons.push(option);
                    }
                });

                _.each(offer.OfferedChoices, function (offeredChoice) {

                    addon = _.find(scope.addons, function (option) {
                        return option.ID === offeredChoice.ServiceChoice.Option.ID;
                    });

                    if (addon) {
                        addon.Choices[0].price = offeredChoice.Price;
                        addon.Choices[0].days = offeredChoice.Days;
                    }

                    _.each(scope.mainPriceDiscriminator.Choices, function (serviceChoice) {
                        if (serviceChoice.ID === offeredChoice.ServiceChoiceID) {
                            serviceChoice.price = offeredChoice.Price;
                            serviceChoice.days = offeredChoice.Days;
                        }
                    });
                });
            }
        };
    }]);

}());
