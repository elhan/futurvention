(function () {
    'use strict';
    var app = angular.module('fvApp');

    app.factory('Odata', function () {
        var Odata = {};

        /**
         * @ngdoc class
         * @param {Object} options: extends Literal defaults
         */
        Odata.Literal = function (options) {
            var self = this;

            self.Text = null;
            self.LanguageID = 1;
            self.IsDefault = true;

            angular.extend(self, options);
        };

        /**
         * Multilingual class
         * @param {Object} options: extends Multilingual defaults
         */
        Odata.Multilingual = function (options) {
            var self = this;

            self.ID =  0;
            self.Literals =  [];

            angular.extend(self, options);
        };

        /**
         * Location class
         * @param {Object} options: extends Location defaults
         */
        Odata.Location = function (options) {
            var self = this;

            self.ID = 0;
            self.ParentID = 0;
            self.Name = null;

            angular.extend(self, options);
        };

        /**
         * SellerProfile class
         * @param {Object} options: extends Multilingual defaults
         */
        Odata.SellerProfile = function (options) {
            var self = this;

            self.Moniker = null;
            self.FirstName = null;
            self.LastName = null;
            self.Title = null;
            self.Description = null;
            self.Resume = null;
            self.Status = null;
            self.LocationID = 0;
            self.PhotoID = 0;
            self.User = null;

            /**
             * @ngdoc property
             * @returns {Array<Odata.Showcase>}
             * @description
             * A collection of Showcases
             */
            self.Showcases = [];

            /**
             * @ngdoc property
             * @returns {Array<Odata.Review>}
             * @description
             * A collection of Reviews
             */
            self.Reviews = [];

            self.ProfileID = 0;

            angular.extend(self, options);
        };

        /**
         * SellerProfile Function
         * @param {Object} importedProfile: imported profile object
         */
        Odata.SellerProfile.prototype.fromImported = function (imp) {
            var self = this;

            if (!imp) {
                return;
            }

            angular.extend(self, {
                FirstName: imp.FirstName,
                LastName: imp.LastName,
                Description: new Odata.Multilingual({
                    Literals: [new Odata.Literal({ Text: imp.Bio })]
                }),
                Title: new Odata.Multilingual({
                    Literals: [new Odata.Literal({ Text: imp.Headline })]
                })
            });

            return self;
        };

        return Odata;
    });

}());
