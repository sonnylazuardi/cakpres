var express = require('express');
var http = require('http');
var path = require('path');
var _ = require('underscore');
var request = require('request');
var Firebase = require('firebase');
var api_key = 'fbc6b82380c5619ee9d2a648e400b614';

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

var candidate_json = {};

var calon_set = ['hr', 'jk', 'jw', 'ps'];
var jenis_set = [
    {
        name: 'partai',
        field: 'nama',
        title: '',
        category: 3
    }, 
    {
        name: 'riwayat_pendidikan',
        field: 'ringkasan',
        title: '',
        category: 1
    }, 
    {
        name: 'riwayat_pekerjaan',
        field: 'ringkasan',
        title: '',
        category: 1
    },
    {
        name: 'nama_pasangan',
        field: '',
        title: 'Nama Pasangan',
        category: 2
    },
    {
        name: 'riwayat_organisasi',
        field: 'ringkasan', 
        title: '',
        category: 1
    },
    {
        name: 'riwayat_penghargaan',
        field: 'ringkasan', 
        title: '',
        category: 1
    },
    {
        name: 'tempat_lahir',
        field: '', 
        title: 'Tempat Lahir',
        category: 2
    },
    {
        name: 'tanggal_lahir',
        field: '', 
        title: 'Tanggal Lahir',
        category: 2
    },
    {
        name: 'jumlah_anak',
        field: '', 
        title: 'Jumlah Anak',
        category: 2
    }
];

var idcalon = 0;
var idjenis = 0;
var idpertanyaan = 0;

var soal = '';
var jawab = '';
var counter = 8;
var answerPosition = 1;


// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', function(req, res) {
    res.send('Cakpres API v.0.0.1!')
});

app.get('/api/refresh', function(req, res) {
    request("http://api.pemiluapi.org/calonpresiden/api/caleg?apiKey="+api_key, function(error, response, body) {
      candidate_json = JSON.parse(body);
      res.send('ok!');
    });
});

var server = http.createServer(app).listen(app.get('port'), function(){
  console.log('Cakpres listening on port ' + app.get('port'));
});

// SOCKET.IO starts

var io = require('socket.io').listen(server);

io.sockets.on('connection', function (socket) {
    socket.on('request', function() {
        socket.emit('soal', {soal: soal, counter: counter});
    });
    socket.on('jawab', function (data) {
        // var user = _.findWhere(users, {nama: socket.nama});
        if (calon_set[idcalon] == data.jawab) {
            if (answerPosition <= 5) {
                var ref = new Firebase('https://cakpres.firebaseio.com/users/'+data.user_id+'/');
                ref.once('value', function(snapshot) {
                    var user = snapshot.val();
                    if (user !== null) {
                        var cur_score = parseInt(user.score);
                        if (answerPosition == 1)
                            cur_score += 10;
                        else if (answerPosition == 2)
                            cur_score += 4;
                        else
                            cur_score += 1;
                        ref.update({score: cur_score});
                        socket.emit('hasil', {status: true, answer: calon_set[idcalon]});

                        var answer = new Firebase('https://cakpres.firebaseio.com/answers/'+answerPosition+'/');
                        answer.set(user);
                        answerPosition++;
                    }
                });
            }
        } else {
            socket.emit('hasil', {status: false, answer: calon_set[idcalon]});
        }
    });
    socket.on('disconnect', function () {
    });
});

request("http://api.pemiluapi.org/calonpresiden/api/caleg?apiKey="+api_key, function(error, response, body) {
    candidate_json = JSON.parse(body);
});

timer();
//pause 30 detik buat soal baru
function timer() {
    setTimeout(function () {
        counter--;
        if (counter < 0) {
            var hasil = candidate_json;
            if (hasil.data) {
                idcalon = Math.floor((Math.random()*calon_set.length-1)+1);
                idjenis = Math.floor((Math.random()*jenis_set.length-1)+1);
                var calon = _.findWhere(hasil.data.results.caleg, {id: calon_set[idcalon]});
                console.log(calon.nama);
                console.log(jenis_set[idjenis].name);
                if (jenis_set[idjenis].category == 1) {
                    idpertanyaan = Math.floor((Math.random()*calon[jenis_set[idjenis].name].length-1)+1);
                    soal = calon[jenis_set[idjenis].name][idpertanyaan][jenis_set[idjenis].field];
                    console.log(soal);
                } else if (jenis_set[idjenis].category == 2) {
                    soal = jenis_set[idjenis].title + ': ';
                    soal += calon[jenis_set[idjenis].name];
                    console.log(soal);
                } else if (jenis_set[idjenis].category == 3) {
                    soal = calon[jenis_set[idjenis].name][jenis_set[idjenis].field];
                    console.log(soal);
                }
            }
            counter = 8;
            answerPosition = 1;
            var del = new Firebase('https://cakpres.firebaseio.com/answers/');
            del.remove();
            io.sockets.emit('soal', {soal: soal, counter: counter});
        }
        timer();
    }, 1000);
}