(function () {
    'use strict';
    var app = angular.module('fvApp');

    app.factory('Odata', ['PROVIDERS_ENUM', 'PATHS', 'Utils', function (providers, paths, utils) {
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

        OdataObject.multilingualToString = function (key) {
            if (!key || _.keys(this, key).indexOf(key) === -1) {
                return;
            }

            return this[key].Literals[0].Text;
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
            self.Literals =  [ new Odata.Literal() ];
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
            return this.multilingualToString('Name');
        });

        Odata.Location.inheritFunctions(OdataObject, ['setMultilingual', 'multilingualToString']);

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
            self.Title = new Odata.Multilingual();
            self.Description = new Odata.Multilingual();
            self.Resume = null;
            self.Status = null;
            self.Location = null;
            self.LocationID = 0;

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

        Odata.SellerProfile.prototype.getCity = function () {
            return utils.removeParenthesis(new Odata.Location(this.Location).multilingualToString('Name'));
        };

        Odata.SellerProfile.inheritFunctions(OdataObject, ['setMultilingual', 'multilingualToString']);

        ////////////////////////////////////////////////////////////
        /// user
        ////////////////////////////////////////////////////////////

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
        };

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
        };

        /**
         * @constructor
         * @param {Object} options: extends defaults
         */
        Odata.Showcase = function (options) {
            var self = this;

            /** @type Integer */
            self.ID = 0;

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
        };

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

            /** @type Integer */
            self.ID = 0;

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
        };

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

        /**
         * Creates a new SimpleShowcaseItem using the properties of this ShowcaseItem. Modifying
         * properties explicitly is supported by the addition of the options object.
         * @param {Object} imp:  An imported portfolio item
         * @param {Showcase} showcase: The Showcase to which this ShowcaseItem belongs
         * @returns {ShowcaseItem}
         */
        Odata.ShowcaseItem.prototype.toSimpleShowcaseItem = function (options) {
            var self = this;
            return utils.updateProperties(new Odata.SimpleShowcaseItem({
                ID: self.ID,
                name: self.Title.Literals[0] && self.Title.Literals[0].Text,
                link: self.getThumbnail(),
                file: self.File
            }), options);
        };

        Odata.ShowcaseItem.prototype.getThumbnail = function () {
            // TODO: proper handling
            if (!this.Thumbnail) {
                return 'images/thumb.png';
            }
            return this.Thumbnail.hasOwnProperty('Url') ? this.Thumbnail.Url : paths.file.hosted + this.Thumbnail.RelativeUrl;
        };

        Odata.ShowcaseItem.prototype.getFileLink = function () {
            return this.File.hasOwnProperty('Url') ? this.File.Url : paths.file.hosted + this.File.RelativeUrl;
        };

        /**
         * Creates a new SimpleShowcaseItem to be used by templates
         * @param {Object} options:  overrides the default object properties
         * @returns {SimpleShowcaseItem}
         */
        Odata.SimpleShowcaseItem = function (options) {
            var self = this;

            /** @type Integer */
            self.ID = 0;

            /** @type {String} */
            self.name = '';

            /** @type {String} */
            self.link = '';

            /** @type {String} loading | loaded | selected */
            self.state = 'loading';

            utils.updateProperties(self, options);
        };

        /**
         * Creates a new SimpleShowcaseItem to be used by templates
         * @param {Object} options:  overrides the default object properties
         * @returns {SimpleShowcaseItem}
         */
        Odata.OfferField = function (options) {
            var self = this;

            /** @type Integer */
            self.ID = 0;

            /** @type Integer */
            self.OfferID = 0;

            utils.updateProperties(self, options);
        };

        /**
         * Creates a new OfferedChoice
         * @param {Object} options:  overrides the default object properties
         * @returns {OfferedChoice}
         */
        Odata.OfferedChoice = function (options) {
            var self = this;

            /** @type Integer */
            self.ID = 0;

            /** @type Integer */
            self.OfferID = 0;

            /** @type Integer */
            self.Days = 0;

            /** @type Integer */
            self.Price = 0;

            /** @type Integer */
            self.ServiceChoiceID = 0;

            self.ServiceChoice = {};

            utils.updateProperties(self, options);
        };

        return Odata;
    }]);

}());
