const allCells = document.querySelectorAll('.cell');
const winnerText = document.getElementById('winner');
const restartBtn = document.getElementById('restartBtn');
const restartPage = document.getElementById('restartPage');

const joinRoomBtn = document.getElementById('join-room');
const createRoomBtn = document.getElementById('create-room');
const roomIdInput = document.getElementById('room-id');
const LoginMessasge = document.getElementById('message');
const loginPage = document.getElementById('loginPage');

const turn = document.getElementById('turn');

const winConditions = [
	[0, 1, 2],
	[3, 4, 5],
	[6, 7, 8],
	[0, 3, 6],
	[1, 4, 7],
	[2, 5, 8],
	[0, 4, 8],
	[2, 4, 6],
];
var map = [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '];
var isMyTurn = false;
var myMove;
var roomId;

/////socket
const socket = io('http://localhost:3000');

// catch message from server
socket.on('message', (message) => {
	LoginMessasge.innerText = message;
});

//set player "X" or "O" from server
//X will start First
socket.on('your-move', (move) => {
	myMove = move;
	if (myMove == 'X') swapTurn();
});

// if all players connected hide the login page start the game
socket.on('connected', () => {
	console.log('a');
	loginPage.classList.add('hide');
});

//reset the game
socket.on('reset', () => {
	console.log('restart');
	restartPage.classList.remove('show');
	map = [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '];
	startGame();
});

//When put X or O to the map
//players get updated map from server
socket.on('new-map', (newMap) => {
	allCells.forEach((cell) => {
		cell.innerText = newMap[cell.classList[1]];
	});
	map = newMap;
	swapTurn();
	checkIsGameFinished();
});

/////event listeners
createRoomBtn.addEventListener('click', () => {
	roomId = roomIdInput.value.trim();
	socket.emit('create-room', roomId);
});

joinRoomBtn.addEventListener('click', () => {
	roomId = roomIdInput.value.trim();
	socket.emit('join-room', roomId);
});

restartBtn.addEventListener('click', () => {
	socket.emit('reset', roomId);
});

startGame();

function startGame() {
	allCells.forEach((cell) => {
		cell.innerHTML = ' ';
		cell.removeEventListener('click', handleClick);
		cell.addEventListener('click', handleClick);
	});
}

function handleClick(e) {
	if (isMyTurn && e.target.innerHTML === ' ') {
		e.target.innerText = myMove;
		updateMap(e, myMove);
	}
}

function updateMap(e) {
	let index = e.target.classList[1];
	if (map[index] == ' ') map[index] = myMove;
	socket.emit('move', index, roomId);
	swapTurn();
	checkIsGameFinished();
}

function checkIsGameFinished() {
	let winner = findWinner();
	let haveEmptyCell = map.some((row) => row.includes(' '));
	if (!haveEmptyCell) {
		if (!winner) {
			winnerText.innerText = 'DRAW !';
			restartPage.classList.add('show');
		}
	} else {
		if (winner) {
			if (winner == myMove) winnerText.innerText = 'You Win !';
			else {
				winnerText.innerText = 'You lost';
			}
			restartPage.classList.add('show');
		}
	}
}

function swapTurn() {
	isMyTurn = !isMyTurn;
}

function findWinner() {
	let winner = '';
	winConditions.forEach((arr) => {
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
