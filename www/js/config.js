'use strict';

// Declare app level module which depends on filters, and services
angular.module('myApp.config', [])

   // version of this seed app is compatible with angularFire 0.6
   // see tags for other versions: https://github.com/firebase/angularFire-seed/tags
   .constant('version', '0.6')

   // where to redirect users if they need to authenticate (see module.routeSecurity)
   .constant('loginRedirectPath', '/login')

   // your Firebase URL goes here
   .constant('FBURL', 'https://cakpres.firebaseio.com')

   // Pemilu API key
   .constant('API_KEY', 'fbc6b82380c5619ee9d2a648e400b614')

   //you can use this one to try out a demo of the seed
//   .constant('FBURL', 'https://angularfire-seed.firebaseio.com');


/*********************
 * !!FOR E2E TESTING!!
 *
 * Must enable email/password logins and manually create
 * the test user before the e2e tests will pass
 *
 * user: test@test.com
 * pass: test123
 */
