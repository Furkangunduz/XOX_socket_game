var rooms = {};

//First player Use "X"
//Second Player use "O"
const createRoom = (roomId, userId) => {
	rooms[roomId] = [[userId, 'X'], ''];
};

const joinRoom = (roomId, userId) => {
	rooms[roomId][1] = [userId, 'O'];
};

const delRoom = (roomId, userId) => {
	if (roomId) {
		let pindex;
		let emptyArr = ['', ''];
		rooms[roomId].forEach((element, index) => {
			if (element[0] === userId) {
				pindex = index;
			}
		});
		rooms[roomId][pindex] = emptyArr;

		if (
			rooms[roomId][0].every((val, index) => val === emptyArr[index]) &&
			rooms[roomId][1].every((val, index) => val === emptyArr[index])
		) {
			delete rooms[roomId];
			console.log(`${roomId} => there is no player. Room deleted`);
		}
	}
};

module.exports = { rooms, createRoom, joinRoom, delRoom };
