'use strict';

describe('Controller: ApplyImportCtrl', function () {

    // load the controller's module
    beforeEach(module('fvApp'));

    var ApplyImportCtrl, scope;

    // Initialize the controller and a mock scope
    beforeEach(inject(function ($controller, $rootScope) {
        scope = $rootScope.$new();
        ApplyImportCtrl = $controller('ApplyImportCtrl', {
            $scope: scope
        });
    }));

    it('should attach a collection of provide ropbjects to the scope', function () {
        expect(_.keys(scope.providers).length).toBe(8);
    });
});

//describe('Controller: ApplyImportCtrl', function () {
//    var $rootScope, $controller, $httpBackend, createController;
//
//    // load the controller's module
//    beforeEach(module('fvApp'));
//
//    // Initialize the controller and a mock scope
//    beforeEach(inject(function ($injector) {
//        $controller = $injector.get('$controller');
//        $rootScope = $injector.get('$rootScope');
//        $httpBackend = $injector.get('$httpBackend');
//
//        createController = function() {
//            return $controller('ApplyImportCtrl', { $scope: $rootScope });
//        };
//    }));
//
//    afterEach(function() {
//        $httpBackend.verifyNoOutstandingExpectation();
//        $httpBackend.verifyNoOutstandingRequest();
//    });
//
//    it('should attach a collection of thirdparty profile provider objects to the scope', function () {
//        var controller = createController();
//        expect(_.keys($rootScope.providers).length).toBe(8);
//    });
//
//    it('should save a new seller Profile on the backend', function () {
//        var controller = createController();
//        $httpBackend.flush();
//        $httpBackend.expectPOST('/apply', 'profile').respond(201, 'profile stored');
//        $httpBackend.flush();
//    });
//});
