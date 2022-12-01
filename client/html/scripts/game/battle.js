
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
        this.url = new URL(location).searchParams;

        this.zoomVal = { 'RED': 0, 'BLUE': 0, 'GREEN': 0 };

        this.zoom = false;
    }

    update() {
        this.value -= this.a;
        this.a += 0.25;
        if (Math.round(this.value) <= 0 && !this.bounce) {
            this.value = 10;
            this.bounce = true;
            this.a = -3;
        }
        if (this.bounce && this.value <= 0) {
            this.value = 0;
            this.a = 0;

            if (!this.zoom) {
                setTimeout(() => {
                    if (!this.zoom) {
                        this.zoom = true;
                        //zoomVal in
                    }
                }, 1000);
            }
        }

        if (this.zoom) {
            this.zoomVal[this.myDirection] += (canvas.width - this.zoomVal[this.myDirection]) / 15;
        }
    }

    render() {
        ctx.font = '90px RubikMonoOne';
        ctx.textAlign = 'center';
        let pos = [canvas.width / 2 - this.wid / 2 * 3 - this.value + this.wid / 2, canvas.width / 2 - this.wid / 2 + this.wid / 2, canvas.width / 2 + this.wid / 2 + this.value + this.wid / 2];

        ctx.fillStyle = TEAM_COLOR[this.left];
        ctx.fillRect(canvas.width / 2 - this.wid / 2 * 3 - this.value, 0, this.wid + this.zoomVal[this.left], canvas.height);

        ctx.fillStyle = 'rgb(255, 255, 245)';
        ctx.fillText('ATK', pos[0], canvas.height / 2);

        ctx.fillStyle = TEAM_COLOR[this.center];
        ctx.fillRect(canvas.width / 2 - this.wid / 2 - this.zoomVal[this.center] / 2, -this.value * 2, this.wid + this.zoomVal[this.center], canvas.height);

        ctx.fillStyle = 'rgb(255, 255, 245)';
        ctx.fillText('OPER', pos[1], -this.value * 2 + canvas.height / 2);

        ctx.fillStyle = TEAM_COLOR[this.right];
        ctx.fillRect(canvas.width / 2 + this.wid / 2 + this.value - this.zoomVal[this.right], 0, this.wid + this.zoomVal[this.right], canvas.height);

        ctx.fillStyle = 'rgb(255, 255, 245)';
        ctx.fillText('DEF', pos[2], canvas.height / 2);
    }
}
