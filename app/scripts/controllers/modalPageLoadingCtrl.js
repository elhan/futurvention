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
    app.controller('ModalPageLoadingCtrl', ['$scope', '$rootScope', 'EVENTS', 'ImporterSvc', function ($scope, $rootScope, events, ImporterSvc) {
        $scope.closeLoader = function () {
            $scope.$parent.$hide();
            ImporterSvc.stopPolling();
        };
    }]);
}());