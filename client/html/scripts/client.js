class Vector2 {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

getDistance = (p1, p2) => {
    return Math.abs(Math.sqrt((p2.x - p1.x) * (p2.x - p1.x) + (p2.y - p1.y) * (p2.y - p1.y)));
}

calculateRenderData = (position, width, height, camera) => {

    let result = {
        renderWidth: 0, renderHeight: 0, position: { x: 0, y: 0, z: 0 },
        rotation: 0, isRender: false
    };

    result.renderWidth = width * camera.z;
    result.renderHeight = height * camera.z;

    let _ww = result.renderWidth / 2;
    let _hh = result.renderHeight / 2;

    let _dist = getDistance(new Vector2(canvas.width / 2 + camera.x, canvas.height / 2 + camera.y), new Vector2(position.x, position.y));
    let _rot = Math.atan2(canvas.height / 2 + camera.y - position.y, canvas.width / 2 + camera.x - position.x) + camera.rotation;
    let xx = (position.x - (canvas.width / 2 + camera.x));
    let yy = (position.y - (canvas.height / 2 + camera.y));
    let _zDist = _dist * (camera.z);

    let _zx = (Math.cos(_rot) * _zDist), _zy = (Math.sin(_rot) * _zDist);

    result.position.x = position.x - camera.x - _ww - (xx + _zx);
    result.position.y = position.y - camera.y - _hh - (yy + _zy);

    let outScreenSize = Math.sqrt(this.renderWidth * this.renderWidth + this.renderHeight * this.renderHeight);
    result.isRender = true;
    if (result.position.x < -outScreenSize || result.position.x > canvas.width + outScreenSize)
        result.isRender = false;
    if (result.position.y < -outScreenSize || result.position.y > canvas.width + outScreenSize)
        result.isRender = false;

    return result;
}