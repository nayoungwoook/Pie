
//#region INPUT
var mouse = { x: 0, y: 0, left: false, right: false };
addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
});
addEventListener('mousedown', (e) => {
    if (e.button = 0)
        mouse.right = true;
    if (e.button = 2)
        mouse.left = true;
});
addEventListener('touchstart', (e) => {
    mouse.left = true;
    mouse.x = e.touches[0].clientX;
    mouse.y = e.touches[0].clientY;
});
addEventListener('touchmove', (e) => {
    mouse.x = (e.touches[0].clientX);
    mouse.y = (e.touches[0].clientY);
});
addEventListener('touchend', (e) => {
    mouse.left = false;
});
addEventListener('mouseup', (e) => {
    if (e.button = 0)
        mouse.right = false;
    if (e.button = 2)
        mouse.left = false;
});

var keys = { w: false, s: false, a: false, d: false };

addEventListener('keydown', (e) => {
    if (e.key == 'w')
        keys.w = true;
    if (e.key == 's')
        keys.s = true;
    if (e.key == 'a')
        keys.a = true;
    if (e.key == 'd')
        keys.d = true;
});

addEventListener('keyup', (e) => {
    if (e.key == 'w')
        keys.w = false;
    if (e.key == 's')
        keys.s = false;
    if (e.key == 'a')
        keys.a = false;
    if (e.key == 'd')
        keys.d = false;
});
//#endregion