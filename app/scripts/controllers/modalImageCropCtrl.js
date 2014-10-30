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
    app.controller('ModalImageCropCtrl', ['$scope', 'ProfileSvc', '$timeout', 'EVENTS', function ($scope, ProfileSvc, $timeout, events) {

        $scope.profileImage = ProfileSvc.getProfile().image; // default, in case the user already has a profile image

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

        // expose this on scope as some form inputs need to be aware of the profile completion state
        $scope.getProfile = function () {
            return ProfileSvc.getProfile();
        };

        $scope.saveProfileImage = function () {
            ProfileSvc.saveProfileImage($scope.croppedImage).then(function (res) {
                console.log(res);
                ProfileSvc.updateProfile({ image: $scope.croppedImage });
                $scope.profileImage = angular.copy($scope.croppedImage);
                $scope.$emit(events.profile.profileImageUpdated);
                $scope.$hide();
            }, function (err) {
                // TODO: error handling
                console.log(err);
            });
        };

        $scope.init();
    }]);
}());
