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
                offer: '=',
            },
            replace: true,
            templateUrl: 'views/directives/fv-order-box.html',
            link: function (scope) {

                var service = scope.offer.Service;

                scope.priceDiscriminators = _.pick(service.Options, function (option) {
                    return option.IsPriceDiscriminator && option.IsMandatory;
                });

                scope.addons = _.pick(service.Options, function (option) {
                    return option.IsPriceDiscriminator && !option.IsMandatory;
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
