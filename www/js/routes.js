"use strict";

angular.module('myApp.routes', ['ngRoute'])

   // configure views; the authRequired parameter is used for specifying pages
   // which should only be available while logged in
   .config(['$routeProvider', function($routeProvider) {
      $routeProvider.when('/home', {
         templateUrl: 'partials/home.html',
         controller: 'HomeCtrl'
      });

      $routeProvider.when('/chat', {
         templateUrl: 'partials/chat.html',
         controller: 'ChatCtrl'
      });

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
	  
	  $routeProvider.when('/badges', {
         authRequired: true,
         templateUrl: 'partials/badges.html',
         controller: 'BadgesCtrl'
      });
	  
     $routeProvider.when('/help', {
         authRequired: false,
         templateUrl: 'partials/help.html',
         controller: 'HelpCtrl'
      });

     $routeProvider.when('/violation_category', {
         authRequired: false,
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

      $routeProvider.otherwise({redirectTo: '/home'});
   }]);