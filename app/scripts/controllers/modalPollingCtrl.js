(function () {
    'use strict';

    var app = angular.module('fvApp');

    /**
     * @ngdoc Controller
     * @name fvApp.controller: ModalPollingCtrl
     * @description
     * # ModalPollingCtrl
     * Controls the page loading modal
     */
    app.controller('ModalPollingCtrl', ['$scope', '$rootScope', 'EVENTS', 'ImporterSvc', function ($scope, $rootScope, events, ImporterSvc) {
        $scope.closeLoader = function () {
            $scope.$parent.$hide();
            ImporterSvc.stopPolling();
        };
    }]);
}());
