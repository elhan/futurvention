(function () {
    'use strict';
    var app = angular.module('fvApp');

    app.service('Enum', function () {
        var Enum = {};

        Enum.OfferStatus = Object.freeze({
            AUDIO: 'audio',
            IMAGE: 'image',
            INLINE_TEXT: 'inline_text',
            TEXT: 'text',
            VIDEO: 'video'
        });

        Enum.ShowcaseFileType = Object.freeze({
            LINKED: 'linked',
            HOSTED: 'hosted'
        });

        return Enum;
    });
}());
