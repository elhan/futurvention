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
    app.controller('MainCtrl', ['$scope', '$location', 'EVENTS', function ($scope, $location, events) {

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
            rejection === events.profile.fetchProfileFailed && $scope.go('/');
        });

        // update Session object and currentUser model on logout
        $scope.$on('auth-logout-success', function (event) {
            $scope.setCurrentUser({});
            $scope.go('/');
            // TODO: add proper logging
            console.log(event);
        });

        // update Session object and currentUser model on login
        $scope.$on('auth-login-success', function (event) {
            // if the user just registered, redirect him to seller application flow
            $scope.locationAt('/register') ? $scope.go('/apply') : $scope.go('/');
            // TODO: add proper logging
            console.log(event);
        });
    }]);

}());
