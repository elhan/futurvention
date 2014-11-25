(function () {
    'use strict';
    var app = angular.module('fvApp');

    app.factory('Odata', ['Utils', 'PROVIDERS_ENUM', function (utils, providers) {
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
         * @constructor
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

        ////////////////////////////////////////////////////////////
        /// Multilingual
        ////////////////////////////////////////////////////////////

        /**
         * @constructor
         * @param {Object} options: extends Multilingual defaults
         */
        Odata.Multilingual = function (options) {
            var self = this;
            self.ID = 0;
            self.Literals =  [];
            utils.updateProperties(self, options);
        };

        ////////////////////////////////////////////////////////////
        /// Location
        ////////////////////////////////////////////////////////////

        /**
         * @constructor
         * @param {Object} options: extends Location defaults
         */
        Odata.Location = function (options) {
            var self = this;
            self.ID = 0;
            self.ParentID = 0;
            self.Name = null;
            utils.updateProperties(self, options);
        };

        Odata.Location.method('getName', function () {
            return this.Name && this.Name.Literals[0].Text;
        });

        ////////////////////////////////////////////////////////////
        /// SellerProfile
        ////////////////////////////////////////////////////////////

        /**
         * @constructor
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
//            self.User = null;

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
         * @constructor
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
         * @constructor
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

        /**
         * @constructor
         * @param {Object} options: extends defaults
         */
        Odata.File = function (options) {
            var self = this;

            /** @type FileType */
            self.FileType = null;

            /** @type Integer */
            self.FileTypeID = null;

            /** @type Multilingual */
            self.Name = null;

            /** @type Integer */
            self.OwnerID = 0;

            utils.updateProperties(self, options);
        }

        /**
         * @constructor
         * @param {Object} options: extends defaults
         */
        Odata.FileType = function (options) {
            var self = this;

            /** @type Integer */
            self.ID = 0;

            /** @type Multilingual */
            self.Name = 0;

            /** @type Array.<ServiceField> */
            self.AllowedInServiceFields = [];

            /** @type Array.<Service> */
            self.AllowedInServices = [];

            /** @type Enum */
            self.MediumCategory = 0;

            /** @type Array.<MimeType> */
            self.MimeTypes = 0;

            utils.updateProperties(self, options);
        }

        /**
         * @constructor
         * @param {Object} options: extends defaults
         */
        Odata.Showcase = function (options) {
            var self = this;

            /** @type Multilingual */
            self.Description = null;

            /** @type Multilingual */
            self.Title = null;

            /** @type Array.<ShowcaseItem> */
            self.Items = [];

            /** @type Array.<Offer> */
            self.Offers = [];

            /** @type Integer */
            self.Order = 0;

            /** @type Integer */
            self.SellerProfileID = 0;

            /** @type Integer */
            self.SourceID = 0;

            utils.updateProperties(self, options);
        }

        Odata.Showcase.prototype.fromImported =  function (imp) {
            if (!imp) {
                return;
            }

            var self = this;

            utils.updateProperties(self, {
                Description: imp.Description ? new Odata.Multilingual({ Literals: [ new Odata.Literal({ Text: imp.Description }) ] }) : null,
                Title: new Odata.Multilingual({ Literals: [ new Odata.Literal({ Text: imp.Description }) ] }),
                Items: [ new Odata.ShowcaseItem().fromImported(imp) ]
            });

            return self;
        };

        /**
         * @constructor
         * @param {Object} options: extends defaults
         */
        Odata.ShowcaseItem = function (options) {
            var self = this;

            /** @type Multilingual */
            self.Description = null;

            /** @type Multilingual */
            self.Title = null;

            /** @type Integer */
            self.Order = 0;

            /** @type Integer */
            self.ShowcaseID = 0;

            /** @type Showcase */
            self.Showcase = null;

            /** @type Integer */
            self.FileID = 0;

            /** @type File */
            self.File = null;

            /** @type Integer */
            self.ThumbnailID = 0;

            /** @type File */
            self.Thumbnail = null;

            utils.updateProperties(self, options);
        }

        /**
         * Creates a new Showcase item from an imported showcase object
         * @param {Object} imp:  An imported portfolio item
         * @param {Showcase} showcase: The Showcase to which this ShowcaseItem belongs
         * @returns {ShowcaseItem}
         */
        Odata.ShowcaseItem.prototype.fromImported =  function (imp, showcase) {
            if (!imp) {
                return;
            }

            var self = this;

            utils.updateProperties(self, {
                Description: imp.Description ? new Odata.Multilingual({ Literals: [ new Odata.Literal({ Text: imp.Description }) ] }) : null,
                Title: new Odata.Multilingual({ Literals: [ new Odata.Literal({ Text: imp.Description }) ] }),
                File: new Odata.File().fromImported(imp),
                Thumbnail: new Odata.File().fromImported(imp, 'thumbnail'),
                Showcase: showcase ? showcase : null
            });

            return self;
        };

        return Odata;
    }]);

}());
