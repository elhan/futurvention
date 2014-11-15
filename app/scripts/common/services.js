(function () {
    'use strict';
    var app = angular.module('fvApp');

    /**
     * @ngdoc service
     * @name fvApp.service: PortfolioSvc
     * @description
     * # PortfolioSvc
     * Manage Portfolio items
     */
    app.service('PortfolioSvc', ['$http', '$q', '$timeout', function ($http, $q, $timeout) {
        var PortfolioSvc = {},
            portfolio = {};

        PortfolioSvc.updatePortfolio = function (obj) {
            angular.extend(portfolio, obj);
        };

        PortfolioSvc.getPortfolio = function () {
            return portfolio;
        };

        PortfolioSvc.fetchPortfolio = function (userId, index, offset) {
            console.log(userId, index, offset);

            // TODO: remove mock service object
            var PortfolioItem = function () {
                return {
                  title: 'Logo Design',
                  url: 'http://www.accusoft.com/html5viewer/img/btn-file-icon-ppt-sm.png',
                  name: 'btn-file-icon-ppt-sm.png'
                };
            };

            var itemCount = _.random(3, 20);
            var portfolioItems = [];

            for (var i = 0; i < itemCount; i++) {
                portfolioItems.push(new PortfolioItem());
            }

            var deferred = $q.defer();
            $timeout(function () {
                deferred.resolve({
                    items: portfolioItems
                });
            });
            return deferred.promise;
        };

        return PortfolioSvc;
    }]);

    /**
     * @ngdoc service
     * @name fvApp.service: ReviewSvc
     * @description
     * # ReviewSvc
     * Manage Reviews
     */
    app.service('ReviewSvc', ['$http', '$q', '$timeout', 'Enum', function ($http, $q, $timeout, Enum) {
        var ReviewSvc = {};

        ReviewSvc.fetchReceivedReviews = function (userId, index, offset) {
            console.log(userId, index, offset);

            // TODO: remove mock service object
            var providers = _.values(Enum.Providers);
            var randProvider = _.random(0, providers.length);

            var Review = function () {
                return {
                    reviewer: {
                        firstName: 'Mark',
                        lastName: 'Twain'
                    },
                    provider: providers[randProvider],
                    rating: _.random(1, 5),
                    timeAgo: '3 days ago',
                    text: 'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. '
                };
            };
            var itemCount = _.random(3, 20);
            var reviews = [];

            for (var i = 0; i < itemCount; i++) {
                reviews.push(new Review());
            }

            var deferred = $q.defer();
            $timeout(function () {
                deferred.resolve(reviews);
            });
            return deferred.promise;

        };

        return ReviewSvc;
    }]);

    /**
     * @ngdoc service
     * @name fvApp.service: MessagingSvc
     * @description
     * # MessagingSvc
     * Handle sending messages and email to users
     */
    app.service('MessagingSvc', ['$http', '$q', '$timeout', function ($http, $q, $timeout) {
        var MessagingSvc = {};

        MessagingSvc.sendMessage = function (receiverId, senderId, senderFirstName, senderLastName, message) {
            // TODO: remove mock functionality
            console.log(message);
            var deferred = $q.defer();
            $timeout(function () {
                deferred.resolve(message);
            });
            return deferred.promise;
        };

        return MessagingSvc;
    }]);

    /**
     * @ngdoc service
     * @name fvApp.service: NotificationSvc
     * @description
     * # NotificationSvc
     * Display alerts, system messages, notifications
     */
    app.service('NotificationSvc', ['$http', '$q', '$alert', function ($http, $q, $alert) {
        var NotificationSvc = {};

        NotificationSvc.show = function (options) {
            var alert = $alert(options);
            var deferred = $q.defer();
            deferred.resolve(alert);
            return deferred.promise;
        };

        return NotificationSvc;
    }]);

    /**
     * @ngdoc service
     * @name fvApp.service: EmbedlySvc
     * @description
     * # EmbedlySvc
     * Integration with EmbedLy API
     */
    app.service('EmbedlySvc', ['$http', 'EMBEDLY', function ($http, embedly) {
        this.oembed = function (links, maxWidth, maxHeight) {
            return $http.get([
                embedly.domain, embedly.oembedAPI,
                '?key=', embedly.key,
                '&urls=', _.pluck(links, 'url').map(encodeURI).join(','),
                '&maxwidth=', maxWidth,
                '&maxheight=', maxHeight,
                '&format=json'
            ].join(''));
        };
    }]);

}());
