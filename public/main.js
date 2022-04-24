const socket = io();
let keyboard, motors, turret;

function setHTMLMotorsSpeeds(speeds){
    document.getElementById('left_speed').innerHTML = speeds.left;
    document.getElementById('right_speed').innerHTML = speeds.right;
}

function setHTMLTurretAngles(angles){
    document.getElementById('azimuth').innerHTML = angles.azimuth;
    document.getElementById('elevation').innerHTML = angles.elevation;
}

socket.on('config', (config) => {
    keyboard = new Keyboard(document.body);
    motors = new Motors(keyboard);
    turret = new Turret(keyboard, config.turret);

    setHTMLMotorsSpeeds(motors.speeds);
    setHTMLTurretAngles(turret.angles);

    motors.onSpeedChange = speeds => {
        socket.emit('motors', speeds)
        setHTMLMotorsSpeeds(speeds)
    }
    
    turret.onPositionChange = angles => {
        socket.emit('turret', angles)
        setHTMLTurretAngles(angles)
    }
})

socket.on('camera', arrayBuffer => {
    const buffer = new Uint8Array(arrayBuffer);
    document.getElementById('camera').src = URL.createObjectURL(
        new Blob([buffer.buffer], {type: 'image/jpg'})
    )
})