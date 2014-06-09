'use strict';

/* Controllers */

angular.module('myApp.controllers', [])
   .controller('HomeCtrl', function($scope, syncData) {
      syncData('syncedValue').$bind($scope, 'syncedValue');
   })

  .controller('ChatCtrl', function($scope, syncData) {
      $scope.newMessage = null;

      // constrain number of messages by limit into syncData
      // add the array into $scope.messages
      $scope.messages = syncData('messages', 10);

      // add new messages to the list
      $scope.addMessage = function() {
         if( $scope.newMessage ) {
            $scope.messages.$add({text: $scope.newMessage});
            $scope.newMessage = null;
         }
      };
   })

   .controller('LoginCtrl', function($scope, loginService, $location) {
      $scope.email = null;
      $scope.pass = null;
      $scope.confirm = null;
      $scope.createMode = false;

      $scope.login = function(cb) {
         $scope.err = null;
         if( !$scope.email ) {
            $scope.err = 'Please enter an email address';
         }
         else if( !$scope.pass ) {
            $scope.err = 'Please enter a password';
         }
         else {
            loginService.login($scope.email, $scope.pass, function(err, user) {
               $scope.err = err? err + '' : null;
               if( !err ) {
                  cb && cb(user);
               }
            });
         }
      };

      $scope.createAccount = function() {
         $scope.err = null;
         if( assertValidLoginAttempt() ) {
            loginService.createAccount($scope.email, $scope.pass, function(err, user) {
               if( err ) {
                  $scope.err = err? err + '' : null;
               }
               else {
                  // must be logged in before I can write to my profile
                  $scope.login(function() {
                     loginService.createProfile(user.uid, user.email);
                     $location.path('/account');
                  });
               }
            });
         }
      };

      function assertValidLoginAttempt() {
         if( !$scope.email ) {
            $scope.err = 'Please enter an email address';
         }
         else if( !$scope.pass ) {
            $scope.err = 'Please enter a password';
         }
         else if( $scope.pass !== $scope.confirm ) {
            $scope.err = 'Passwords do not match';
         }
         return !$scope.err;
      }
   })
   
   .controller('GameCtrl', function($scope, $http) {
      $http.get('http://api.pemiluapi.org/stamps/api/stamps?apiKey=fea6f7d9ec0b31e256a673114792cb17').success(function(data) {
         console.log(data);
      });
   })
   
   .controller('BadgesCtrl', function($scope, syncData, $http) {
      $http.get('http://api.pemiluapi.org/stamps/api/stamps?apiKey=fea6f7d9ec0b31e256a673114792cb17').success(function(data) {
		$scope.score = 0;
         var sync = syncData(['users', $scope.auth.user.uid]);//.$bind($scope, 'user');
		 //var score = $scope.user.score;
		 sync.$on('loaded', function(data1) {
			$scope.score = data1.score;
			
			var scoreArr = [100,500,2000,6000, 10000, 20000, 30000, 50000, 70000, 100000];
			 var badgesArr = [];
			 var badgesCount = 0;
			 
			 //console.log($scope.score);
			 
			 for(var i=0;i<10;i++){
				//console.log(scoreArr[i]);
				if($scope.score >= scoreArr[i]){
					badgesCount+=1;
				}
			 }
			 
			 //console.log(badgesCount);
			 
			 var count = 0;
			 //console.log(data);
			 data['data']['results']['stamps'].forEach(function(stamp){
				//console.log(stamp);
				if(count < badgesCount){
					//console.log("pushed");
					badgesArr.push(stamp['url_small']);
					count++;
				}
			 });
			 
			 console.log(badgesArr);
			 
			 $scope.count = badgesCount;
			 $scope.badgesArr = badgesArr;
			 $scope.scoreArr = scoreArr;
		 });
      });
   })
   
   .controller('HelpCtrl', function($scope, $http) {
      $http.get('http://api.pemiluapi.org/calonpresiden/api/caleg?apiKey=fea6f7d9ec0b31e256a673114792cb17').success(function(data) {
         console.log(data);
      });
   })

    .controller('FaqCtrl', function($scope, $http) {
      $http.get('http://api.pemiluapi.org/faq-presiden/api/questions?apiKey=fea6f7d9ec0b31e256a673114792cb17').success(function(data) {
         console.log(data);         
         $scope.badges = data['data']['results']['stamps'];
		 
      });
   })

   .controller('AccountCtrl', function($scope, loginService, syncData, $location) {
      syncData(['users', $scope.auth.user.uid]).$bind($scope, 'user');

      $scope.logout = function() {
         loginService.logout();
      };

      $scope.oldpass = null;
      $scope.newpass = null;
      $scope.confirm = null;

      $scope.reset = function() {
         $scope.err = null;
         $scope.msg = null;
      };

      $scope.updatePassword = function() {
         $scope.reset();
         loginService.changePassword(buildPwdParms());
      };

      function buildPwdParms() {
         return {
            email: $scope.auth.user.email,
            oldpass: $scope.oldpass,
            newpass: $scope.newpass,
            confirm: $scope.confirm,
            callback: function(err) {
               if( err ) {
                  $scope.err = err;
               }
               else {
                  $scope.oldpass = null;
                  $scope.newpass = null;
                  $scope.confirm = null;
                  $scope.msg = 'Password updated!';
               }
            }
         }
      }

   });