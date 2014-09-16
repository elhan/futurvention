(function () {
    'use strict';
    var app = angular.module('fvApp');

    /**
     * @ngdoc service
     * @name fvApp.service:SessionSvc
     * @description
     * # SessionSvc
     * A singleton object following the service style to cash the user's session info.
     */
    app.service('SessionSvc', function () {
        this.create = function (sessionId, userId, userRole) {
            this.id = sessionId;
            this.userId = userId;
            this.userRole = userRole;
        };
        this.destroy = function () {
            this.id = null;
            this.userId = null;
            this.userRole = null;
        };
        return this;
    });

    /**
     * @ngdoc service
     * @name fvApp.service:LocalStorageSvc
     * @description
     * # LocalStorageSvc
     * A service for interacting with the localStorage object.
     */
    app.service('LocalStorageSvc', function () {
        this.getSession = function () {
            return JSON.parse(localStorage.getItem('firebaseSession'));
        };
        return this;
    });

    /**
     * @ngdoc service
     * @name fvApp.service:AuthSvc
     * @description
     * # AuthSvc
     * A service to handle email authentication and authorization.
     */
    app.factory('AuthSvc', ['$http', '$linkedIn', '$firebaseSimpleLogin', 'SessionSvc', 'FIREBASE', function ($http, $linkedIn, $firebaseSimpleLogin, SessionSvc, FIREBASE) {
        var authSvc = {};

        authSvc.isAuthenticated = function () {
            return !!SessionSvc.userId;
        };

        authSvc.isAuthorized = function (authorizedRoles) {
            if (!angular.isArray(authorizedRoles)) {
                authorizedRoles = [authorizedRoles];
            }
            return (authSvc.isAuthenticated() &&
                    authorizedRoles.indexOf(SessionSvc.userRole) !== -1);
        };

        authSvc.firebaseAuth =  function () {
            return $firebaseSimpleLogin(new Firebase(FIREBASE.URL));
        };

//        authSvc.login = function (user) {
//            return $http
//            .post('/login', user)
//            .then(function (res) {
//              console.log(res);
//                SessionSvc.create(res.data.id, res.data.user.id, res.data.user.role);
//                return res.data.user;
//            });
//        };
//
//        // login with Facebook
//        authSvc.loginFb = function () {
//            return Facebook.login(function(res) {
//                // TODO: contact the server, retrieve user info, create a Session object...
//                console.log(res);
//            });
//        };
//
//        // check if the user is logged in with Facebook
//        authSvc.getFbLoginStatus = function() {
//            Facebook.getLoginStatus(function(res) {
//                // TODO: contact the server, retrieve user info, create a Session object...
//                console.log(res);
//            });
//        };
//
//        authSvc.loginLi = function() {
//            return $linkedIn.authorize().then(function () {
//                // TODO: contact the server, retrieve user info, create a Session object...
//                console.log('linkedin auth success');
//            });
//        };
//
        return authSvc;
    }]);
}());
