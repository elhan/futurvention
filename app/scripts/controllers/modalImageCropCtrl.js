(function () {
    'use strict';

    var app = angular.module('fvApp');

    /**
     * @ngdoc Controller
     * @name fvApp.controller: OfferCtrl
     * @description
     * # OfferCtrl
     * Controls the Offer page
     */
    app.controller('ModalImageCropCtrl', ['$http', '$rootScope', '$scope', '$timeout', '$upload', 'PATHS', 'ENV', 'EVENTS', 'MESSAGES', 'Utils', 'UserSvc', 'NotificationSvc', function ($http, $rootScope, $scope, $timeout, $upload, paths, env, events, msg, utils, UserSvc, NotificationSvc) {

        $scope.file = {};

        /*
            Expose the init function on the scope, as the fv-on-drop directive needs to call it.
            progressState is passed as an argument to enable setting the initial progress state to true
            in case of a drop event.
        **/
        $scope.init = function (progressState) {
            $scope.uncroppedImage = ''; // image selected by the user for cropping
            $scope.croppedImage = ''; // final image, after cropping
            $scope.tempImage = ''; // neccessarry to avoid shadow scopping
            $scope.setProgress(progressState);
        };

        $scope.updateCroppedImage = function (img) {
            $scope.croppedImage = img;
        };

        $scope.onFileSelect =  function ($files) {
            var reader = new FileReader();

            reader.onloadstart = function () {
                $scope.setProgress(true);
            };

            reader.onload = function (e) {
                $timeout(function () {
                    $scope.uncroppedImage = e.target.result;
                    $scope.setProgress(false);
                });
            };

            reader.readAsDataURL($files[0]); // Read in the image file as a data URL.

            $scope.file = $files[0];
        };

        $scope.setProgress = function (state) {
            $scope.inProgress = state;
        };

        $scope.saveAvatar = function () {
            var fd = new FormData(),
                base64img = $scope.croppedImage.split(',').pop(),
                name = $scope.file.name.split('.').slice(0, 1)[0].concat('.png');

            fd.append(name, utils.base64toBlob(base64img, 'image/png'), name);

            $http.post(env.api.endPoint + paths.user.ownAvatar, fd, {
                withCredentials: true,
                headers: {'Content-Type': undefined },
                transformRequest: angular.identity
            }).then(function () {
                UserSvc.fetchOwnUser().then(function () { // fetch user fires an event that will notify MainCtrl to update currentUser
                    $scope.$hide();
                }, function (error) {
                    console.log(error);
                    NotificationSvc.show({ content: msg.error.generic, type: 'error' });
                });
            }, function (err) {
                // TODO: error handling
                console.log(err);
            });
        };

        $scope.init();
    }]);
}());
