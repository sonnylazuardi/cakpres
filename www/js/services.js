(function() {
   'use strict';

   /* Services */

   	angular.module('myApp.services', ['myApp.service.login', 'myApp.service.firebase'])
   	.factory('socket', function (socketFactory) {
		return socketFactory();
	});

      // put your services here!
      // .service('serviceName', ['dependency', function(dependency) {}]);

})();

