(function () {
    'use strict';
    var app = angular.module('fvApp');

    app.service('Utils', function () {
        var Utils = {};

        ///////////////////////////////////////////////////////////
        /// Regex patterns & matching functions
        ///////////////////////////////////////////////////////////

        // http, https, ftp url pattern
        Utils.URL_PATTERN = /(http|ftp|https):\/\/[\w-]+(\.[\w-]+)+([\w.,@?^=%&amp;:\/~+#!\(\)-]*[\w@?^=%&amp;\/~+#-])?/gim;

        // www. sans http:// or https://
        Utils.PSEUDO_URL_PATTERN = /(^|[^\/])(www\.[\S]+(\b|$))/gim;

        Utils.ELANCE_URL_PATTERN = /^http[s]?:\/\/([^\/]*elance.com)/i;

        Utils.isImage = function (mimeType) {
            var exp = new RegExp(/video\/*/g);
            return exp.test(mimeType);
        };

        // returns a collection of url params
        Utils.getUrlParams = function (url) {
            var params, tokens;
            if (!url) {
                return;
            }
            for (var i = 0; i < url.length; ++i) {
                tokens = url[i].split('=', 2);
                params[tokens[0]] = tokens.length === 1 ? '' : decodeURIComponent(tokens[1].replace(/\+/g, ' '));
            }
            return params;
        };

        ///////////////////////////////////////////////////////////
        /// Array functions
        ///////////////////////////////////////////////////////////

        // swaps two elements in an array
        Utils.swap = function (someArray, x, y) {
            if (! someArray instanceof Array) {
                return;
            }
            var b = someArray[x];
            someArray[x] = someArray[y];
            someArray[y] = b;
            return someArray;
        };

        Utils.emptyArray = function (someArray) {
            if (! someArray instanceof Array) {
                return;
            }
            while(someArray.length > 0) {
                someArray.pop();
            }
            return someArray;
        };

        return Utils;
    });
}());
