"use strict";

angular.module('myApp.routes', ['ngRoute'])

   // configure views; the authRequired parameter is used for specifying pages
   // which should only be available while logged in
   .config(['$routeProvider', function($routeProvider) {

      $routeProvider.when('/account', {
         authRequired: true, // must authenticate before viewing this page
         templateUrl: 'partials/account.html',
         controller: 'AccountCtrl'
      });

      $routeProvider.when('/login', {
         templateUrl: 'partials/login.html',
         controller: 'LoginCtrl'
      });

      $routeProvider.when('/game', {
         authRequired: true,
         templateUrl: 'partials/game.html',
         controller: 'GameCtrl'
      });

      $routeProvider.when('/hall', {
         templateUrl: 'partials/hall.html',
         controller: 'HallCtrl'
      });
	  
	  $routeProvider.when('/badges', {
         authRequired: true,
         templateUrl: 'partials/badges.html',
         controller: 'BadgesCtrl'
      });
	  
     $routeProvider.when('/help', {
         templateUrl: 'partials/help.html',
         controller: 'HelpCtrl'
      });

     $routeProvider.when('/violation_category', {
         templateUrl: 'partials/violation_category.html',
         controller: 'ViolationCategoryCtrl'
      });

	  $routeProvider.when('/violation/:id', {
         templateUrl: 'partials/violation.html',
         controller: 'ViolationCtrl'
      });

       $routeProvider.when('/faq', {
         templateUrl: 'partials/faq.html',
         controller: 'FaqCtrl'
      });

      $routeProvider.otherwise({redirectTo: '/game'});
   }]);