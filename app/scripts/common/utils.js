(function () {
    'use strict';
    var app = angular.module('fvApp');

    app.service('Utils', function () {
        var Utils = {};

        // http, https, ftp url pattern
        Utils.URL_PATTERN = /(http|ftp|https):\/\/[\w-]+(\.[\w-]+)+([\w.,@?^=%&amp;:\/~+#!\(\)-]*[\w@?^=%&amp;\/~+#-])?/gim;

        // www. sans http:// or https://
        Utils.PSEUDO_URL_PATTERN = /(^|[^\/])(www\.[\S]+(\b|$))/gim;

        return Utils;
    });
}());
