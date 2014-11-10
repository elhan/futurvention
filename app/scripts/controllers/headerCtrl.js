(function () {
    'use strict';

    var app = angular.module('fvApp');

    /**
     * @ngdoc Controller
     * @name fvApp.controller:HeaderCtrl
     * @description
     * # HeaderCtrl
     * Controls the application header
     */
    app.controller('HeaderCtrl', ['$scope', '$rootScope', 'EVENTS', 'AccountSvc', function ($scope, $rootScope, events, AccountSvc) {
        $scope.logout = function () {
            AccountSvc.logout().then(function () {
                $rootScope.$broadcast(events.auth.logoutSuccess, event);
            }, function (error) {
                $rootScope.$broadcast(events.auth.logoutFailed, event, error);
            });
        };
    }]);

}());
