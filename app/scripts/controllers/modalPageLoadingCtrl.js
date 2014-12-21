(function () {
    'use strict';

    var app = angular.module('fvApp');

    /**
     * @ngdoc Controller
     * @name fvApp.controller: ModalPageLoadingCtrl
     * @description
     * # ModalPageLoadingCtrl
     * Controls the page loading modal
     */
    app.controller('ModalPageLoadingCtrl', ['$scope', '$rootScope', 'EVENTS', function ($scope, $rootScope, events) {
        $scope.closeLoader = function () {
            $scope.$parent.$hide();
            $rootScope.$broadcast(events.ui.loaderClosed);
        };
    }]);
}());
