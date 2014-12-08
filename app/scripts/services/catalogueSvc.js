(function () {
    'use strict';
    var app = angular.module('fvApp');

    /**
     * @ngdoc service
     * @name fvApp.service: CatalogueSvc
     * @description
     * # CatalogueSvc
     * CRUD operations for Catalogue items (services, categories etc)
     */
    app.service('CatalogueSvc', ['$http', '$q', '$timeout', 'breeze', 'PATHS', function ($http, $q, $timeout, breeze, paths) {
        var CatalogueSvc = {},

            dataService = new breeze.DataService({
                serviceName: paths.cached,
                hasServerMetadata: false
            }),

            manager = new breeze.EntityManager({ dataService: dataService });

        //////////////////////////////////////////////////////////////////////////
        /// Filter functions transfrom odata response objects to friendly objects
        //////////////////////////////////////////////////////////////////////////

        function filterRootCategories (response) {
            return _.pluck(response.results[0].value, function (obj) {
                return {
                    categoryID: obj.ID,
                    categoryName: obj.Name.Literals[0].Text
                };
            });
        }

        function filterServices (response) {
            return _.pluck(response.results[0].value, function (obj) {
                return {
                    serviceID: obj.ID,
                    shortTitle: obj.ShortTitle.Literals[0].Text,
                    thumbnail: { link: obj.ThumbnailFile.Url }
                };
            });
        }

        function filterTotalCount (response) {
            return response.results[0]['odata.count'];
        }

        function filterFullService (response) {
            var obj = response.results[0].value[0];
            var service =  {
                serviceID: obj.ID,
                title: obj.Title && obj.Title.Literals[0].Text,
                shortTitle: obj.ShortTitle && obj.ShortTitle.Literals[0].Text,
                description: obj.Description && obj.Description.Literals[0].Text,
                deliverables: obj.ExpectedDeliverables && obj.ExpectedDeliverables.Literals[0].Text,
                provision: obj.BuyerProvision && obj.BuyerProvision.Literals[0].Text,
                options: obj.Options,
                excluded: obj.ExcludedServices && obj.ExcludedServices.Literals[0].Text,
                viewHint: obj.ViewHint,
                thumbnail: { link: obj.ThumbnailFile.Url },
                showcasePrompt: obj.ShowcasePrompt && obj.ShowcasePrompt.Literals[0].Text
            };

            service.allowedShowcaseFileTypes = _.pluck(obj.AllowedShowcaseFileTypes, function (type) {
                return type.Name && type.Name.Literals[0].Text;
            });

            service.options = obj.Options.map(function (option) {
                return {
                    ID: option.ID,
                    isPriceDiscriminator: option.IsPriceDiscriminator,
                    isMandatory: option.IsMandatory,
                    isDaysDiscriminator: option.IsDaysDiscriminator,
                    sellerTitle: option.SellerTitle && option.SellerTitle.Literals[0].Text,
                    choices: option.Choices.map(function (choice) {
                        return {
                            ID: choice.ID,
                            name: choice.Name && choice.Name.Literals[0].Text,
                            price: 0,
                            days: 1
                        };
                    })
                };
            });

            service.fields = obj.Fields.map(function (field) {
                return {
                    ID: field.ID,
                    allowedFileTypes:  _.pluck(field.AllowedFileTypes, function (type) {
                        return type.Name && type.Name.Literals[0].Text;
                    }),
                    order: field.Order,
                    isMandatory: field && field.IsRequired ? true : false,
                    sellerLabel: field && field.SellerLabel && field.SellerLabel.Literals[0].Text
                };
            });

            // service interview is the service field with order === 0
            service.interview = _.find(service.fields, function (field) {
                return field.order === 0;
            });

            // remove interview from fields
            _.remove(service.fields, function (field) {
                return field.order === 0;
            });

            return service;
        }

        ///////////////////////////////////////////////////////////
        /// Public API
        ///////////////////////////////////////////////////////////

        CatalogueSvc.services = []; // cache 'All' services
        CatalogueSvc.batch = 16; // show service thumbnails in batches of 16 (4 rows of 4 thumbnails)

        /**
         * Returns a collection of city objects
         * @public
         *
         * @returns Array[{name: String, cityID: String}]
         */
        CatalogueSvc.getRootCategories = function () {
            var deferred = $q.defer(),
                query = new breeze.EntityQuery('RootCategories').expand('Name.Literals');

            manager.executeQuery(query).then(function (response) {
                var rootCategories = filterRootCategories(response);
                // add an 'All' option to the categoryNames collection and set it as the default active category
                rootCategories.unshift({
                    categoryID: null,
                    categoryName: 'All'
                });
                deferred.resolve(rootCategories);
            }, function (error) {
                deferred.reject(error);
            });

            return deferred.promise;
        };

        /**
         * Returns a single fully expanded Service object, given a serviceID.
         * @public
         *
         * @returns {Object} a Service object
         */
        CatalogueSvc.getService = function (serviceID) {
            var deferred = $q.defer(),
                query = new breeze.EntityQuery('Services')
                    .where('ID', 'eq', serviceID)
                    .expand([
                        'Title.Literals',
                        'ShortTitle.Literals',
                        'Description.Literals',
                        'ThumbnailFile',
                        'ExpectedDeliverables.Literals',
                        'BuyerProvision.Literals',
                        'ExcludedServices.Literals',
                        'AllowedShowcaseFileTypes.Name.Literals',
                        'ShowcasePrompt.Literals',
                        'Fields',
                        'Fields.AllowedFileTypes.Name.Literals',
                        'Fields.AllowedFileTypes.MimeTypes',
                        'Fields.SellerLabel.Literals',
                        'Fields.Order',
                        'Options.SellerTitle.Literals',
                        'Options.Choices.Name.Literals'
                    ].join(', '));

            manager.executeQuery(query).then(function (response) {
                console.log(response);
                deferred.resolve(filterFullService(response));
            }, function (error) {
                deferred.reject(error);
            });

            return deferred.promise;
        };

        /**
         * Returns a collection of Service objects. If all services have been already fetched, return the cached object instead
         * of fetching fresh data from the server.
         * @public
         *
         * @returns Array[{name: String, cityID: String}]
         */
        CatalogueSvc.getServices = function (offset) {
            var deferred = $q.defer(),
                query = new breeze.EntityQuery('Services').expand('ShortTitle.Literals, ThumbnailFile');

            // return the cached object if services have already been fetched from the server
            CatalogueSvc.services.length > 0 && deferred.resolve(CatalogueSvc.services.slice(offset, offset + CatalogueSvc.batch));

            CatalogueSvc.services.length === 0 && manager.executeQuery(query).then(function (response) {
                CatalogueSvc.services = filterServices(response);
                deferred.resolve(CatalogueSvc.services.slice(offset, offset + CatalogueSvc.batch));
            }, function (error) {
                deferred.reject(error);
            });

            return deferred.promise;
        };

        /**
         * Returns a collection of Service objects filtered by categoryID
         * @public
         *
         * @returns Array[{name: String, cityID: String}]
         */
        CatalogueSvc.getServicesUnderCategory = function (categoryID, offset) {
            var deferred = $q.defer(),
                query = new breeze.EntityQuery('ServicesUnderCategory')
                    .withParameters({CategoryID: categoryID})
                    .skip(offset)
                    .take(CatalogueSvc.batch)
                    .expand('ShortTitle.Literals, ThumbnailFile')
                    .inlineCount();

            manager.executeQuery(query).then(function (response) {
                deferred.resolve({
                    services: filterServices(response),
                    totalCount: filterTotalCount (response)
                });
            }, function (error) {
                deferred.reject(error);
            });

            return deferred.promise;
        };

        return CatalogueSvc;
    }]);

}());
