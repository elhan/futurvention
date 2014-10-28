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
                offer: '@',
            },
            templateUrl: 'views/directives/fv-order-box.html',
            link: function (scope) {
                //TODO: remove mock data
                scope.priceDiscriminators = [
                    {
                        text: '500 words',
                        value: 10
                    },
                    {
                        text: '700 words',
                        value: 12
                    },
                    {
                        text: '1000 words',
                        value: 15
                    }
                ];

                //TODO: remove mock data
                scope.addons = [
                    {
                        text: 'Unlimited revisions',
                        value: 20
                    },
                    {
                        text: '3 initial concepts',
                        value: 30
                    },
                    {
                        text: '1 day delivery',
                        value: 30
                    }
                ];

            }
        };
    });

}());
