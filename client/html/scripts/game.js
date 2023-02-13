var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');
var socket = io();

const urlStr = location;
const url = new URL(urlStr);
const urlParams = url.searchParams;

var turn = 'blue';
var camera = { x: 0, y: 0, z: 1, rotation: 0 };
var targetPos = { x: 0, y: 0, z: 1, rotation: 0 };

var diceRollActivated = false;

var board = new Image();
board.src = 'assets/board.png';

//#region  bg color
const TEAM_COLOR = {
	RED: '#EF477B',
	GREEN: '#53E883',
	ORANGE: '#F06831',
	BLUE: '#5355E8',
};
//#endregion

//#region TOKEN
const TOKEN = {
	'blue': new Image(),
	'red': new Image(),
	'green': new Image(),
};
TOKEN['blue'].src = 'assets/tokens/blue.png';
TOKEN['red'].src = 'assets/tokens/red.png';
TOKEN['green'].src = 'assets/tokens/green.png';
//#endregion

socket.on('server_gamePacket', (pak) => {
	if (pak.roomCode == urlParams.get('roomCode')) {
		app.targetToken['red'] = pak.redToken;
		app.targetToken['blue'] = pak.blueToken;
		app.targetToken['green'] = pak.greenToken;
		app.gameState = pak.gameState;

		if (pak.diceRollTargetUser != null && pak.diceRollTargetUser.id == urlParams.get('id')) {
			diceRollActivated = true;
		} else {
			diceRollActivated = false;
		}

		turn = pak.turn;
	}
});

socket.on('server_rollDice', (pak) => {
	if (pak.roomCode == urlParams.get('roomCode')) {
		diceRollActivated = false;
		app.dice.rollDice(pak.dice);
	}
});

socket.on('server_popupRollDice', (pak) => {
	if (pak.id == urlParams.get('id') && pak.roomCode == urlParams.get('roomCode')) {
		diceRollActivated = true;
	}
});
class App {

	constructor() {
		this.diceRollButton = false;

		this.dice = new Dice();

		this.bgc = "";

		this.token = {
			'red': 0,
			'blue': 0,
			'green': 0,
		};

		this.targetToken = {
			'red': 0,
			'blue': 0,
			'green': 0,
		};

		this.buildings = {
			'red': [],
			'blue': [],
			'green': [],
		};

		this.tokenPosition = {
			'red': { x: 0, y: 0 },
			'blue': { x: 0, y: 0 },
			'green': { x: 0, y: 0 },
		}

		this.boards = [];
		for (let i = 0; i < 20; i++)
			this.boards.push({ x: 0, y: 0 });

		this.gameState = "game";
		this.boardScale = 0;
		this.rollDiceButtonY = 0;
		this.initialize = false;
	}

	update() {
		camera.x += (targetPos.x - camera.x) / 30;
		camera.y += (targetPos.y - camera.y) / 30;
		camera.z += (targetPos.z - camera.z) / 50;
		camera.rotation += (targetPos.rotation - camera.rotation) / 5;

		if (this.battleScene != null)
			this.battleScene.update();

		this.dice.update();
		this.boardScale += (150 - this.boardScale) / 20;

		targetPos.z = 1;
		targetPos.x = 0;
		targetPos.y = 0;

		this.calculateTokenPosition('red');
		this.calculateTokenPosition('blue');
		this.calculateTokenPosition('green');
	}

	calculateTokenPosition(team) {

		if (this.targetToken[team] != this.token[team]) {
			if (Math.sqrt(
				(this.boards[this.token[team]].x - this.tokenPosition[team].x) ** 2 +
				(this.boards[this.token[team]].y - this.tokenPosition[team].y) ** 2) <= 25) {

				this.token[team]++;

				if (this.token[team] == 20)
					this.token[team] = 0;
			}

			targetPos.z = 1.05;
			targetPos.x = (this.tokenPosition[team].x - canvas.width / 2) / 15;
			targetPos.y = (this.tokenPosition[team].y - canvas.height / 2) / 15;
		}

		let xv = (this.boards[this.token[team]].x - this.tokenPosition[team].x), yv = (this.boards[this.token[team]].y - this.tokenPosition[team].y);

		let div = 15;
		xv /= div;
		yv /= div;

		if (this.token[team] != null && this.boards[Math.round(this.token[team])] != undefined) {
			this.tokenPosition[team].x += xv;
			this.tokenPosition[team].y += yv;
		}

		this.collision(team, 'red');
		this.collision(team, 'blue');
		this.collision(team, 'green');
	}

	collision(team, team2) {
		if (team != team2) {
			if (this.tokenPosition[team2].x == this.tokenPosition[team].x) {
				if (this.tokenPosition[team2].y == this.tokenPosition[team].y) {
					this.tokenPosition[team2].x += Math.round(Math.random() * 10) - 5;
					this.tokenPosition[team2].y += Math.round(Math.random() * 10) - 5;
				}
			}
		}
		let xx = (this.tokenPosition[team2].x - this.tokenPosition[team].x) * (this.tokenPosition[team2].x - this.tokenPosition[team].x);
		let yy = (this.tokenPosition[team2].y - this.tokenPosition[team].y) * (this.tokenPosition[team2].y - this.tokenPosition[team].y);

		if (Math.sqrt(xx + yy) <= 35) {
			this.tokenPosition[team2].x += (this.tokenPosition[team2].x - this.tokenPosition[team].x) / 20;
			this.tokenPosition[team2].y += (this.tokenPosition[team2].y - this.tokenPosition[team].y) / 20;
			this.tokenPosition[team].x += (this.tokenPosition[team].x - this.tokenPosition[team2].x) / 20;
			this.tokenPosition[team].y += (this.tokenPosition[team].y - this.tokenPosition[team2].y) / 20;
		}
	}

