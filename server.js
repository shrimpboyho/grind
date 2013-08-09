// Include the things we need

var express = require('express');
var io = require('socket.io');
var http = require('http');
var blackmonkey = require('blackmonkey');

// Create the express app and a server out of it

var app = express();

app.use("/", express.static(__dirname + '/public/'));

var server = http.createServer(app);

server.listen(8000);

console.log('Listening on port 8000');

// Pass into blackmonkey and start the chat

blackmonkey.setServer(server);
blackmonkey.setSocket(io);
io = blackmonkey.initChat();

/* CODE FOR THE WORLD */

var world;

io.sockets.on('connection', function(socket) {

	// On every new connection send the client a copy of the world

	socket.emit('firstConnectionLoad', {world: world});

	// Interpret every world change and send the world to all the clients

	socket.on('worldUpdate', function(data) {
		console.log("Recieved updated world:\n" + data);
		world = data.world;
		io.sockets.emit('newWorldLoad', data);
	});

});