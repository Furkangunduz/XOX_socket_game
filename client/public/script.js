const allCells = document.querySelectorAll('.cell');
const winnerText = document.getElementById('winner');
const restartBtn = document.getElementById('restartBtn');
const restartPage = document.getElementById('restartPage');

const joinRoomBtn = document.getElementById('join-room');
const createRoomBtn = document.getElementById('create-room');
const roomIdInput = document.getElementById('room-id');
const LoginMessasge = document.getElementById('message');
const loginPage = document.getElementById('loginPage');

var map = ['', '', '', '', '', '', '', '', ''];

const winCon = [
	[0, 1, 2],
	[3, 4, 5],
	[6, 7, 8],
	[0, 3, 6],
	[1, 4, 7],
	[2, 5, 8],
	[0, 4, 8],
	[2, 4, 6],
];
var isMyTurn = true;
var myMove;
var roomId;

//socket

const socket = io('http://localhost:3000');

createRoomBtn.addEventListener('click', () => {
	roomId = roomIdInput.value.trim();
	socket.emit('create-room', roomId);
});

joinRoomBtn.addEventListener('click', () => {
	roomId = roomIdInput.value.trim();
	socket.emit('join-room', roomId);
});

socket.on('message', (message) => {
	LoginMessasge.innerText = message;
});
socket.on('your-move', (move) => {
	myMove = move;
});

socket.on('player-2-connected', () => {
	loginPage.classList.add('hide');
	startGame();
});

socket.on('new-map', (newMap) => {
	map = newMap;
	console.log(map);
	allCells.forEach((cell) => {
		cell.innerText = newMap[cell.classList[1]];
	});
	isMyTurn = true;
	isfinishGame();
});

socket.on('restart', () => {
	startGame();
});
restartBtn.addEventListener('click', () => {
	socket.emit('restart', roomId);
	startGame();
});

startGame();

function startGame() {
	restartPage.classList.remove('show');

	map = ['', '', '', '', '', '', '', '', ''];

	isMyTurn = true;
	allCells.forEach((cell) => {
		cell.innerHTML = '';
		cell.removeEventListener('click', handleClick);
		cell.addEventListener('click', handleClick, { once: true });
	});
}

function handleClick(e) {
	if (isMyTurn && !e.target.innerHTML) {
		e.target.innerText = myMove;
		updateMap(e, myMove);
		isMyTurn = false;
	}
}

async function updateMap(e) {
	let index = e.target.classList[1];
	if (!map[index]) map[index] = myMove;
	socket.emit('move', index, roomId);
	isfinishGame();
}

function isfinishGame() {
	let winner = checkWin();
	let haveEmptyCell = map.some((row) => row.includes(''));
	if (!winner && !haveEmptyCell) {
		winnerText.innerText = 'DRAW !';
		restartPage.classList.add('show');
		allCells.forEach((cell) => {
			cell.innerHTML = '';
			cell.removeEventListener('click', handleClick);
			return 1;
		});
	} else {
		if (winner) {
			if (winner == myMove) winnerText.innerText = 'You Win !';
			else {
				winnerText.innerText = 'You lost';
			}
			restartPage.classList.add('show');
			allCells.forEach((cell) => {
				cell.innerHTML = '';
				cell.removeEventListener('click', handleClick);
			});
			return 1;
		}
	}
	return 0;
}

function checkWin() {
	let winner = '';
	winCon.forEach((arr) => {
		const first = arr[0];
		const second = arr[1];
		const third = arr[2];
		if (map[first] == map[second] && map[second] == map[third] && map[first] == map[third]) {
			if (map[first] == 'X') winner = 'X';
			else if (map[first] == 'O') winner = 'O';
		}
	});
	return winner;
}
