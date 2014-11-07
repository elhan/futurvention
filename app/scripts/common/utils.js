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

        Utils.isVideo = function (mimeType) {
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

      Utils.capitalize = function (str) {
          return str.charAt(0).toUpperCase() + str.slice(1);
      };


        return Utils;
    });

    ///////////////////////////////////////////////////////////
    /// New Array API
    ///////////////////////////////////////////////////////////

    // swaps two elements in an array
    if (!Array.prototype.hasOwnProperty('swap')) {
        Array.prototype.swap = function (x, y) {
            var b = this[x];
            this[x] = this[y];
            this[y] = b;
            return this;
        };
    }

    // empty an array
    if (!Array.prototype.hasOwnProperty('empty')) {
        Array.prototype.empty = function () {
            while (this.length > 0) {
                this.pop();
            }
        };
    }

    // Finds and removes the first array object that satisfied the given predicate
    if (!Array.prototype.hasOwnProperty('removed')) {
        Array.prototype.remove = function (cb) {
            if (typeof cb !== 'function') {
                return undefined;
            }

            for (var i = 0; i < this.length; i++) {
                if (cb(this[i])) {
                    return this.splice(i, 1);
                }
            }

            return undefined;
        };
    }

    // Merges an array passed as param into the original array.
    if (!Array.prototype.hasOwnProperty('merge')) {
        Array.prototype.merge = function (array) {
            if (!array instanceof Array) {
                return undefined;
            }

            for (var i = 0; i < array.length; i++) {
                this.push(array[i]);
            }
            return this;
        };
    }
}());
