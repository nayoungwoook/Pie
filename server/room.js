// var sendPacket = require('../server').sendPacket;
var io = require('..').io;

var rooms = [];

class Room {
    constructor() {
        this.samples = [
            'A', 'B', 'C', 'D',
            'E', 'F', 'G', 'H',
            'I', 'J', 'K', 'L',
            'M', 'N', 'O', 'P',
            'Q', 'R', 'S', 'T',
        ];

        this.code = this.makeCode();

        this.dice = 0;
        this.diceRollTargetUser = null;

        this.turn = 'red';
        this.state = 'waiting';
        this.gameState = 'rollDice';

        this.users = [];
        this.tokens = {
            'red': 0,
            'blue': 0,
            'green': 0,
        };
        this.buildings = {
            'red': [],
            'blue': [],
            'green': [],
        };

    }

    sendWaitingRoomPacket() {
        let pak = new Object();
        pak.roomCode = this.code;
        pak.users = [];

        for (let i = 0; i < this.users.length; i++) {
            let user = new Object();
            user.x = this.users[i].position.x;
            user.y = this.users[i].position.y;
            user.id = this.users[i].id;
            user.r = this.users[i].r;
            user.team = this.users[i].team;
            pak.users.push(user);
        }

        io.emit('server_waitingRoomData', pak);
    }

    updateWaitingRoom() {
        for (let i = 0; i < this.users.length; i++) {
            this.users[i].update();
        }

        this.sendWaitingRoomPacket();
    }

    sendGamePacket() {
        let pak = new Object();
        pak.redToken = this.tokens['red'];
        pak.blueToken = this.tokens['blue'];
        pak.greenToken = this.tokens['green'];
        pak.gameState = this.gameState;
        pak.turn = this.turn;
        pak.buildings = this.buildings;
        pak.diceRollTargetUser = this.diceRollTargetUser;
        pak.roomCode = this.code;

        io.emit('server_gamePacket', pak);
    }

    updateGame() {
        this.sendGamePacket();
        if (this.state == 'game') {
            if (this.gameState == 'rollDice') {
                if (this.diceRollTargetUser == null) {
                    let teamUsers = [];
                    for (let i = 0; i < this.users.length; i++) {
                        if (this.users[i].team == this.turn) {
                            teamUsers.push(this.users[i]);
                        }
                    }

                    this.diceRollTargetUser = teamUsers[Math.round(Math.random() * (teamUsers.length - 1))];
                }
                if (this.diceRollTargetUser != null)
                    io.emit('server_popupRollDice', { roomCode: this.roomCode, id: this.diceRollTargetUser.id });
            } else if (this.gameState == 'movement') {
                // TODO : DO SOMETHING


            }
        }
    }

    getUser(id) {
        for (let i = 0; i < this.users.length; i++) {
            if (this.users[i].id == id)
                return this.users[i];
        }
    }

    update() {
        if (this.state == 'waiting') {
            this.updateWaitingRoom();
        } else if (this.state == 'game') {
            this.updateGame();
        }
    }

    checkMovement() {
        let ff = this.tokens[this.turn] == 'blue' && this.turn != 'blue', ss = this.tokens[this.turn] == 'green' && this.turn != 'green', tt = this.tokens[this.turn] == 'red' && this.turn != 'red';
        if (ff || ss || tt) {
            //BATTLE
        }

        this.nextTurn();
        this.gameState = 'rollDice';
    }

    nextTurn() {
        if (this.turn == 'red')
            this.turn = 'green';
        else if (this.turn == 'blue')
            this.turn = 'red';
        else if (this.turn == 'green')
            this.turn = 'blue';
    }

    makeCode() {
        let done = false;
        let code = '';

        while (!done) {
            for (let i = 0; i < 6; i++) {
                code += this.samples[Math.round(Math.random() * (this.samples.length - 1))];
            }

            done = true;
            for (let i = 0; i < rooms.length; i++) {
                if (rooms[i].code == code)
                    done = false;
            }
        }

        return code;
    }
}

getRoom = (code) => {
    for (let i = 0; i < rooms.length; i++) {
        if (rooms[i].code.toUpperCase() == code) {
            return rooms[i];
        }
    }
}

makeRoom = () => {
    rooms.push(new Room());
    return rooms[rooms.length - 1];
}

module.exports = { rooms, Room, getRoom, makeRoom };
