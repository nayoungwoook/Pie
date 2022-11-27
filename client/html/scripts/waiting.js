var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');

var socket = io();

const urlStr = location;
const url = new URL(urlStr);

const urlParams = url.searchParams;

var camera = { x: 0, y: 0, z: 1, rotation: 0 };
var targetPos = { x: 0, y: 0, z: 1, rotation: 0 };

var users = [];

class User {
    constructor(id, team, x, y, r) {
        this.id = id;
        this.team = team;
        this.x = x;
        this.y = y;
        this.r = r;
    }
}

renderUser = (user) => {
    let outL;
    if (user.team == 'red') {
        outL = '#EF477B';
    } else if (user.team == 'green') {
        outL = '#53E883';
    } else {
        outL = '#5355E8';
    }

    let pos = calculateRenderData({ x: user.x, y: user.y }, user.r, user.r, camera);

    ctx.beginPath();
    ctx.strokeStyle = outL;
    ctx.lineWidth = 16;
    ctx.arc(pos.position.x + pos.renderWidth / 2, pos.position.y + pos.renderHeight / 2, pos.renderWidth, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = 'rgb(255, 255, 255)';
    ctx.textAlign = 'center';
    ctx.font = '50px Gmarket';
    ctx.fillText(user.id, pos.position.x + pos.renderWidth / 2, pos.position.y + pos.renderHeight / 2 + 15);
}

//#region SERVER_SENDING
socket.on('server_waitingRoomData', (pak) => {
    if (pak.roomCode != urlParams.get('roomCode'))
        return;

    users = pak.users;

    for (let i = 0; i < users.length; i++) {
        if (users[i].id == urlParams.get('id'))
            app.me = users[i];
    }
});

socket.on('server_gameStart', (pak) => {
    if (urlParams.get('roomCode') == pak.roomCode) {
        location.href = '/game?teacher=' + urlParams.get('teacher') + '&id=' + urlParams.get('id') + '&roomCode=' + urlParams.get('roomCode') + '&team=' + app.team;
    }
});
//#endregion

class App {
    constructor() {
        this.roomCode = '';
        this.team = '';
        this.id = '';
        this.teacher = false;
        this.me = null;

        this.roomCodeY = -100;
    }

    update() {
        this.roomCode = urlParams.get('roomCode');
        this.teacher = urlParams.get('teacher');
        this.id = urlParams.get('id');

        if (this.me != null) {
            this.team = this.me.team;
        }

        if (this.teacher == 'true') {
            if (keys.w)
                targetPos.y -= 12;
            if (keys.s)
                targetPos.y += 12;
            if (keys.a)
                targetPos.x -= 12;
            if (keys.d)
                targetPos.x += 12;
        } else {
            socket.emit('client_keyInput', { keys: keys, roomCode: this.roomCode, id: this.id });
            if (this.me != null) {
                targetPos.x = this.me.x - canvas.width / 2;
                targetPos.y = this.me.y - canvas.height / 2;
            }
        }

        this.roomCodeY += (100 - this.roomCodeY) / 10;

        camera.x += (targetPos.x - camera.x) / 3;
        camera.y += (targetPos.y - camera.y) / 3;
        camera.z += (targetPos.z - camera.z) / 5;
        camera.rotation += (targetPos.rotation - camera.rotation) / 5;
    }

    render() {
        //BG RENDER
        ctx.fillStyle = 'rgb(40, 40, 40)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        //USER RENDER
        for (let i = 0; i < users.length; i++) {
            renderUser(users[i]);
        }

        //SCORE BOARD RENDER
        if (urlParams.get('teacher') == 'true') {
            this.renderScoreBoard(users.length);
            this.renderGameStartButton();
        }

        if (urlParams.get('teacher') == 'true') {
            //room code
            ctx.font = '35px Gmarket';
            ctx.textAlign = 'center';
            ctx.fillStyle = 'rgb(255, 255, 255)';

            ctx.fillText('Room Code : ' + this.roomCode, canvas.width / 2, this.roomCodeY);
        }
    }

    renderGameStartButton() {
        if (Math.abs(mouse.x - canvas.width / 2) <= 200 && Math.abs(mouse.y - (canvas.height - 192)) <= 30) {
            ctx.fillStyle = 'rgb(255, 255, 245)';
            if (mouse.left) {
                socket.emit('client_gameStart', { roomCode: this.roomCode });
                mouse.left = false;
            }
        } else {
            ctx.fillStyle = 'rgb(155, 155, 145)';
        }
        ctx.font = '40px Gmarket';
        ctx.textAlign = 'center';
        ctx.fillText('GAME START', canvas.width / 2, canvas.height - 180);
    }

    renderScoreBoard(len) {
        for (let i = 0; i < len; i++) {

            if (Math.abs(mouse.x - 200) <= 200 && Math.abs(mouse.y - (90 + i * 30)) <= 13) {
                ctx.fillStyle = 'rgba(20, 20, 20, 1)';

                if (mouse.left) {
                    socket.emit('client_changeTeam', { id: users[i].id, team: users[i].team, roomCode: this.roomCode });
                    console.log(users[i]);
                    mouse.left = false;
                }
            } else {
                ctx.fillStyle = 'rgba(20, 20, 20, 0.7)';
            }
            ctx.fillRect(0, 80 + i * 30, 400, 30);

            ctx.font = '12px Gmarket';
            ctx.textAlign = 'left';

            if (users[i].team == 'red')
                ctx.fillStyle = '#EF477B';
            if (users[i].team == 'green')
                ctx.fillStyle = '#53E883';
            if (users[i].team == 'blue')
                ctx.fillStyle = '#5355E8';

            ctx.fillText(users[i].id + ' | ' + users[i].team, 10, 100 + i * 30);
        }
    }

    resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    tick() {
        this.resize();
        this.update();
        ctx.imageSmoothingEnabled = false;
        this.render();
    }
}

var app = new App();
setInterval(function () { app.tick() }, 1000 / 60);