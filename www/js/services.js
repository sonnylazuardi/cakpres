(function() {
   'use strict';

   /* Services */

   	angular.module('myApp.services', ['myApp.service.login', 'myApp.service.firebase'])
   	
   	.factory('Violation', function($http, $q, API_KEY) {
   		var my_data = null;
	    var getData = function() {
	    	if (my_data == null) {
		        var deferred = $q.defer();
		        $http({method:"GET", url:"http://api.pemiluapi.org/laporan_pelanggaran/api/reports?apiKey="+API_KEY}).success(function(result){
		        	my_data = result;
		            deferred.resolve(result);
		        });
	        	return deferred.promise;
	        } else {
	        	var deferred = $q.defer();
	        	deferred.resolve(my_data);
	        	return deferred.promise;
	        }
	    };
	    return { 
	    	getData: getData
	    };
	})
   	
   	.factory('Social', function($http, $q, API_KEY) {
   		var my_data = null;
	    var getData = function() {
	    	if (my_data == null) {
		        var deferred = $q.defer();
		        $http({method:"GET", url:"http://api.pemiluapi.org/socmedpemilu?apiKey="+API_KEY}).success(function(result){
		        	my_data = result;
		            deferred.resolve(result);
		        });
	        	return deferred.promise;
	        } else {
	        	var deferred = $q.defer();
	        	deferred.resolve(my_data);
	        	return deferred.promise;
	        }
	    };
	    return { 
	    	getData: getData
	    };
	})

	.factory('Campaign', function($http, $q, API_KEY) {
   		var my_data = null;
	    var getData = function() {
	    	if (my_data == null) {
		        var deferred = $q.defer();
		        $http({method:"GET", url:"http://api.pemiluapi.org/socmedpemilu?apiKey="+API_KEY}).success(function(result){
		        	my_data = result;
		            deferred.resolve(result);
		        });
	        	return deferred.promise;
	        } else {
	        	var deferred = $q.defer();
	        	deferred.resolve(my_data);
	        	return deferred.promise;
	        }
	    };
	    return { 
	    	getData: getData
	    };
	})

   	.factory('Faq', function($http, $q, API_KEY) {
   		var my_data = null;
	    var getData = function() {
	    	if (my_data == null) {
		        var deferred = $q.defer();
		        $http({method:"GET", url:"http://api.pemiluapi.org/faq-presiden/api/questions?apiKey="+API_KEY}).success(function(result){
		        	my_data = result;
		            deferred.resolve(result);
		        });
	        	return deferred.promise;
	        } else {
	        	var deferred = $q.defer();
	        	deferred.resolve(my_data);
	        	return deferred.promise;
	        }
	    };
	    return { 
	    	getData: getData
	    };
	});

      // put your services here!
      // .service('serviceName', ['dependency', function(dependency) {}]);

})();

