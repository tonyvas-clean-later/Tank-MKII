const socket = io();
let motors, turret;

function reset(){
    window.location = window.location
}

function getMotorsConfig(config){
    return {};
}

function getTurretConfig(config){
    let turretConfig = {
        azimuth: {
            min: config.turret.azimuth.min,
            max: config.turret.azimuth.max,
        },
        elevation: {
            min: config.turret.elevation.min,
            max: config.turret.elevation.max,
        }
    };

    return turretConfig
}

function setupMotors(config, keyboard, mouse){
    motors = new Motors(keyboard, mouse, getMotorsConfig(config));

    motors.onUpdate = () => {
        socket.emit('motors', motors.speeds)
        
        document.getElementById('left_speed').innerHTML = motors.speeds.left;
        document.getElementById('right_speed').innerHTML = motors.speeds.right;
        document.getElementById('motors_power').innerHTML = `${motors.power * 100}%`;
    }
}

function setupTurret(config, keyboard, mouse){
    turret = new Turret(keyboard, mouse, getTurretConfig(config));

    turret.onUpdate = () => {
        socket.emit('turret', turret.angles)
        
        document.getElementById('azimuth').innerHTML = turret.angles.azimuth;
        document.getElementById('elevation').innerHTML = turret.angles.elevation;
        document.getElementById('turret_tracking').innerHTML = turret.tracking ? 'Yes' : 'No'
    }
}

socket.on('config', (config) => {
    let keyboard = new Keyboard(document.body);
    let mouse = new Mouse(document.getElementById('camera'));

    setupMotors(config, keyboard, mouse)
    setupTurret(config, keyboard, mouse)
})

socket.on('camera', arrayBuffer => {
    const buffer = new Uint8Array(arrayBuffer);
    document.getElementById('camera').src = URL.createObjectURL(
        new Blob([buffer.buffer], {type: 'image/jpg'})
    )
})