
/**
 * Module dependencies.
 */

var express = require('express');
var http = require('http');
var path = require('path');
var _ = require('underscore');

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
var idsoal = 0;
var jawab = '';
var counter = 10;
var answerPosition = 1;
var songs = [
    {title:'Serba Salah', artist:'Raisa'},
    {title:'Could It Be', artist:'Raisa'},
    {title:'Pergilah', artist:'Raisa'},
    {title:'Apalah (Arti Menunggu)', artist:'Raisa'},
    {title:'Bye Bye', artist:'Raisa'},
    {title:'Cinta Sempurna', artist:'Raisa'},
    {title:'Firasat', artist:'Raisa'},
    {title:'Inginku', artist:'Raisa'},
    {title:'Mantan Terindah', artist:'Raisa'},
    {title:'Melangkah', artist:'Raisa'},
    {title:'Pemeran Utama', artist:'Raisa'},
    {title:'Terjebak Nostalgia', artist:'Raisa'},
    {title:'Akhir Persahabatan', artist:'Afgan'},
    {title:'Betapa Aku Cinta Padamu', artist:'Afgan'},
    {title:'Biru', artist: 'Afgan'},
    {title:'Bukan Cinta Biasa', artist: 'Afgan'},
    {title:'Entah', artist: 'Afgan'},
    {title:'Hanya Ada Satu', artist: 'Afgan'},
    {title:'Hilang Rasa', artist: 'Afgan'},
    {title:'I.L.U.', artist: 'Afgan'},
    {title:'Klise', artist: 'Afgan'},
    {title:'My Confession', artist: 'Afgan'},
    {title:'PadaMu Ku Bersujud', artist: 'Afgan'},
    {title:'Sadis', artist: 'Afgan'},
    {title:'Shanty Lussy', artist: 'Afgan'},
    {title:'Tanpa Batas Waktu', artist: 'Afgan'},
    {title:'Terima Kasih Cinta', artist: 'Afgan'},
    {title:'Wajahmu Mengalihkan Duniaku', artist: 'Afgan'},
    {title:'Yang Ku Tahu Cinta Itu Indah', artist: 'Afgan'},
    {title:'Adam N Eve', artist:'Nidji'},
    {title:'Airin', artist:'Nidji'},
    {title:'Akhir Cinta Abadi', artist:'Nidji'},
    {title:'Amild Cutting - Biarlah', artist:'Nidji'},
    {title:'Angel', artist:'Nidji'},
    {title:'Arti Sahabat', artist:'Nidji'},
    {title:'Bebas Untuk Menang', artist:'Nidji'},
    {title:'BeBe', artist:'Nidji'},
    {title:'Believe', artist:'Nidji'},
    {title:'Biarlah', artist:'Nidji'},
    {title:'Bila Aku Jatuh Cinta', artist:'Nidji'},
];

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/hello', function(req, res) {
	res.send('Hello World!')
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
            soal = Math.floor((Math.random()*songs.length-1)+1);
            jawab = songs[soal].artist;
            counter = 10;
            answerPosition = 1;
            answerers = {};
            io.sockets.emit('soal', {id: soal, hint: songs[soal].title, soal: acakKata(jawab), counter: counter});
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