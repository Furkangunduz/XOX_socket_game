const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT);

const { rooms, createRoom, joinRoom, delRoom } = require('./server-func');

const io = require('socket.io')(server, {
	cors: {
		origin: '*',
		methods: ['GET', 'POST'],
	},
});

app.get('/', (req, res) => {
	res.send('Server on');
});

io.on('connection', (socket) => {
	let roomName = '';

	console.log(`new connection ${socket.id}`);

	socket.on('disconnect', () => {
		console.log('user disconnected');
		delRoom(roomName, socket.id);
	});

	socket.on('create-room', (roomid) => {
		roomName = roomid;

		if (rooms[roomid]) {
			socket.emit('message', 'room already exist');
			return;
		}
		createRoom(roomid, socket.id);
		rooms[roomid].map = ['', '', '', '', '', '', '', '', ''];
		socket.join(roomid);
		socket.emit('message', 'Waiting for player. . .');
		socket.emit('your-move', 'X');
	});

	socket.on('join-room', (roomid) => {
		roomName = roomid;
		if (!rooms[roomid]) {
			socket.emit('message', 'cannot find the room');
			return;
		}
		joinRoom(roomid, socket.id);
		socket.join(roomid);
		io.to(`${roomid}`).emit('player-2-connected', roomid);
		socket.emit('your-move', 'O');
	});

	socket.on('move', (index, roomid) => {
		console.log(`move on ${roomid}`);
		let move;

		rooms[roomid].forEach((element) => {
			if (element[0] === socket.id) move = element[1];
		});

		rooms[roomid].map[index] = move;
		socket.broadcast.to(`${roomid}`).emit('new-map', rooms[roomid].map); // send message to room except sender
	});
	server.on('restart', (roomid) => {
		rooms[roomid].map = ['', '', '', '', '', '', '', '', ''];
		socket.broadcast.to(`${roomid}`).emit('restart');
	});
});
