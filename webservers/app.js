
/**
 * Module dependencies.
 */

var express = require('express');
var http = require('http');
var path = require('path');
var _ = require('underscore');
var request = require('request');

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

var users = [];
var onlineUsers = [];
var answerers = {};

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
var counter = 5;
var answerPosition = 1;


// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', function(req, res) {
	res.send('Cakpres API v.0.0.1!')
});

app.get('/api/refresh', function(req, res) {
    request("http://api.pemiluapi.org/calonpresiden/api/caleg?apiKey=fea6f7d9ec0b31e256a673114792cb17", function(error, response, body) {
      candidate_json = JSON.parse(body);
      res.send('ok!');
    });
});

var server = http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

// SOCKET.IO starts

var io = require('socket.io').listen(server);

io.sockets.on('connection', function (socket) {
    socket.on('addUser', function (nama) {
        socket.nama = nama;
        onlineUsers.push(nama);
        var user = _.findWhere(users, {nama: nama});
        if (!user) users.push({nama:nama, score:0});
        io.sockets.emit('updateChat', {nama: nama, message: nama + ' baru saja terhubung'});
        io.sockets.emit('updateUsers', {users: users, online: makeOnline(), counter: counter});
        socket.emit('updateMe', {score: myScore()});
    });
    socket.on('jawab', function (data) {
        var user = _.findWhere(users, {nama: socket.nama});
        if (jawab.toLowerCase() == data.jawab.toLowerCase()) {
            if (user && answerPosition <= 5 && !answerers[socket.nama]) {
                answerers[socket.nama] = true;
                if (answerPosition == 1)
                    user.score += 10;
                else if (answerPosition == 2)
                    user.score += 4;
                else
                    user.score += 1;
                socket.emit('hasil', {status:true, score:user.score});
                // users.sort(function(n){ return n.score * -1; });
                io.sockets.emit('updateUsers', {users: users, online: makeOnline(), counter: counter});
                io.sockets.emit('updateWinner', {user: socket.nama, position: answerPosition});
                socket.emit('updateMe', {score: myScore(), position: answerPosition});
                answerPosition++;
            }
        } else {
            if (user) {
                socket.emit('hasil', {status:false, score: user.score});
            }
        }
    });
    socket.on('sendMessage', function (message) {
        io.sockets.emit('updateChat', {nama: socket.nama, message: message}); 
    });
    socket.on('disconnect', function () {
        var index = onlineUsers.indexOf(socket.nama);
        onlineUsers.splice(index, 1);
        io.sockets.emit('updateChat', {nama: socket.nama, message: socket.nama + ' terputus'});
        io.sockets.emit('updateUsers', {users: users, online: makeOnline(), counter: counter});
    });
    function myScore() {
        return _.findWhere(users, {nama: socket.nama}).score;
    }
    function makeOnline() {
        var baru = [];
        for (var i = 0; i < onlineUsers.length; i++) {
            baru.push({nama: onlineUsers[i], score: _.findWhere(users, {nama: onlineUsers[i]}).score });
        }
        return baru;
    }
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
                // console.log(idjenis);
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
               
            counter = 5;
            answerPosition = 1;
            answerers = {};
            // io.sockets.emit('soal', {id: soal, hint: songs[soal].title, soal: acakKata(jawab), counter: counter});
        }
        timer();
    }, 1000);
}

function acakKata(data) {
    var baru = data.split('');
    for (var i = 0; i < data.length; i++) {
        var random = Math.floor((Math.random()*data.length-1)+1);
        var temp = baru[i];
        baru[i] = baru[random];
        baru[random] = temp;
    }
    hasil = baru.join('');
    return hasil.toUpperCase();
}