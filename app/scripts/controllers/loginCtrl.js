(function () {
  'use strict';

  var app = angular.module('fvApp');

  /**
     * @ngdoc Controller
     * @name fvApp.controller:AuthCtrl
     * @description
     * # AuthCtrl
     * Controller of the login form
     */
  app.controller('LoginCtrl', ['$scope', '$rootScope', 'EVENTS', 'AuthSvc', function ($scope, $rootScope, events, AuthSvc) {
    var authEvents = events.auth;

    // the models for the registration form
    $scope.newUser = {
      email: '',
      password: ''
    };

    // initialize errors
    $scope.authError = {
      invalidEmail: false,
      invalidPassword: false
    };

    $scope.login = function (loginData) {
      AuthSvc.register(loginData).then(function () {
        //TODO
      }, function () {
        //TODO
      });
    };

    $scope.logout = function () {
      AuthSvc.register().then(function () {
        //TODO
      }, function () {
        //TODO
      });
      //            UserSvc.removeUser();
      $rootScope.$broadcast(authEvents.logoutSuccess, event);
    };

    // Login error handling
    $scope.$on('auth-login-failed', function (event, error) {
      switch (error.code) {
        case 'INVALID_USER':
          $scope.authError.invalidUser = $scope.newUser.email;
          break;
        case 'INVALID_EMAIL':
          $scope.authError.invalidEmail = $scope.newUser.email;
          break;
        case 'INVALID_PASSWORD':
          $scope.authError.invalidPassword= $scope.newUser.password;
          break;
        default: // the rest of the authentication errors should not be displayed to the user, just logged
          // TODO: add to logger when client logging is implemented
          console.log(event, error);
      }
    });

  }]);

}());