	createBattleScene(left, center, right, myDirection) {
		this.battleScene = new BattleScene(this, left, center, right, myDirection);
	}

	renderRollDiceButton() {
		if (Math.abs(mouse.x - (canvas.width / 2)) <= 250 && Math.abs(mouse.y - (canvas.height - 305) - 20) <= 20) {
			ctx.fillStyle = 'rgb(255, 255, 245)';
			if (mouse.left && diceRollActivated) {
				diceRollActivated = false;
				socket.emit('client_rollDice', { roomCode: urlParams.get('roomCode'), id: urlParams.get('id') });
				mouse.left = false;
			}
		}
		else
			ctx.fillStyle = 'rgb(155, 155, 145)';

		ctx.font = '45px RubikMonoOne';
		ctx.textAlign = 'center';
		ctx.fillText('ROLL DICE!', canvas.width / 2, canvas.height - 260 + this.rollDiceButtonY);
	}

	calculateRenderDataShort(x, y, width, height) {
		let _ans = calculateRenderData({ x: x, y: y }, width, height, camera);
		return { x: _ans.position.x + _ans.renderWidth / 2, y: _ans.position.y + _ans.renderHeight / 2, width: _ans.renderWidth, height: _ans.renderHeight };
	}

	renderGameBoard() {
		ctx.lineWidth = 10;
		let j = 0;

		for (let i = 0; i < 6; i++) {

			if (i == 5 || i == 0)
				ctx.strokeStyle = '#CEE853';
			else
				ctx.strokeStyle = '#53E883';

			ctx.beginPath();
			let calc = this.calculateRenderDataShort(canvas.width / 2 - ((3) * this.boardScale), canvas.height / 2 - ((i - 2) * this.boardScale), 130, 130)
			ctx.roundRect(calc.x, calc.y, calc.width, calc.height, 15);
			this.boards[j].x = calc.x;
			this.boards[j].y = calc.y;
			ctx.stroke();
			j++;
		}

		for (let i = 4; i > 0; i--) {
			ctx.strokeStyle = '#5355E8';
			ctx.beginPath();
			let calc = this.calculateRenderDataShort(canvas.width / 2 - ((-2 + i) * this.boardScale), canvas.height / 2 - ((3) * this.boardScale), 130, 130)
			ctx.roundRect(calc.x, calc.y, calc.width, calc.height, 15);
			this.boards[j].x = calc.x;
			this.boards[j].y = calc.y;
			ctx.stroke();
			j++;
		}

		for (let i = 6; i > 0; i--) {
			if (i == 6 || i == 1)
				ctx.strokeStyle = '#CEE853';
			else
				ctx.strokeStyle = '#F06831';

			ctx.beginPath();
			let calc = this.calculateRenderDataShort(canvas.width / 2 - ((-2) * this.boardScale), canvas.height / 2 - ((i - 3) * this.boardScale), 130, 130)
			ctx.roundRect(calc.x, calc.y, calc.width, calc.height, 15);
			this.boards[j].x = calc.x;
			this.boards[j].y = calc.y;
			ctx.stroke();
			j++;
		}

		for (let i = 4; i > 0; i--) {
			ctx.strokeStyle = '#EF477B';
			ctx.beginPath();
			let calc = this.calculateRenderDataShort(canvas.width / 2 - ((3 - i) * this.boardScale), canvas.height / 2 - ((-2) * this.boardScale), 130, 130)
			ctx.roundRect(calc.x, calc.y, calc.width, calc.height, 15);
			this.boards[j].x = calc.x;
			this.boards[j].y = calc.y;
			ctx.stroke();
			j++;
		}

		ctx.font = `${this.boardScale / 5}px RubikMonoOne`
		ctx.fillStyle = 'rgb(255, 255, 245)';
	}

	render() {
		ctx.fillStyle = this.bgc;
		ctx.fillRect(0, 0, canvas.width, canvas.height);

		if (this.gameState == 'rollDice' || this.gameState == 'movement') {
			this.renderGameBoard();

			this.dice.render();
			if (diceRollActivated)
				this.renderRollDiceButton();

			this.renderToken(Math.round(this.token['red']), 'red');
			this.renderToken(Math.round(this.token['blue']), 'blue');
			this.renderToken(Math.round(this.token['green']), 'green');

			if (this.battleScene != null)
				this.battleScene.render();
		}
		if (this.gameState == 'battle') {
			if (urlParams.get('teacher') == 'true') {

			}
		}
	}

	boardNextIndex(i) {
		if (i <= 5 && i >= 0)
			return i - 1;
	}

	renderToken(i, team) {
		if (this.boards[i] != undefined) {
			ctx.drawImage(TOKEN[team], this.tokenPosition[team].x - 70 * camera.z / 2 + 130 * camera.z / 2, this.tokenPosition[team].y - 70 * camera.z / 2 + 130 * camera.z / 2, 70 * camera.z, 70 * camera.z);
			ctx.fillStyle = 'rgb(255, 255, 245)';
		}
	}

	resize() {
		ctx.imageSmoothingEnabled = false;
		canvas.width = window.innerWidth;
		canvas.height = window.innerHeight;
	}

	tick() {
		this.resize();
		this.update();
		this.render();
	}
}

var app = new App();
setInterval(() => { app.tick() }, 1000 / 60);