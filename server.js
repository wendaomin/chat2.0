var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var path = require('path');
var fs = require('fs');
var usocket = [];
var i = 0;
var allUser = [];
var _ = require('underscore');
app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
})
// app.get('/private', function(req, res){
//   res.sendFile(path.join(__dirname, 'public', 'online-page.html'));
// })
//开放静态资源
app.use(express.static(path.join(__dirname, 'public')));
io.on('connection', function(socket){
  console.log('a user connected');

  socket.on("join", function (name) {
    var data = {};
    socket.name = name;
    allUser[i] = name;
    i++;
    usocket[name] = socket
    data = {
      name: name,
      allUser: allUser
    };
    io.emit("join", data);
    // console.log(allUser);
  })

  socket.on("message", function (msg) {
    io.emit("message", msg) //将新消息广播出去
  })
  socket.on('disconnect', function(msg){
    var i = allUser.indexOf(socket.name);
    allUser.splice(i,1);
    // console.log(allUser);
    var data = {
      name: socket.name,
      allUser:allUser
    }
    // io.emit('join', data)
    io.emit('disconnect', data);
  })
  socket.on('base64 file', function (msg) {
    console.log(socket.name);
    
     msg.username = socket.name;
    // socket.broadcast.emit('base64 image', //exclude sender
    io.sockets.emit('base64 file',  //include sender
        msg
    );
  })
  // console.log(io.sockets.clients());
  io.of('/').clients((error, clients) => {
    if (error) throw error;
    // console.log(clients); // => [PZDoMHjiu8PYfRiKAAAF, Anw2LatarvGVVXEIAAAD]
  })
  //私聊
  socket.on('sayTo',function (privateData) {
    var toName = privateData.toName;
    var toSocket;
    if(toSocket = _.findWhere(io.sockets.sockets,{name:toName})){
       privateData.myName = socket.name;
        toSocket.emit('private',privateData);
    }
})
socket.on('disconnect', function(){
    // console.log(socket.name+' connection is disconnect!');
})
})

http.listen(3000, function() {
  console.log('listening on *:3000');
})