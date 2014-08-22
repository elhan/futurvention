(function () {
    'use strict';

    var app = angular.module('fvApp');

    app.directive('fvslider', ['$document', '$timeout', function ($document, $timeout) {
        //key codes for the arrow up/down events
        var arrowDown = 40,
            arrowUp = 38;

        return {
            restrict: 'E',
            templateUrl: 'views/directives/fv-slider.html',
            link: function (scope, element, attrs) {
                var MAX_ANIMATION_DURATION = 600, // default animation duration between slides, in ms
                    MIN_ANIMATION_DURATION = 200, // used to speed animation when transitioning between multiple slides.
                    throttle = false;

                function goToNextSlide(i) {
                    $timeout(function () {
                        scope.direction === 'up' ? scope.index++ : scope.index--;
                    }, MIN_ANIMATION_DURATION * i);
                }

                // on mousewheel event navigation to next/previous slides
                function onScroll() {
                    return function (event) {
                        // cross-browser wheel delta
                        var e = window.event || event;
                        var delta = Math.max(-1, Math.min(1, (e.wheelDelta || - e.detail)));
                        scope.$apply(scope.goToSlide(delta < 0 ? scope.index + 1 : scope.index - 1));
                        return false;
                    };
                }

                // arrow navigation to next/previous slides
                function onKeyDown(e) {
                    e.keyCode === arrowDown && scope.$apply(function () { scope.goToSlide(scope.index + 1); });
                    e.keyCode === arrowUp && scope.$apply(function () { scope.goToSlide(scope.index - 1); });
                }

                // extend options passed by attributes to include some defaults.
                scope.options = {
                    'fullscreen': attrs.fullscreen,
                    'keyboard': attrs.keyboard,
                    'count': attrs.count || 0,
                    'slidename': attrs.slidename || 'slide',
                    'indicator': attrs.indicator,
                    'navbtn': attrs.navbtn
                };

                /*
                    Create an array: ['name1', ...'nameX'] for ng-repeat to iterate over.
                    Necessary since ng-repeat currently only supports collections.
                    The array contains strings created by concatenating the slidename attribute and the index.
                    The array elements will also be used as a CSS class unique to each respective element (slide) in the collection.
                **/
                scope.slides = [];
                for (var i = 0; i < attrs.count; i++) {
                    scope.slides.push(attrs.slidename + i);
                }

                scope.index = 0;
                scope.direction = 'up';
                scope.speed = 800; // default animation speed : 8ms

                scope.goToSlide = function (idx) {
                    var steps = 0;
                    if (throttle || idx < 0 || idx === scope.slides.length) {
                        return;
                    }
                    throttle = true;
                    $timeout(function () { throttle = false; }, 1000, false);

                    scope.direction = scope.index > idx ? 'down' : 'up';

                    steps = Math.abs(scope.index - idx);
                    scope.speed = MAX_ANIMATION_DURATION - ((steps - 1) * MIN_ANIMATION_DURATION);
                    for (var i = 0; i < steps; i++) {
                        goToNextSlide(i);
                    }
                };

                // on key event navigation to next/previous slides
                angular.element($document).bind('keydown', onKeyDown);

                if (document.addEventListener) {
                    document.addEventListener('mousewheel', onScroll(), false);
                    document.addEventListener('DOMMouseScroll', onScroll(), false);
//                } else { //IE
//                    sq.attachEvent('onmousewheel', onScroll());
                }
            }
        };
    }]);

}());
