(function () {
    'use strict';

    var app = angular.module('fvApp');

    /**
     * @ngdoc Controller
     * @name fvApp.controller:MainCtrl
     * @description
     * # MainCtrl
     * Controller of the fvApp. Contains global app logic, since we use $rootScope only for event broadcasting.
     */
    app.controller('MainCtrl', ['$scope', '$location', 'EVENTS', 'MESSAGES', 'AccountSvc', 'NotificationSvc', function ($scope, $location, events, msg, AccountSvc, NotificationSvc) {

        /*
            A setter function for the currentUser object. This is neccessary since assigning
            a new value to currentUser from a child scope would otherwise result in a shadow property.
        **/
        $scope.setCurrentUser = function (user) {
            $scope.currentUser = user;
        };

        $scope.updateCurrentUser = function (obj) {
            angular.extend($scope.currentUser, obj);
        };

        $scope.go = function (path) {
            $location.path(path);
        };

        $scope.locationAt = function (route) {
            return route === $location.path();
        };

        ////////////////////////////////////////////
        /// Event handling
        ////////////////////////////////////////////

        $scope.$on('$routeChangeError', function (e, current, previous, rejection) {
            console.log(rejection);
            $scope.go('/');
        });

        $scope.$on(events.auth.loginSuccess, function () {
            AccountSvc.getUserInfo().then(function (user) {
                $scope.setCurrentUser = user;
                // TODO redirect user depending on profile completetion state
                $scope.locationAt('/register') ? $scope.go('/apply') : $scope.go('/');
            }, function () {
                NotificationSvc.show({
                    content: msg.error.generic,
                    type: 'error',
                    dismissable: true
                });
            });
        });

        $scope.$on(events.auth.logoutSuccess, function () {
            $scope.setCurrentUser({});
            $scope.go('/');
        });

        $scope.$on(events.auth.logoutFailed, function () {
            NotificationSvc.show({
                content: msg.error.logoutFailed,
                type: 'error',
                dismissable: true
            });
        });

    }]);

}());
