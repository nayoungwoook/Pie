const { Match } = require('./match');

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

        //**TODO : battle -> rollDice */
        // this.gameState = 'battle';
        this.gameState = 'rollDice';

        this.atk = '';
        this.def = '';
        this.oper = '';

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

        this.matches = [];
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

    sendBattlePacket() {
        //teacher
        let tpak = new Object();
        tpak.teacher = true;


        io.emit('server_battlePacket', {});
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
            } else if (this.gameState == 'battle') {
                this.sendBattlePacket();
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

    initializeMatches() {
        this.matches = [];

        let _users = this.users;
        let _teams = ['red', 'blue', 'green'];

        while (true) {
            let _atk, _def, _oper;
            
            for (let i = 0; i < 3; i++) {
                for (let j = 0; j < _users.length; j++) {
                }
            }

            this.matches.push(new Match(this, _atk, _def, _oper));

            if (_atk == null || _def == null || _oper == null)
                break;
        }
    }

    checkMovement() {
        let _list = ['red', 'blue', 'green'];

        for (let i = 0; i < _list.length; i++)
            if (_list[i] == this.turn)
                _list.splice(i, 1);

        let bat = false;
        let atk = this.turn;
        let def = '';
        let oper = '';
        for (let i = 0; i < _list.length; i++) {
            if (this.tokens[_list[i]] == this.tokens[this.turn]) {
                bat = true;
                def = _list[i];
                _list.splice(i, 1);
                oper = _list[0];
            }
        }

        if (bat && this.gameState != 'battle') {
            //BATTLE
            this.gameState = 'battle';
            this.initializeMatches();
            io.emit('server_battleStart', { roomCode: this.roomCode, atk: atk, def: def, oper: oper });
        } else {
            this.nextTurn();
            this.gameState = 'rollDice';
        }
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
