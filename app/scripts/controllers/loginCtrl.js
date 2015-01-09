(function () {
    'use strict';

    var app = angular.module('fvApp');

    /**
     * @ngdoc Controller
     * @name fvApp.controller:LoginCtrl
     * @description
     * # LoginCtrl
     * Controller of the login form
     */
    app.controller('LoginCtrl', ['$scope', '$rootScope', '$alert', '$timeout', 'EVENTS', 'MESSAGES', 'Utils', 'AccountSvc', function ($scope, $rootScope, $alert, $timeout, events, msg, utils, AccountSvc) {

        $scope.email = '';
        $scope.password = '';
        $scope.rememberMe = false;

        // initialize errors
        $scope.authError = false;

        $scope.clearAuthError =  function () {
            $scope.authError = false;
        };

        $scope.loginInProgress = false;

        $scope.login = function (provider) {
            var warningAlert, warningTimeout;

            warningAlert = $alert({ content: msg.warning.tooLong, type: 'warning', dismissable: true, show: false, duration: false });

            warningTimeout = $timeout(function() {
                warningAlert.show();
            }, 10000, false);

            $scope.loginInProgress = true;

            if (provider) { // Facebook or LinkedIn
                AccountSvc.externalLogin(provider);
                return;
            }

            AccountSvc.login({ email: $scope.email, password: $scope.password, rememberMe: $scope.rememberMe }).then(function (response) {
                $scope.loginInProgress = false;
                $timeout.cancel(warningTimeout);

                try { // this trhows an error if it is not open
                    warningAlert.hide();
                } catch (error) {
                    // TODO: proper logging
                    console.log(error);
                }

                if (response.status === 401) {
                    $scope.authError = msg.error.wrongCredentials;
                    $rootScope.$broadcast(events.auth.loginFailed);
                } else {
                    $rootScope.$broadcast(events.auth.loginSuccess);
                }

            }, function (error) {
                var errorMsg;
                console.log(error);

                $rootScope.$broadcast(events.auth.loginFailed);

                $scope.loginInProgress = false;
                $timeout.cancel(warningTimeout);

                try { // this trhows an error if it is not open
                    warningAlert.hide();
                } catch (error) {
                    // TODO: proper logging
                    console.log(error);
                }

                if (error.status === 400) { // wrong email format
                    try {
                        errorMsg = error.data.ModelState['Email'][0]; // loginModel.Email is a key on ModelState
                        $scope.authError = msg.error.wrongCredentials;
                    } catch (error) { // server data was not formed correctly
                        console.log(error);
                        $scope.authError =  msg.error.generic;
                    }

                } else {
                    $scope.authError =  msg.error.generic;
                }
            });
        };

    }]);

}());
