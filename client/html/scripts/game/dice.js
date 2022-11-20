
//#region DICE
const DICE = {
    1: new Image(),
    2: new Image(),
    3: new Image(),
    4: new Image(),
    5: new Image(),
    6: new Image(),
}
DICE['1'].src = 'assets/dice/one.png';
DICE['2'].src = 'assets/dice/two.png';
DICE['3'].src = 'assets/dice/three.png';
DICE['4'].src = 'assets/dice/four.png';
DICE['5'].src = 'assets/dice/five.png';
DICE['6'].src = 'assets/dice/six.png';
//#endregion

class Dice {
    constructor() {
        this.roll = false;
        this.position = {
            x: 200,
            y: 200,
        };

        this.rotation = 0;
        this.rv = 0;
        this.targetNum = 0;
        this.num = 0;

        this.state = '';

        this.size = 120;
    }

    render() {
        if (this.roll) {
            let pos = calculateRenderData({ x: this.position.x, y: this.position.y }, this.size, this.size, camera);

            ctx.save();
            ctx.translate(pos.position.x + pos.renderWidth / 2, pos.position.y + pos.renderHeight / 2);
            ctx.rotate(this.rotation);
            if (DICE[Math.round(this.num)] != undefined)
                ctx.drawImage(DICE[Math.round(this.num) + ''], -pos.renderWidth / 2, -pos.renderHeight / 2, pos.renderWidth, pos.renderHeight);
            ctx.restore();
        }
    }

    update() {
        if (this.state == 'roll') {
            this.position.x += ((canvas.width / 2) - this.position.x) / 25;
            this.position.y += ((canvas.height / 2) - this.position.y) / 25;
            this.rotation += this.rv;
            if (this.rotation >= Math.PI)
                this.rotation = 0;

            if (this.rv > 0)
                this.rv -= 0.005;

            this.num += 0.1;
            if (this.num > 6)
                this.num = 1;
        }
        if (this.state == 'showup') {
            this.position.x = canvas.width / 2;
            this.position.y = canvas.height / 2;

            this.rotation += (0 - this.rotation) / 10;
        }

        if (this.roll) {
            if (Math.sqrt((this.position.x - canvas.width / 2) * (this.position.x - canvas.width / 2) + (this.position.y - canvas.height / 2) * (this.position.y - canvas.height / 2)) <= 8) {
                this.num = this.targetNum;
                if (this.state != 'showup') {
                    this.state = 'showup';
                    setTimeout(() => {
                        this.roll = false;
                        this.position.x = canvas.width;
                        this.position.y = canvas.height;
                    }, 2000);
                }
            }
        }
    }

    rollDice(num) {
        if (this.roll == true) return;
        this.size = 120;
        this.roll = true;
        this.position.x = canvas.width;
        this.position.y = canvas.height;
        this.rotation = 0;
        this.targetNum = num;
        this.state = 'roll';
        this.rv = 0.5;
    }
}