(function () {
    'use strict';

    var app = angular.module('fvApp');

    /**
     * @ngdoc Controller
     * @name fvApp.controller: MyPaymentsController
     * @description
     * # MyPaymentsController
     * Controls teh myPayments page
     */
    app.controller('MyPaymentsController', ['$scope', function ($scope) {
        $scope.activePanel = 0;
    }]);

}());
