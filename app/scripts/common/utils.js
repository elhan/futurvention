(function () {
    'use strict';
    var app = angular.module('fvApp');

    app.service('Utils', function () {
        var Utils = {};

        Utils.updateProperties = function (original, extension, preventEmptyOverwrite) {

            extension && _.forOwn(original, function (num, key) {
                if (extension.hasOwnProperty(key)) {
                    if (typeof preventEmptyOverwrite === 'boolean' && preventEmptyOverwrite === false) {
                        original[key] = extension[key] ? extension[key] : original[key];
                    } else {
                        original[key] = extension[key];
                    }
                }
            });

            return original;
        };

        Utils.removeEmptyProperties = function (obj) {
            var isDefaultID, isDefaultProperty, isEmptyArray;
            return _.pick(obj, function (value) {
                isDefaultID = typeof value === Number && value === 0;
                isDefaultProperty = value === null;
                isEmptyArray = value instanceof Array && value.length === 0;
                return !isDefaultID && !isDefaultProperty && !isEmptyArray;
            });
        };

        Utils.getCameraTagUuid =  function (url) {
            return url.replace('http://cameratag.com/videos/', '').replace('/qvga/mp4.mp4', '');
        };

        ///////////////////////////////////////////////////////////
        /// String Case functions
        ///////////////////////////////////////////////////////////

        Utils.capitalize = function (str) {
            return str.charAt(0).toUpperCase() + str.slice(1);
        };

        Utils.capitalizeKeys = function (obj) {
            var capitalized = {};
            var values = _.values(obj);
            _.each(_.keys(obj), function (key, idx) {
                capitalized[Utils.capitalize(key)] = values[idx];
            });
            return capitalized;
        };

        Utils.camelCaseKeys = function (obj) {
            if (!_.isObject(obj)) {
                return;
            }
            var camel = {};
            var values = _.values(obj);
            _.each(_.keys(obj), function (key, idx) {
                if (/[a-z]/.test(key)) { // if not all CAPITALS
                    camel[key.charAt(0).toLowerCase() + key.slice(1)] = _.isObject(obj[key]) ? Utils.camelCaseKeys(values[idx]) : values[idx];
                } else {
                    camel[key] = values[idx];
                }
            });
            return camel;
        };

        Utils.base64toBlob = function (base64Data, contentType) {
            contentType = contentType || '';
            var sliceSize = 1024;
            var byteCharacters = atob(base64Data);
            var bytesLength = byteCharacters.length;
            var slicesCount = Math.ceil(bytesLength / sliceSize);
            var byteArrays = new Array(slicesCount);

            for (var sliceIndex = 0; sliceIndex < slicesCount; ++sliceIndex) {
                var begin = sliceIndex * sliceSize;
                var end = Math.min(begin + sliceSize, bytesLength);

                var bytes = new Array(end - begin);
                for (var offset = begin, i = 0 ; offset < end; ++i, ++offset) {
                    bytes[i] = byteCharacters[offset].charCodeAt(0);
                }
                byteArrays[sliceIndex] = new Uint8Array(bytes);
            }
            return new Blob(byteArrays, { type: contentType });
        };

        ///////////////////////////////////////////////////////////
        /// Regex patterns & matching functions
        ///////////////////////////////////////////////////////////

        // http, https, ftp url pattern
        Utils.URL_PATTERN = /(http|ftp|https):\/\/[\w-]+(\.[\w-]+)+([\w.,@?^=%&amp;:\/~+#!\(\)-]*[\w@?^=%&amp;\/~+#-])?/gim;

        // www. sans http:// or https://
        Utils.PSEUDO_URL_PATTERN = /(^|[^\/])(www\.[\S]+(\b|$))/gim;

        Utils.ELANCE_URL_PATTERN = /^https:\/\/(www\.elance\.com\/s\/.)/i;

        Utils.BEHANCE_URL_PATTERN = /^https:\/\/(www\.behance\.net\/.)/i;

        Utils.DRIBBBLE_URL_PATTERN = /^https:\/\/(dribbble\.com\/.)/i;

        Utils.GITHUB_URL_PATTERN = /^http:\/\/(www\.github\.com\/.)/i;

        Utils.ODESK_URL_PATTERN = /^https:\/\/(www\.odesk\.com\/users\/)(.+)(\_\~)(.+)/i;

        Utils.PEOPLEPERHOUR_URL_PATTERN = /^http:\/\/(www\.peopleperhour\.com\/freelancer\/(.+[\/])(.))/i;

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

        Utils.testEmailPattern = function (str) {
            return /^[_a-z0-9-]+(\.[_a-z0-9-]+)*@[a-z0-9-]+(\.[a-z0-9-]+)*(\.[a-z]{2,4})$/im.test(str);
        };

        Utils.removeParenthesis = function (str) {
            return (str && typeof str === 'string') ? str.replace(/ *\([^)]*\) */g, '') : str;
        };

        Utils.matchUrlPattern =  function (str) {
            return str.match(Utils.URL_PATTERN) || str.match(Utils.PSEUDO_URL_PATTERN);
        };

        Utils.matchProviderUrlPattern = function (str, providerName) {
            console.log('match pattern');
            console.log('Pro ' + providerName + ' St ' + str);
            if (!str || typeof(str) !== 'string' || !providerName || typeof(providerName) !== 'string') {
                return;
            }

            switch (providerName) {
            case 'elance':
                return str.match(Utils.ELANCE_URL_PATTERN);
            case 'behance':
                return str.match(Utils.BEHANCE_URL_PATTERN);
            case 'dribbble':
                return str.match(Utils.DRIBBBLE_URL_PATTERN);
            case 'github':
                return str.match(Utils.GITHUB_URL_PATTERN);
            case 'odesk':
                return str.match(Utils.ODESK_URL_PATTERN);
            case 'peopleperhour':
                return str.match(Utils.PEOPLEPERHOUR_URL_PATTERN);
            default:
                return;
            }
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
    if (!Array.prototype.hasOwnProperty('remove')) {
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
            if (!(array instanceof Array)) {
                return undefined;
            }

            for (var i = 0; i < array.length; i++) {
                this.push(array[i]);
            }
            return this;
        };
    }

    ///////////////////////////////////////////////////////////
    /// New Function API
    ///////////////////////////////////////////////////////////

    /**
     * Adds a public method to the Function.prototype.
     * Used to implement classical inheritance.
     *
     * http://www.crockford.com/javascript/inheritance.html#sugar
     */
    if (!Function.prototype.hasOwnProperty('method')) {
        Function.prototype.method = function (name, func) {
            this.prototype[name] = func;
            return this;
        };
    }

    /**
     * Adds 'inherits' & 'uber' methods to the Function.prototype.
     * Used to implement classical inheritance.
     *
     * http://www.crockford.com/javascript/inheritance.html#sugar
     */
    if (!Function.prototype.hasOwnProperty('inherits')) {
        Function.method('inherits', function (Parent) {
            this.prototype = new Parent();
            this.prototype.constructor = parent;
            return this;
        });
    }

    /**
     * Lets a constructor inherit functions from any object.
     */
    if (!Function.prototype.hasOwnProperty('inheritFunctions')) {
        // TODO: extend this to incude inheritance from another constructor or from the object's prototype
        Function.prototype.inheritFunctions = function (parent, functionNames) {
            if (!parent || !functionNames || !(parent instanceof Object) || !(functionNames instanceof Array)) {
                return;
            }

            var name, self = this;

            for (var i = 0; i < functionNames.length; i++) {
                name = functionNames[i];
                if (parent.hasOwnProperty(name) && parent[name] instanceof Function) {
                    self.prototype[name] = parent[name];
                }
            }

            return self;
        };

    }
}());
