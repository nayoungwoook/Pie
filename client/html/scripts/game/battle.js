
class BattleScene {
    constructor(app, left, center, right, myDirection) {
        this.app = app;
        this.myDirection = myDirection;
        this.left = left;
        this.center = center;
        this.right = right;
        this.MAX = 150;
        this.wid = 550;
        this.value = 500;
        this.a = 0;
        this.bounce = false;
    }

    update() {
        this.value -= this.a;
        this.a += 0.5;
        if (Math.round(this.value) <= 0 && !this.bounce) {
            this.value = 20;
            this.bounce = true;
            this.a = -3;
        }
        if (this.bounce && this.value <= 0) {
            this.value = 0;
            this.a = 0;
        }
    }

    render() {
        ctx.fillStyle = TEAM_COLOR[this.left];
        ctx.fillRect(canvas.width / 2 - this.wid / 2 * 3 - this.value, 0, this.wid, canvas.height);

        ctx.fillStyle = TEAM_COLOR[this.center];
        ctx.fillRect(canvas.width / 2 - this.wid / 2, -this.value * 2, this.wid, canvas.height);

        ctx.fillStyle = TEAM_COLOR[this.right];
        ctx.fillRect(canvas.width / 2 + this.wid / 2 + this.value, 0, this.wid, canvas.height);
    }
}
