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
    app.controller('HeaderCtrl', ['$rootScope', '$scope', 'EVENTS', 'AccountSvc', function ($rootScope, $scope, events, AccountSvc) {

        $scope.dropdown = [];

        $scope.logout = function () {
            AccountSvc.logout().then(function () {
                $rootScope.$broadcast(events.auth.logoutSuccess);

                // Reset the dropdown as the enw user might not have a profile yet!
                $scope.dropdown = [
                    {
                        text: 'Change Password',
                        href: '#resetPassword'
                    },
                    {
                        divider: true
                    },
                    {
                        text: 'Signout',
                        click: $scope.logout
                    }
                ];

            }, function (error) {
                $rootScope.$broadcast(events.auth.logoutFailed, event, error);
            });
        };

        // allow users to logout even if they do not yet have a seller profile
        $scope.dropdown = [
            {
                text: 'Change Password',
                href: '#resetPassword'
            },
            {
                divider: true
            },
            {
                text: 'Signout',
                click: $scope.logout
            }
        ];

        // allow users to navigate to their seller profile if they have one
        $scope.$on(events.profile.fetchProfileSuccess, function () {

            if (!($scope.currentUser && $scope.currentUser.Profile)) {
                return;
            }

            if ($scope.currentUser.Profile.Moniker) {
                $scope.dropdown = [
                    {
                        text: 'My Profile',
                        href: '#' + $scope.currentUser.Profile.Moniker
                    },
                    {
                        text: 'Change Password',
                        href: '#resetPassword'
                    },
                    {
                        divider: true
                    },
                    {
                        text: 'Signout',
                        click: $scope.logout
                    }
                ];
            }
        });

    }]);

}());
