(function () {
    'use strict';
    var app = angular.module('fvApp');

    app.filter('trusted', ['$sce', function ($sce) {
        return function (url) {
            return $sce.trustAsResourceUrl(url);
        };
    }]);

    app.filter('prizmUrl', function () {
        return function (url) {
            return [
                'http://connect.ajaxdocumentviewer.com/?key=K4102014161530&viewertype=html5&document=',
                url,
                '&viewerheight=100%&viewerwidth=100%&printButton=Yes&toolbarColor=CCCCCC'
            ].join('');
        };
    });

    app.filter('initial', function () {
        return function (str) {
            return str.charAt(0).concat('.');
        };
    });

//    app.filter('isOfferedService', function () {
//        return function (services, offers) {
//            console.log(services, offers);
//
//            var service, offer, filtered = [];
//
//            for (var i = 0; i < services.length; i++) {
//                service = services[i];
//
//                for (var j = 0; j < offers.length; j++) {
//                    offer = offers[j];
//                    service.serviceID === offer.ServiceID && filtered.indexOf(service) === -1 && filtered.push(service);
//                }
//            }
//
//            return filtered;
//        };
//    });
}());
