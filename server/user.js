class User {
    constructor(id, teacher) {
        this.id = id;
        this.teacher = teacher;
        this.team = 'blue';

        this.keys = {
            w: false,
            s: false,
            a: false,
            d: false,
        };

        this.r = 60;
        this.position = {
            x: 0,
            y: 0,
        };
        this.targetP = {
            x: 0,
            y: 0,
        }
    }

    update() {
        if (this.keys.w)
            this.targetP.y -= 12;
        if (this.keys.s)
            this.targetP.y += 12;
        if (this.keys.a)
            this.targetP.x -= 12;
        if (this.keys.d)
            this.targetP.x += 12;

        this.position.x += (this.targetP.x - this.position.x) / 5;
        this.position.y += (this.targetP.y - this.position.y) / 5;
        this.r += (60 - this.r) / 5;
    }
}

module.exports = {
    User,
}