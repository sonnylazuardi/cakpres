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
                  $location.path('/game');
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
                     $location.path('/game');
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
   
   .controller('HallCtrl', function($scope, $http, syncData) {
      // syncData('users').$bind($scope, 'users');
      var sync = syncData('users');//.$bind($scope, 'users');
      $scope.users = null;
      $scope.keys = null;
      $scope.halls = [];
      sync.$on('loaded', function() {
         $scope.users = sync;
         $scope.keys = $scope.users.$getIndex();
         for(var i = 0; i < $scope.keys.length; i++) {
            var user = $scope.users[$scope.keys[i]];
            $scope.halls.push(user);
         }
      });
   })

   .controller('GameCtrl', function($scope, $http, syncData, ngAudio) {
      syncData(['users', $scope.auth.user.uid]).$bind($scope, 'user');
      syncData('answers').$bind($scope, 'answers');
      $scope.calon_set = ['', 'jw', 'jk', 'ps', 'hr'];
      $scope.aktif = 0;
      $scope.benar = -1;
      $scope.salah = -1;
      $scope.soal = '';
      $scope.counter = 8;
      $scope.correct_answer = '';
	  
	  //console.log(ngAudio);
	  
      $scope.calon_nama = {
         'jw': 'Joko Widodo',
         'jk': 'Jusuf Kalla',
         'ps': 'Prabowo Subianto',
         'hr': 'Hatta Rajasa',
      }
      // $scope.data_knob = 30;
      $scope.knobOptions = {
         'width': 50,
         'height': 60,
         'displayInput': false,
         'fgColor':"#444444"
      };
      $scope.select = function(id) {
         if ($scope.aktif == 0) {
            $scope.aktif = id;
            console.log($scope.auth.user.uid);
            $scope.socket.emit('jawab', {jawab: $scope.calon_set[$scope.aktif], email: $scope.user.email, user_id: $scope.auth.user.uid});
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

      $scope.socket.emit('request');

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
			ngAudio.play('clicktrue');
			$scope.benar = aktif;
         } else {
			ngAudio.play('clickfalse');
			$scope.salah = aktif;
         }
         $scope.correct_answer = data.answer;
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
   
   .controller('BadgesCtrl', function($scope, syncData, $http, API_KEY) {
      $http.get('http://api.pemiluapi.org/stamps/api/stamps?apiKey='+API_KEY).success(function(data) {
         $scope.score = 0;
         $scope.user = null;
         var sync = syncData(['users', $scope.auth.user.uid]);//.$bind($scope, 'user');

         //var score = $scope.user.score;
         sync.$on('loaded', function(data1) {
            if (data1 !== null) {
               $scope.user = sync;
               $scope.score = $scope.user.score;

               var scoreArr = [100,500,2000,6000, 10000, 20000, 30000, 50000, 70000, 100000];
			   var badgesName = [];
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
                     badgesName.push(stamp['text']);
					 count++;
                  }
               });

               //console.log(badgesArr);
				
			   $scope.badgesName = badgesName;
               $scope.count = badgesCount;
               $scope.badgesArr = badgesArr;
               $scope.scoreArr = scoreArr;
            }
         });
      });
   })
   
   .controller('HelpCtrl', function($scope, $http, API_KEY) {
      $http.get('http://api.pemiluapi.org/calonpresiden/api/caleg?apiKey='+API_KEY).success(function(data) {
         console.log(data);
      });
   })

   .controller('ViolationCtrl', function($scope, $http, $routeParams, Violation) {
         Violation.getData().then(function(violations) {


            $scope.violations = violations;
            if ($routeParams.id == 'jokowi') { 
               $scope.filter = 'pdi';
               $scope.subject = 'Joko Widodo';
            } else if ($routeParams.id == 'prabowo') {
               $scope.filter = 'gerindra';
               $scope.subject = 'Prabowo Subianto';
            } else if ($routeParams.id == 'jusuf') {
               $scope.filter = 'golkar';
               $scope.subject = 'Jusuf Kalla';
            } else if ($routeParams.id == 'hatta') {
               $scope.filter = 'amanat nasional';
               $scope.subject = 'Hatta Rajasa';
            } else
               $scope.filter = '';

         });
      // }
      // });
   })

   .controller('ViolationCategoryCtrl', function($scope, filterFilter, $http, Violation) {
      Violation.getData().then(function(violations) {
         $scope.violations = violations['data']['results']['reports'];
         console.log(filterFilter($scope.violations,'pdi'));
         $scope.chartConfig = {
            chart: {
              
            },
            title: {
               text: ''
            },
            tooltip: {
               pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
            },
            plotOptions: {
               pie: {
                  allowPointSelect: true,
                  cursor: 'pointer',
                  dataLabels: {
                     enabled: true,
                     color: '#FFFFFF',
                     connectorColor: '#FFFFFF',
                     formatter: function () {
                        return '<b>' + this.point.name + '</b>: ' + this.percentage + ' %';
                     }
                  }
               }
           },
            series: [{
               type: 'pie',
               name: 'overall',
               point: {
                  events: {
                     click: function(e) {
                     //this.slice();
                     //console.log(e);
                     location.href = e.point.url;
                     e.preventDefault();
                     }
                  }
               },
               data: [
                  {name: 'Joko Widodo', y: filterFilter($scope.violations,'pdi').length, color:'#f42539', url: '#/violation/jokowi'},
                  {name: 'Prabowo Subianto', y: filterFilter($scope.violations,'gerindra').length, color:'#4cfd69', url: '#/violation/prabowo'},
                  {name: 'Hatta Rajasa', y: filterFilter($scope.violations,'amanat nasional').length, color:'#974cfd', url: '#/violation/hatta'},
                  {name: 'Jusuf Kalla', y: filterFilter($scope.violations,'golkar').length, color:'#f9fc20', url: '#/violation/jusuf'}
               ]
            }]
         }    
      });
      
   })

   .controller('FaqCtrl', function($scope, $http, Faq) {
      Faq.getData().then(function(data) {
         $scope.questions = data['data']['results']['questions'];   
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