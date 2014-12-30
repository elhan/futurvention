(function () {
    'use strict';

    var app = angular.module('fvApp');

    /**
     * @ngdoc directive
     * @name fvApp.directive:fvslider
     * @restrict E
     *
     * @description
     * Creates a custom slider element
     *
     * @example
     * <fv-slider slidename="bg" count="4" fullscreen="true" keyboard="true" mousewheel="true" indicator="true" navbtn="true"></fv-slider>
     */
    app.directive('fvSlider', ['$document', '$timeout', function ($document, $timeout) {
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

                // prevent scrolling if fullscreen
                attrs.fullscreen && angular.element('body').css('overflow', 'hidden');

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
                angular.element($document).on('keydown', onKeyDown);

                if (document.addEventListener) {
                    document.addEventListener('mousewheel', onScroll(), false);
                    document.addEventListener('DOMMouseScroll', onScroll(), false);
                    //                } else { //IE
                    //                    sq.attachEvent('onmousewheel', onScroll());
                }

                // unbind listeners and enable scrolling if fullscreen
                scope.$on('$destroy', function () {
                    attrs.fullscreen && angular.element('body').css('overflow', 'auto');
                    angular.element($document).off('keydown');
                    angular.element($document).off('mousewheel');
                    angular.element($document).off('DOMMouseScroll');
                });
            }
        };
    }]);

    /**
     * @ngdoc directive
     * @name fvApp.directive:fvScrollBottom
     * @restrict A
     *
     * @description
     * Listens for broadcasted events and scrolls to the bottom of the page. The event to listen for is passed
     * through the scrolltrigger attribute.
     *
     * @example
     * <form fv-scroll-bottom scrollTrigger="ui-provider-selected" ... ">
     */
    app.directive('fvScrollBottom', ['$window', '$document', '$timeout', function ($window, $document, $timeout) {
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                scope.$on(attrs.scrolltrigger, function () {
                    $timeout(function () {
                        $window.scrollTo(0, angular.element($document)[0].body.scrollHeight);
                    });
                });
            }
        };
    }]);

    /**
     * @ngdoc directive
     * @name fvApp.directive:fvScrollTo
     * @restrict A
     *
     * @description
     * Listens for broadcasted events and scrolls to the bottom of the page. The event to listen for is passed
     *
     * @example
     * <form fv-scroll-to={{someExp}}></form>
     */
    app.directive('fvScrollTo', ['$document', '$timeout', function ($document, $timeout) {
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                $timeout(attrs.fvScrollTo && $document.scrollToElement(element));
            }
        };
    }]);

    /**
     * @ngdoc directive
     * @name fvApp.directive:fvAutoFocus
     * @restrict A
     * @element window, input, select, textarea, a
     *
     * @description
     * Autofocus elements when they are first inserted into the DOM
     *
     * @example
     * <input fv-auto-focus>
     */
    app.directive('fvAutoFocus', ['$timeout', function ($timeout) {
        return {
            restrict: 'A',
            link: function (scope, element) {
                element && element.focus && $timeout(function () {
                    element.focus();
                });
            }
        };
    }]);

    /**
     * @ngdoc directive
     * @name fvApp.directive:fvFocusInput
     * @restrict A
     * @element input
     *
     * @description
     * Focus an input by name, on one or more events. The name of input to focus
     * and the event(s) that trigger the focus action are provided as attributes.
     *
     * @example
     * <div fv-focus-input focusOn="click" focusInput="elance"></div>
     */
    app.directive('fvFocusInput', ['$timeout', function ($timeout) {
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                $timeout(function () {
                    var input = document.getElementsByName(attrs.focusInput)[0];
                    input && element.on(attrs.focusOn, function () {
                        $timeout(function () { input.focus(); });
                    });
                });
            }
        };
    }]);

    /**
     * @ngdoc directive
     * @name fvApp.directive:fvBgImage
     * @restrict A
     * @element div
     *
     * @description
     * Dynamic background image functionality
     *
     * @example
     * <div fv-bg-image="someBackgroundImage"> ... </div>
     */
    app.directive('fvBgImage', function () {
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                attrs.$observe('fvBgImage', function (newImg, oldImg) {
                    newImg && newImg !== oldImg && element.css('background-image', ['url("', newImg, '")'].join(''));
                }, true);
            }
        };
    });

    /**
     * @ngdoc directive
     * @name fvApp.directive: fvDraggable
     * @restrict A
     *
     * @description
     * Enables an element to be dragged.
     *
     * @example
     * <div fv-draggable={{items.length > 0}} ...></div>
     */
    app.directive('fvDraggable', function() {
        return function (scope, element, attrs) {
            var el = element[0];

            if (attrs.fvDraggable === false) {
                el.removeAttr('draggable');
                return;
            }

            el.draggable = true;

            el.addEventListener('dragstart', function (e) {
                e.dataTransfer.effectAllowed = 'move';
                // if the custom fvData attribute is present, pass the data object in the dataTransfer event
                attrs.fvData && e.dataTransfer.setData('Text', JSON.stringify(attrs.fvData));
                return false;
            }, false);
        };
    });

    /**
     * @ngdoc directive
     * @name fvApp.directive:fvDroppable
     * @restrict A
     * @element: any
     *
     * @description
     * Enables drop functionality on a given element
     *
     * @example
     * <div fv-droppable fv-on-drop="setProgress(true)"> ... </div>
     */
    app.directive('fvDroppable', function () {
        return {
            scope: {},
            link: function (scope, element, attrs) {
                var el = element[0];

                attrs.fvDropClass && el.addEventListener('dragenter', function () {
                    this.classList.add(attrs.fvDropClass);
                    return false;
                }, false);

                attrs.fvDropClass && el.addEventListener('dragleave', function () {
                    this.classList.remove(attrs.fvDropClass);
                    return false;
                }, false);

                el.addEventListener('dragover', function (e) {
                    e.preventDefault && e.preventDefault(); // enable drop
                    e.dataTransfer.dropEffect = 'move';
                    return false;
                }, false);

                el.addEventListener('drop', function (e) {
                    e.stopPropagation && e.stopPropagation(); // Stops some browsers from redirecting.
                    attrs.fvDropClass && this.classList.remove(attrs.fvDropClass);
                    return false;
                }, false);
            }
        };
    });

    /**
     * @ngdoc directive
     * @name fvApp.directive:fvOnDrop
     * @restrict A
     * @element div
     *
     * @description
     * Execute a controller function on drop. The element must be droppable!
     *
     * @example
     * <div fv-on-drop="setProgress(true)"> ... </div>
     */
    app.directive('fvOnDrop', function () {
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                // element[0].addEventListener('drop', function () { scope.$apply(attrs.fvOnDrop); });
                element[0].addEventListener('drop', function (e) {
                    scope.$apply(_.bind(scope[attrs.fvOnDrop], { event: e }, scope.item)); // extend function arguments to include the drop event
                });

            }
        };
    });

    /**
     * @ngdoc directive
     * @name fvApp.directive:fvTimelineH
     * @restrict E
     *
     * @description
     * Creates a custom horizontal timeline element
     *
     * @example
     * <fv-timeline-h></fv-timeline-h>
     */
    app.directive('fvTimelineH', ['$location', 'ProfileSvc', function ($location, ProfileSvc) {
        return {
            restrict: 'E',
            scope: {
                activeStep: '=',
                goToStep: '&',
                currentUser: '='
            },
            templateUrl: 'views/directives/fv-timeline-h.html',
            link: function (scope) {

                var stepNames = ['import', 'info', 'service_selection', 'offer_config', 'storefront'];

                scope.navigateTo = function (step) {
                    switch (true) {
                    case step === 3: // go to storefront
                        $location.path('/' + scope.currentUser.Profile.Moniker);
                        break;
                    case $location.path() === '/apply': // go to another 'apply' step
                        scope.$parent.goToStep(step);
                        break;
                    default: // from storefront, go to some 'apply' step
                        ProfileSvc.setActiveStep(stepNames[step]);
                        $location.path('/apply');
                    }
                };

            }
        };
    }]);

    /**
     * @ngdoc directive
     * @name fvApp.directive:fvDynamicInputName
     * @restrict A
     *
     * @description
     * Generates names for dynamic inputs by concatenating 'input' with a string passed throught
     * fv-dynamic-name attribute.
     *
     * @example
     * <input type="url" fv-dynamic-name=someName...
     */
    app.directive('fvDynamicName', ['$compile', '$parse', function($compile, $parse) {
        return {
            restrict: 'A',
            terminal: true,
            priority: 100000,
            link: function (scope, element) {
                var name = $parse(element.attr('fv-dynamic-name'))(scope);
                element.removeAttr('fv-dynamic-name');
                element.attr('name', ['input', '-', name].join(''));
                $compile(element)(scope);
            }
        };
    }]);

    /**
     * @ngdoc directive
     * @name fvApp.directive:fvToggleClass
     * @restrict A
     *
     * @description
     * Toggle a css class passed via the fvClass attribute on an event passed via the fvOn attribute
     *
     * @example
     * <div fv-toggle-class fv-on="mousedown" fv-class="someClass"
     */
    app.directive('fvToggleClass', function () {
        return function (scope, element, attrs) {
            attrs.fvOn && attrs.fvClass && element[0].addEventListener(attrs.fvOn, function () {
                this.classList.toggle(attrs.fvClass);
            });
        };
    });

    /**
     * @ngdoc directive
     * @name fvApp.directive:fvTabs
     * @restrict A
     *
     * @description
     * Toggle active state for child fvPane elements
     *
     * @example
     * <div fv-tabs...><div fv-pane...></div><div fv-pane...></div></div>
     */
    app.directive('fvTabs', function () {
        return function (scope, element) {
            var tabs = _.filter(element.children(), function (el) {
                return el.hasAttribute('fv-pane');
            });

            _.forEach(tabs, function (pane, index) {
                pane.addEventListener('click', function () {
                    scope.$emit('pane-clicked', index);
                });
            });

            scope.$on('pane-clicked', function (e, index) {
                _.forEach(tabs, function (pane, idx) {
                    index === idx ? angular.element(pane).addClass('active') : angular.element(pane).removeClass('active');
                });
            });
        };
    });

    /**
     * @ngdoc directive
     * @name fvApp.directive:fvCameraTag
     * @restrict A
     *
     * @description
     * Emmits a camera tag event when the element has rendered
     *
     */
    app.directive('fvCameraTag', ['EVENTS', function (events) {
        return {
            scope: {
                fvCameraTag: '@'
            },
            link: function (scope) {
                scope.$emit(events.ui.cameraReady);
            }
        };

    }]);

    /**
     * @ngdoc directive
     * @name fvApp.directive:fvAlert
     * @restrict A
     *
     * @description
     * Emmits an event when dismissed
     *
     */
    app.directive('fvAlert', ['$rootScope', 'EVENTS', function ($rootScope, events) {
        return {
            link: function (scope) {
                scope.dismissAlert = _.throttle(function () {
                    scope.$hide();
                    $rootScope.$broadcast(events.ui.alertClosed);
                }, 1000);
            }
        };

    }]);

}());
