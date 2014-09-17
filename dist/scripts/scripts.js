!function(){"use strict";var a=angular.module("fvApp",["ngAnimate","ngCookies","ngResource","ngRoute","ngSanitize","ngTouch","mgcrea.ngStrap","mgcrea.ngStrap.modal","facebook","ngLinkedIn","config","firebase"]);a.config(["$routeProvider",function(a){a.when("/",{templateUrl:"views/main.html"}).when("/register",{templateUrl:"views/register.html"}).when("/login",{templateUrl:"views/login.html"}).when("/apply",{templateUrl:"views/apply.html"})}]),a.config(["FacebookProvider","$linkedInProvider","ENV","AUTH_PROVIDER_OPTIONS",function(a,b,c,d){var e=d;a.init(c.fbApiKey,e.facebook),b.options({appKey:c.liApiKey,scope:e.linkedIn.scope,authorize:e.linkedIn.authorize,credentials_cookie:e.linkedIn.credentials_cookie})}])}(),function(){"use strict";angular.module("config",[]).constant("ENV",{name:"production",apiEndpoint:"http://futurvention.herokuapp.com",fbApiKey:"675990215825778",liApiKey:"77xj8xhasosg9k",firebaseUrl:"https://fvapp.firebaseio.com/"})}(),function(){"use strict";var a=angular.module("fvApp");a.constant("EVENTS",{user:{createSuccess:"user-creation-success",createFailed:"user-creation-failed",updateSuccess:"user-update-success",updateFailed:"user-update-failed"},auth:{registrationSuccess:"auth-registration-success",registrationFailed:"auth-registration-failed",loginSuccess:"auth-login-success",loginFailed:"auth-login-failed",logoutSuccess:"auth-logout-success",sessionTimeout:"auth-session-timeout",notAuthenticated:"auth-not-authenticated",notAuthorized:"auth-not-authorized"},firebase:{firebaseConnected:"firebase-connected"}}),a.constant("USER_ROLES",{all:"*",admin:"admin",user:"user",guest:"guest"}),a.constant("AUTH_PROVIDER_OPTIONS",{facebook:{scope:"public_profile, email"},linkedIn:{scope:"r_emailaddress r_fullprofile",fields:["id","first-name","last-name","email-address"],authorize:!0,credentials_cookie:!0}})}(),function(){"use strict";var a=angular.module("fvApp");a.controller("MainCtrl",["$scope","$location","USER_ROLES","AuthSvc","SessionSvc","LocalStorageSvc","UserSvc",function(a,b,c,d,e,f,g){function h(){var b=f.getSession();b&&(a.setCurrentUser(g.getUser(b.user.id)),e.create(b.sessionKey,b.user.id,b.user.provider,a.userRoles.user))}a.userRoles=c,a.isAuthorized=d.isAuthorized,a.isAuthenticated=d.isAuthenticated,a.setCurrentUser=function(b){a.currentUser=b},a.go=function(a){b.path(a)},a.$on("auth-logout-success",function(b){e.destroy(),a.setCurrentUser({}),console.log(b)}),a.$on("auth-login-success",function(b,c,d){"linkedIn"===d&&e.create(Math.random(),c,d,a.userRoles.user),h(),a.setCurrentUser(g.getUser(e.userId)),a.go("/"),console.log(b)}),a.$on("firebase-connected",function(){h()})}]),a.controller("LoginCtrl",["$scope","$rootScope","$linkedIn","EVENTS","AUTH_PROVIDER_OPTIONS","AuthSvc","UserSvc",function(a,b,c,d,e,f,g){var h=e,i=d.auth,j=f.firebaseAuth();a.newUser={firstName:"",lastName:"",email:"",password:""},a.authError={emailTaken:!1,invalidEmail:!1,invalidPassword:!1},a.register=function(c){j.$createUser(c.email,c.password).then(function(d){b.$broadcast(i.registrationSuccess,d),c.id=d.id,g.setUser(c),a.login({email:c.email,password:c.password})},function(a){b.$broadcast(i.registrationFailed,a)})},a.loginFb=function(){j.$login("facebook",h.facebook).then(function(a){var c=g.getUser(a.id);!c&&g.setUser({id:a.id,firstName:a.thirdPartyUserData.first_name,lastName:a.thirdPartyUserData.last_name,email:a.thirdPartyUserData.email}),b.$broadcast(i.loginSuccess,a.id,"facebook")},function(a){b.$broadcast(i.loginFailed,a)})},a.loginLi=function(){f.loginLi().then(function(){f.getLiProfile().then(function(a){var c=g.getUser(a.values[0].id);c&&g.setUser({id:a.values[0].id,firstName:a.values[0].firstName,lastName:a.values[0].lastName,email:a.values[0].emailAddress}),b.$broadcast(i.loginSuccess,a.values[0].id,"linkedIn")})})},a.login=function(a){j.$login("password",{email:a.email,password:a.password}).then(function(a){b.$broadcast(i.loginSuccess,a.id,"password")},function(a){b.$broadcast(i.loginFailed,a)})},a.logout=function(){j.$logout(),b.$broadcast(i.logoutSuccess,event)},a.$on("auth-registration-failed",function(b,c){switch(c.code){case"EMAIL_TAKEN":a.authError.emailTaken=a.newUser.email;break;case"INVALID_EMAIL":a.authError.invalidEmail=a.newUser.email;break;default:console.log(b,c)}}),a.$on("auth-login-failed",function(b,c){switch(c.code){case"INVALID_USER":a.authError.invalidUser=a.newUser.email;break;case"INVALID_EMAIL":a.authError.invalidEmail=a.newUser.email;break;case"INVALID_PASSWORD":a.authError.invalidPassword=a.newUser.password;break;default:console.log(b,c)}})}]),a.controller("HeaderCtrl",["$scope","$location",function(a,b){a.locationAt=function(a){return a===b.path()}}])}(),function(){"use strict";var a=angular.module("fvApp");a.directive("fvSlider",["$document","$timeout",function(a,b){var c=40,d=38;return{restrict:"E",templateUrl:"views/directives/fv-slider.html",link:function(e,f,g){function h(a){b(function(){"up"===e.direction?e.index++:e.index--},l*a)}function i(){return function(a){var b=window.event||a,c=Math.max(-1,Math.min(1,b.wheelDelta||-b.detail));return e.$apply(e.goToSlide(0>c?e.index+1:e.index-1)),!1}}function j(a){a.keyCode===c&&e.$apply(function(){e.goToSlide(e.index+1)}),a.keyCode===d&&e.$apply(function(){e.goToSlide(e.index-1)})}var k=600,l=200,m=!1;g.fullscreen&&angular.element("body").css("overflow","hidden"),e.options={fullscreen:g.fullscreen,keyboard:g.keyboard,count:g.count||0,slidename:g.slidename||"slide",indicator:g.indicator,navbtn:g.navbtn},e.slides=[];for(var n=0;n<g.count;n++)e.slides.push(g.slidename+n);e.index=0,e.direction="up",e.speed=800,e.goToSlide=function(a){var c=0;if(!(m||0>a||a===e.slides.length)){m=!0,b(function(){m=!1},1e3,!1),e.direction=e.index>a?"down":"up",c=Math.abs(e.index-a),e.speed=k-(c-1)*l;for(var d=0;c>d;d++)h(d)}},angular.element(a).on("keydown",j),document.addEventListener&&(document.addEventListener("mousewheel",i(),!1),document.addEventListener("DOMMouseScroll",i(),!1)),e.$on("$destroy",function(){g.fullscreen&&angular.element("body").css("overflow","auto"),angular.element(a).off("keydown"),angular.element(a).off("mousewheel"),angular.element(a).off("DOMMouseScroll")})}}}])}(),function(){"use strict";var a=angular.module("fvApp");a.service("SessionSvc",function(){return this.create=function(a,b,c,d){this.id=a,this.userId=b,this.userRole=d},this.destroy=function(){this.id=null,this.userId=null,this.userRole=null},this}),a.service("LocalStorageSvc",function(){return this.getSession=function(){return JSON.parse(localStorage.getItem("firebaseSession"))},this}),a.service("UserSvc",["$firebase","$rootScope","ENV","EVENTS",function(a,b,c,d){var e,f=d.firebase,g=c.firebaseUrl,h=new Firebase(g+"/users"),i=a(h).$asObject();return i.$loaded().then(function(){b.$broadcast(f.firebaseConnected)}),this.setUser=function(a){i.$push(a).then(function(a){console.log("added new user with key: ",a.name())})},this.getUsers=function(){return e},this.getUser=function(a){return _.find(e,function(b){return b.id===a})},h.on("value",function(a){e=a.val()},function(a){console.log("The firebase read failed: "+a.code)}),this}]),a.service("AuthSvc",["$firebaseSimpleLogin","$linkedIn","$cookies","SessionSvc","AUTH_PROVIDER_OPTIONS","ENV",function(a,b,c,d,e,f){var g=e,h=f;return this.isAuthenticated=function(){return!!d.userId},this.isAuthorized=function(a){return angular.isArray(a)||(a=[a]),this.isAuthenticated()&&-1!==a.indexOf(d.userRole)},this.firebaseAuth=function(){return a(new Firebase(h.firebaseUrl))},this.loginLi=function(){return b.authorize()},this.getLiProfile=function(){return b.profile("me",g.linkedIn.fields)},this.getLiCookie=function(){return c[["linkedin_oauth_",h.liApiKey,"_crc"].join("")]},this}])}();