const express = require('express');
const fs = require('fs');
const app = express();
const path = require('path');
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

module.exports = { io };

const { User } = require('./server/user');
var { Room, rooms, makeRoom, getRoom } = require("./server/room");
const { isObject } = require('util');

app.use(express.static('client'));

app.get('/', (req, res) => {
    res.end(fs.readFileSync('client/html/index.html', 'utf-8'));
});

app.get('/login', (req, res) => {
    res.end(fs.readFileSync('client/html/login.html', 'utf-8'));
});

app.get('/waiting', (req, res) => {
    res.end(fs.readFileSync('client/html/waiting.html', 'utf-8'));
});

app.get('/game', (req, res) => {
    res.end(fs.readFileSync('client/html/game.html', 'utf-8'));
});

io.on('connection', (socket) => {
    //user connected
    socket.on('disconnect', () => {
        //user disconnected
    });
});

sendPacketToUser = (roomCode, id, pak) => {
    io.emit('server_userPacket', { roomCode: roomCode, id: id, pak: pak });
}

io.on('connection', (socket) => {
    //방 만들기
    socket.on('client_makeRoom', (pak) => {
        if (pak.id == '') {
            io.emit('server_error', { text: "그 id 는 사용할 수 없습니다!" });
            return;
        }
        let room = makeRoom();

        io.emit('server_roomEnter', { roomCode: room.code, teacher: true, id: pak.id });
    });

    socket.on('client_rollDice', (pak) => {
        let room = getRoom(pak.roomCode);
        room.diceRollTargetUser = null;
        room.dice = Math.round(Math.random() * 5) + 1;
        console.log(room.code + ' at team ' + room.turn + ' roll dice : ' + room.dice);
        room.gameState = 'movement';

        //send roll dice event
        io.emit('server_rollDice', { roomCode: pak.roomCode, dice: room.dice });

        setTimeout(() => {
            room.tokens[room.turn] += room.dice;
            if (room.tokens[room.turn] >= 20)
                room.tokens[room.turn] = 0;

            room.checkMovement();
        }, 3500);
    });

    socket.on('client_keyInput', (pak) => {
        let room = getRoom(pak.roomCode);
        if (room != undefined) {
            let user = room.getUser(pak.id);

            user.keys = pak.keys;
        }
    });

    socket.on('client_gameStart', (pak) => {
        let room = getRoom(pak.roomCode);
        room.state = 'game';
        io.emit('server_gameStart', { roomCode: room.code });
    });

    socket.on('client_changeTeam', (pak) => {
        let room = getRoom(pak.roomCode);
        if (room != undefined) {
            let user = room.getUser(pak.id);

            if (user != undefined) {
                user.r = 100;
                if (pak.team == 'red')
                    user.team = 'green';
                else if (pak.team == 'green')
                    user.team = 'blue';
                else
                    user.team = 'red';
            }
        }
    });

    socket.on('client_enterRoom', (pak) => {
        let room = getRoom(pak.code);

        if (room == null) {
            io.emit('server_error', { text: "코드가 잘못되었습니다!" });
            return;
        }

        let ol = false;
        for (let i = 0; i < room.users.length; i++) {
            if (room.users[i].id == pak.id) {
                ol = true;
                break;
            }
        }

        if (pak.id == '' || ol) {
            io.emit('server_error', { text: "그 id 는 이미 있거나 사용할 수 없습니다!" });
            return;
        }

        room.users.push(new User(pak.id, false));
        io.emit('server_roomEnter', { roomCode: room.code, teacher: false, id: pak.id });
    });
});

server.listen(3000, () => {
    console.log('listening on *:3000');
});

setInterval(() => {
    for (let i = 0; i < rooms.length; i++)
        rooms[i].update();
}, (1000 / 60));