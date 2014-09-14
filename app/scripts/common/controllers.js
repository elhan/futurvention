(function () {
    'use strict';

    var app = angular.module('fvApp');

    /**
     * @ngdoc function
     * @name fvApp.controller:MainCtrl
     * @description
     * # MainCtrl
     * Controller of the fvApp. Contains global app logic, since we use $rootScope only for event broadcasting.
     */
    app.controller('MainCtrl', ['$scope', '$location', '$modal', 'USER_ROLES', 'AuthSvc', function ($scope, $location, $modal, USER_ROLES, AuthSvc) {
        // init the currentUser object
        $scope.currentUser = null;

        // wrappers added to facilitate controller testability
        $scope.userRoles = USER_ROLES;
        $scope.isAuthorized = AuthSvc.isAuthorized;

        /*
            A setter function for the currentUser object. This is neccessary since assigning
            a new value to currentUser from a child scope would otherwise result in a shadow property.
        **/
        $scope.setCurrentUser = function (user) {
            $scope.currentUser = user;
        };

        $scope.go = function (path) {
            $location.path(path);
        };

    }]);

    /**
     * @ngdoc function
     * @name fvApp.controller:LoginCtrl
     * @description
     * # LoginCtrl
     * Controller of the login form
     */
    app.controller('LoginCtrl', ['$scope', '$rootScope', 'AUTH_EVENTS', 'AuthSvc', function ($scope, $rootScope,  AUTH_EVENTS, AuthSvc) {

        $scope.newUser = {
            firstName: '',
            lastName: '',
            email: '',
            password: ''
        };

        $scope.login = function (newUser) {
            AuthSvc.login(newUser).then(function (user) {
              console.log(user);
                $rootScope.$broadcast(AUTH_EVENTS.loginSuccess);
                $scope.setCurrentUser(user);
            }, function () {
                $rootScope.$broadcast(AUTH_EVENTS.loginFailed);
            });
        };

        $scope.loginFb = function () {
            AuthSvc.loginFb().then(function () {
                // TODO: handle responses and broadcast $rootscope events
                console.log('logged in with facebook');
            });
        };

        $scope.loginLi = function() {
            // TODO: handle responses and broadcast $rootscope events
            AuthSvc.loginLi().then(function() {
                console.log('logged in with linkedin');
            });
        };
    }]);

    /**
     * @ngdoc function
     * @name fvApp.controller:HeaderCtrl
     * @description
     * # HeaderCtrl
     * Controller of header navigation bar
     */
    app.controller('HeaderCtrl', ['$scope', '$location', function ($scope, $location) {
        // The header needs to be aware of the current location
        $scope.locationAt = function (route) {
            return route === $location.path();
        };
    }]);
}());
