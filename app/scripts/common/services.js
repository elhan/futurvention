(function () {
    'use strict';
    var app = angular.module('fvApp');

    /**
     * @ngdoc service
     * @name fvApp.service:SessionSvc
     * @description
     * # SessionSvc
     * A singleton object following the service style to keep the user's session info.
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
     * @name fvApp.service:AuthSvc
     * @description
     * # AuthSvc
     * A service to handle authentication and authorization.
     */
    app.factory('AuthSvc', ['$http', 'SessionSvc', function ($http, SessionSvc) {
        var authSvc = {};

        authSvc.login = function (credentials) {
            return $http
            .post('/login', credentials)
            .then(function (res) {
                SessionSvc.create(res.data.id, res.data.user.id, res.data.user.role);
                return res.data.user;
            });
        };

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

        return authSvc;
    }]);
}());
