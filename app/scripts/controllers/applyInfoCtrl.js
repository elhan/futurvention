(function () {
    'use strict';

    var app = angular.module('fvApp');

    /**
     * @ngdoc Controller
     * @name fvApp.controller:ApplyInfoCtrl
     * @description
     * # ApplyInfoCtrl
     * Controls the apply 'info' step
     */
    app.controller('ApplyInfoCtrl', ['$scope', '$modal', '$timeout', 'ProfileSvc', function ($scope, $modal, $timeout, ProfileSvc) {
        var modalImageCrop = $modal({
            scope: $scope,
            template: 'views/components/modalImageCrop.html',
            show: false,
            animation: 'am-slide-top',
            keyboard: true
        });

        $scope.personalUrlExists = false; // true if the user has set a url that already exists. Used to display error label
        $scope.profileImage = ProfileSvc.getProfile().image; // default, in case the user already has a profile image
        $scope.countries = ProfileSvc.getCountries(); // all available countries - used to populate the dropdown

        $scope.personalUrl = '';
        $scope.title = '';
        $scope.title = '';
        $scope.city = '';
        $scope.country = '';

        $scope.closeModal = function () {
            $scope.init(false);
            modalImageCrop.hide();
        };

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

        $scope.showImageCropModal = function () {
            modalImageCrop.$promise.then(function () {
                $scope.croppedImage = ''; // reset the croppedImage object
                modalImageCrop.show();
            });
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

        $scope.setProgress = function (state) { $scope.inProgress = state; };

        // expose this on scope as some form inputs need to be aware of the profile completion state
        $scope.getProfile = function () {
            return ProfileSvc.getProfile();
        };

        $scope.saveProfileImage = function () {
            ProfileSvc.saveProfileImage($scope.croppedImage).then(function (res) {
                console.log(res);
                ProfileSvc.updateProfile({ image: $scope.croppedImage });
                $scope.profileImage = angular.copy($scope.croppedImage);
                $scope.closeModal();
            }, function (err) {
                // TODO: error handling
                console.log(err);
            });
        };

        $scope.savePersonalUrl = function () {
            ProfileSvc.savePersonalUrl($scope.personalUrl).then(function (res) {
                console.log(res);
                ProfileSvc.updateProfile({ personalUrl: $scope  .personalUrl });
            }, function (err) {
                console.log(err);
                // TODO: check for specific 'url exists' error
                $scope.personalUrlExists = true;
            });
        };

        // on continue, save the rest of the user's info
        $scope.continue = function () {
            var info = {
                firstName: $scope.currentUser.firstName,
                lastName: $scope.currentUser.lastName,
                title: $scope.title,
                bio: $scope.bio,
                city: $scope.city,
                country: $scope.country
            };
            ProfileSvc.saveProfile(info).then(function (res) {
                console.log(res);
                ProfileSvc.updateProfile(info); // update the cached Profile object once the server has persisted it
                console.log(ProfileSvc.getProfile());
                $scope.goToStep(2);
            }, function (err) {
                // TODO: handle error
                console.log(err);
            });
        };
        $scope.init();
    }]);

}());
