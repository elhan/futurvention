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
    app.controller('ModalImageCropCtrl', ['$rootScope', '$scope', '$timeout', '$upload', 'ProfileSvc', 'EVENTS', function ($rootScope, $scope, $timeout, $upload, ProfileSvc, events) {

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
        };

        $scope.setProgress = function (state) {
            $scope.inProgress = state;
        };

        $scope.saveProfileImage = function () {
            $upload.upload({
                url: 'https://futurvention.azurewebsites.net/api/Self/Avatar',
                file: $scope.croppedImage
            }).then(function () {
                ProfileSvc.fetchOwnProfile().then(function () { // update profile
                    $rootScope.$broadcast(events.profile.profileUpdated);
                }, function (error) {
                    console.log(error);
                });
            }, function (err) {
                // TODO: error handling
                console.log(err);
            });
        };

        $scope.init();
    }]);
}());
