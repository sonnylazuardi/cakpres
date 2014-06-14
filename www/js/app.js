'use strict';

// Declare app level module which depends on filters, and services
angular.module('myApp',
      ['myApp.config', 'myApp.routes', 'myApp.filters', 'myApp.services', 'myApp.directives', 'myApp.controllers',
         'waitForAuth', 'routeSecurity', 'highcharts-ng', 'ui.gravatar', 'ngSanitize', 'QuickList', 'ui.knob',
         'djds4rce.angular-socialshare', 'ngAudio']
   )

   .run(function(loginService, $rootScope, FBURL, $http) {
      if( FBURL === 'https://INSTANCE.firebaseio.com' ) {
         // double-check that the app has been configured
         angular.element(document.body).html('<h1>Please configure app/js/config.js before running!</h1>');
         setTimeout(function() {
            angular.element(document.body).removeClass('hide');
         }, 250);
      }
      else {
         // establish authentication
         $rootScope.auth = loginService.init('/login');
         $rootScope.FBURL = FBURL;

         $rootScope.$back = function() { 
            window.history.back();
         };

      }
   });

   // .config(function($locationProvider){
   //    $locationProvider.html5Mode(true).hashPrefix('!');
   // });
