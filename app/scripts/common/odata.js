(function () {
    'use strict';
    var app = angular.module('fvApp');

    app.factory('Odata', ['Utils', function (utils) {
        var Odata = {};

        //////////////////////////////////////////////////////////////////
        /// OdataObject functions can be 'inherited' by all Odata objects.
        //////////////////////////////////////////////////////////////////

        var OdataObject = {};

        OdataObject.setMultilingual = function (key, value) {
            var self = this;

            switch (true) {
            case !value || !self.hasOwnProperty(key):
                break;
            case self[key] === null:
                self[key] = new Odata.Multilingual({
                    Literals: [new Odata.Literal({ Text: value })]
                });
                break;
            case self[key] instanceof Odata.Multilingual: // default language
                self[key].Literals[0].Text = value;
                break;
            default:
                // TODO: update language
            }

            return self;
        };

        ////////////////////////////////////////////////////////////
        /// Literal
        ////////////////////////////////////////////////////////////

        /**
         * @ngdoc class
         * @param {Object} options: extends Literal defaults
         */
        Odata.Literal = function (options) {
            var self = this;
            self.ID = 0;
            self.Text = null;
            self.LanguageID = 1;
            self.IsDefault = true;
            utils.updateProperties(self, options);
        };

//        Odata.Literal.inherits(OdataObject);

        ////////////////////////////////////////////////////////////
        /// Multilingual
        ////////////////////////////////////////////////////////////

        /**
         * Multilingual class
         * @param {Object} options: extends Multilingual defaults
         */
        Odata.Multilingual = function (options) {
            var self = this;
            self.ID = 0;
            self.Literals =  [];
            utils.updateProperties(self, options);
        };

//        Odata.Multilingual.inherits(OdataObject);

        ////////////////////////////////////////////////////////////
        /// Location
        ////////////////////////////////////////////////////////////

        /**
         * Location class
         * @param {Object} options: extends Location defaults
         */
        Odata.Location = function (options) {
            var self = this;
            self.ID = 0;
            self.ParentID = 0;
            self.Name = null;
            utils.updateProperties(self, options);
        };

//        Odata.Location.inherits(OdataObject);

        Odata.Location.method('getName', function () {
            return this.Name && this.Name.Literals[0].Text;
        });

        ////////////////////////////////////////////////////////////
        /// SellerProfile
        ////////////////////////////////////////////////////////////

        /**
         * SellerProfile class
         * @param {Object} options: extends Multilingual defaults
         */
        Odata.SellerProfile = function (options) {
            var self = this;

            self.ID = 0;
            self.Moniker = null;
            self.FirstName = null;
            self.LastName = null;
            self.Title = null;
            self.Description = null;
            self.Resume = null;
            self.Status = null;
            self.LocationID = 0;
            self.UserID = 0;
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

            utils.updateProperties(self, options);
        };

        /**
         * SellerProfile Function
         * @param {Object} importedProfile: imported profile object
         */
        Odata.SellerProfile.prototype.fromImported = function (imp) {
            if (!imp) {
                return;
            }

            var self = this;

            utils.updateProperties(self, {
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

        Odata.SellerProfile.inheritFunctions(OdataObject, ['setMultilingual']);

        /**
         * SellerProfile class
         * @param {Object} options: extends Multilingual defaults
         */
        Odata.User =  function (options) {
            var self = this;

            self.ID = 0;
            self.Guid = '';
            self.Avatar = null;
            self.AvatarID = 0;
            self.IsSystem = false;
            self.IsAnonymous = false;
            self.FirstName = null;
            self.LastName = null;
            self.PreferredLanguageID = 1;
            self.Registrations = [];
            self.Roles = [];

            utils.updateProperties(self, options);
        };

        return Odata;
    }]);

}());
