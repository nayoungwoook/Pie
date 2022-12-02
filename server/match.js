class Match {
    constructor(room, atk, def, oper) {
        this.room = room;
        this.atk = atk;
        this.def = def;
        this.oper = oper;
        this.matchId = this.createMatchId();

        console.log(`match created! id : ${this.matchId}, atk : ${atk.id}, def : ${def.id}, oper : ${oper.id}`);
    }

    createMatchId() {
        let temp = ['0', '1', '2', '3', '4', '5', 'a', 'b', 'c', 'd', 'e', 'f'];
        let done = false;

        while (!done) {
            let id = '';
            for (let i = 0; i < 8; i++) {
                id += temp[Math.round(Math.random() * (temp.length - 1))];
            }

            let _d = true;
            for (let i = 0; i < this.room.matches.length; i++) {
                if (this.room.matches[i].matchId == id) {
                    _d = false;
                }
            }
            if (_d) {
                done = true;
                break;
            }
        }
    }
}

module.exports = { Match };