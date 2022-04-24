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

function reset(){
    window.location = window.location
}

function getMotorsConfig(config){
    const POWER_MIN = 0.1;
    const POWER_MAX = 1
    const POWER_STEP = 0.1;

    let powerMinusButton = document.getElementById('motors_power_minus');
    let powerPlusButton = document.getElementById('motors_power_plus');
    let powerSpan = document.getElementById('motors_power_span');

    let motorsConfig = {
        power: 0.5
    };

    let onPowerChange = (amount) => {
        motorsConfig.power = Math.round(Math.min(Math.max(motorsConfig.power + amount, POWER_MIN), POWER_MAX) * 10) / 10;

        powerMinusButton.disabled = motorsConfig.power <= POWER_MIN;
        powerPlusButton.disabled = motorsConfig.power >= POWER_MAX;
        
        powerSpan.innerHTML = `${motorsConfig.power * 100}%`;
    }

    powerMinusButton.onclick = () => {
        onPowerChange(-POWER_STEP);
    }

    powerPlusButton.onclick = () => {
        onPowerChange(POWER_STEP);
    }

    onPowerChange(0)

    return motorsConfig
}

function getTurretConfig(config){
    const SENS_MIN = 1;
    const SENS_MAX = 10;
    const SENS_STEP = 1;

    let sensMinusButton = document.getElementById('turret_sens_minus');
    let sensPlusButton = document.getElementById('turret_sens_plus');
    let sensSpan = document.getElementById('turret_sens_span');

    let turretConfig = {
        azimuth: {
            min: config.turret.azimuth.min,
            max: config.turret.azimuth.max,
        },
        elevation: {
            min: config.turret.elevation.min,
            max: config.turret.elevation.max,
        },
        sensitivity: 5
    };

    let onSensChange = (amount) => {
        turretConfig.sensitivity = Math.min(Math.max(turretConfig.sensitivity + amount, SENS_MIN), SENS_MAX);

        sensMinusButton.disabled = turretConfig.sensitivity <= SENS_MIN;
        sensPlusButton.disabled = turretConfig.sensitivity >= SENS_MAX;
        
        sensSpan.innerHTML = turretConfig.sensitivity
    }

    sensMinusButton.onclick = () => {
        onSensChange(-SENS_STEP);
    }

    sensPlusButton.onclick = () => {
        onSensChange(SENS_STEP);
    }

    onSensChange(0)

    return turretConfig
}

socket.on('config', (config) => {
    keyboard = new Keyboard(document.body);
    motors = new Motors(keyboard, getMotorsConfig(config));
    turret = new Turret(keyboard, getTurretConfig(config));

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