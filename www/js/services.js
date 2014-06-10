(function() {
   'use strict';

   /* Services */

   	angular.module('myApp.services', ['myApp.service.login', 'myApp.service.firebase'])
   	
   	.factory('Violation', function($http, $q) {
   		var my_data = null;
	    var getData = function() {
	    	if (my_data == null) {
		        var deferred = $q.defer();
		        $http({method:"GET", url:"http://api.pemiluapi.org/laporan_pelanggaran/api/reports?apiKey=fea6f7d9ec0b31e256a673114792cb17"}).success(function(result){
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

   	.factory('Faq', function($http, $q) {
   		var my_data = null;
	    var getData = function() {
	    	if (my_data == null) {
		        var deferred = $q.defer();
		        $http({method:"GET", url:"http://api.pemiluapi.org/faq-presiden/api/questions?apiKey=fea6f7d9ec0b31e256a673114792cb17"}).success(function(result){
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

