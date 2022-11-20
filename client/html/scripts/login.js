var loginButton = login_btn;
var socket = io();

socket.on('server_error', (pak) => {
    let text = document.getElementById('error_text');
    text.style.visibility = 'visible';
    text.innerHTML = pak.text;

    setTimeout(() => {
        document.getElementById('error_text').style.visibility = 'hidden';
    }, 2000);
});

socket.on('server_roomEnter', (pak) => {
    if (pak.id == id.value) {
        if (document.hasFocus()) {
            console.log('enter room....');
            location.href = '/waiting?teacher=' + pak.teacher + '&id=' + id.value + '&roomCode=' + pak.roomCode;
        }
    }
});

loginButton.onclick = () => {
    let buttonSnd = new Audio('assets/sounds/button.ogg');
    buttonSnd.play();

    if (code.value == '') {
        setTimeout(() => {
            socket.emit('client_makeRoom', { id: id.value });
        }, 150);
    } else {
        setTimeout(() => {
            socket.emit('client_enterRoom', { id: id.value, code: code.value.toUpperCase() })
        }, 150);
    }
}
