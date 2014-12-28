(function () {
    'use strict';
    var app = angular.module('fvApp');

    /**
     * @ngdoc service
     * @name fvApp.service: NotificationSvc
     * @description
     * # NotificationSvc
     * Display alerts, system messages, notifications
     */
    app.service('NotificationSvc', ['$http', '$q', '$alert', function ($http, $q, $alert) {
        var NotificationSvc = {};

        NotificationSvc.show = function (options) {
            var alert = $alert(options);
            var deferred = $q.defer();
            deferred.resolve(alert);
            return deferred.promise;
        };

        return NotificationSvc;
    }]);

}());
