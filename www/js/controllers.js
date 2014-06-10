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
   
   .controller('GameCtrl', function($scope, $http, syncData) {
      syncData(['users', $scope.auth.user.uid]).$bind($scope, 'user');
      $scope.calon_set = ['', 'jw', 'jk', 'ps', 'hr'];
      $scope.aktif = 0;
      $scope.benar = -1;
      $scope.salah = -1;
      $scope.soal = '';
      $scope.counter = 8;
      $scope.select = function(id) {
         if ($scope.aktif == 0) {
            $scope.aktif = id;
            console.log($scope.auth.user.uid);
            $scope.socket.emit('jawab', {jawab: $scope.calon_set[$scope.aktif], email: $scope.user.email, id: $scope.auth.user.uid});
         }
      }
      $scope.get_select = function(id) {
         if (id == $scope.benar) {
            return 'benar';
         } else if (id == $scope.salah) {
            return 'salah';
         } else if ($scope.aktif == 0) {
            return 'blur';
         } else if ($scope.aktif == id) {
            return 'aktif';
         }
      }
      $scope.socket = io.connect('http://cakpres.suitdev.com:3000/', {'force new connection': true});
      $scope.socket.on('soal', function (data) {
         console.log(data);
         $scope.soal = data.soal;
         $scope.counter = data.counter+1;
         $scope.aktif = 0;
         $scope.benar = -1;
         $scope.salah = -1;
         $scope.$apply();
      });

      $scope.socket.on('hasil', function (data) {
         var aktif = $scope.aktif;
         if (data.status) {
            $scope.benar = aktif;
         } else {
            $scope.salah = aktif;
         }
         $scope.$apply();
      });

      $scope.timer = function() {
         setTimeout(function() {
            if ($scope.counter > 0) {
               $scope.counter -= 1;
               $scope.$apply();
            }
            $scope.timer();
         }, 1000);
      }

      $scope.timer();

   })
   
   .controller('HelpCtrl', function($scope, $http) {
      $http.get('http://api.pemiluapi.org/calonpresiden/api/caleg?apiKey=fea6f7d9ec0b31e256a673114792cb17').success(function(data) {
         console.log(data);
      });
   })

    .controller('FaqCtrl', function($scope, $http) {
      $http.get('http://api.pemiluapi.org/faq-presiden/api/questions?apiKey=fea6f7d9ec0b31e256a673114792cb17').success(function(data) {
         console.log(data);
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