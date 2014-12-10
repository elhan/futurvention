  (function () {
    'use strict';

    var app = angular.module('fvApp');

    /**
     * @ngdoc directive
     * @name fvApp.directive: fv-order-box
     * @restrict E
     *
     * @description
     * Creates a custom order box element.
     *
     * @example
     * <fv-order-box offer={{offer}}></fv-order-box>
     */
    app.directive('fvOrderBox', function() {
        return {
            restrict: 'E',
            scope: {
                offer: '='
            },
            replace: true,
            templateUrl: 'views/directives/fv-order-box.html',
            link: function (scope) {

                var mainPriceDiscriminator,
                    service = scope.service,
                    offer = scope.offer;

                scope.addons = [];

                _.each(service.Options, function (option) {
                    switch (true) {
                    case !option.IsPriceDiscriminator: // ignore filters
                        break;
                    case option.IsMandatory:
                        mainPriceDiscriminator = option;
                        break;
                    default:
                        scope.addons.push(option);
                    }
                });

                //TODO: remove mock data
//                scope.addons = [
//                    {
//                        text: 'Unlimited revisions',
//                        value: 20
//                    },
//                    {
//                        text: '3 initial concepts',
//                        value: 30
//                    },
//                    {
//                        text: '1 day delivery',
//                        value: 30
//                    }
//                ];

            }
        };
    });

}());
