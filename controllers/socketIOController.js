const fs = require('fs');
const fetch = require('node-fetch')
const socketio = require('socket.io');

const MotorsController = require('./motorsController');
const TurretController = require('./turretController');

function start(server){
    readConfig().then(config => {
        const io = socketio(server);
        const motors = createMotorsController(config)
        const turret = createTurretController(config)

        let clientCount = 0;
        let lastActivity = new Date();

        let idleHandler = setInterval(() => {
            if (new Date().getTime() - lastActivity.getTime() >= config.turret.laser.timeout * 1000 || clientCount <= 0){
                if (turret.currentLaserState){
                    turret.targetLaserState = false;
                }
            }
            else{
                if (!turret.currentLaserState){
                    turret.targetLaserState = true;
                }
            }
        }, 100);

        io.on('connection', (socket) => {
            clientCount++;
            socket.emit('config', getClientConfig(config))

            socket.on('disconnect', () => {
                clientCount--;
            })
    
            socket.on('turret', data => {
                let {azimuth, elevation} = data;
                azimuth = Math.max(Math.min(azimuth, config.turret.azimuth.angle_max), config.turret.azimuth.angle_min)
                elevation = Math.max(Math.min(elevation, config.turret.elevation.angle_max), config.turret.elevation.angle_min)
                
                if (config.turret.azimuth.inverted){
                    azimuth = 180 - azimuth;
                }
                if (config.turret.elevation.inverted){
                    elevation = 180 - elevation;
                }
                
                turret.targetAzimuth = azimuth;
                turret.targetElevation = elevation;

                lastActivity = new Date();
            })

            socket.on('motors', data => {
                let {left, right} = data;
                motors.targetLeft = left;
                motors.targetRight = right;

                lastActivity = new Date();
            });
        });

        setInterval(() => {
            fetchCameraSnapshot().then(data => {
                io.emit('camera', data);
            }).catch(err => {
                console.error(err);
            })
        }, 1000 / 15);
    }).catch(err => {
        console.error(err);
    })
}

function createMotorsController(config){
    let pins = {
        left: `${config.motors.left.forward_pin},${config.motors.left.backward_pin},${config.motors.left.enable_pin}`,
        right: `${config.motors.right.forward_pin},${config.motors.right.backward_pin},${config.motors.right.enable_pin}`
    };

    let controller = new MotorsController(0, 0, pins);

    controller.onStdout = (name, data) => {
        console.log(`Motors subprocess ${name} | stdout | ${data}`);
    }

    controller.onStderr = (name, data) => {
        console.log(`Motors subprocess ${name} | stderr | ${data}`);
    }

    controller.onExit = (name, code) => {
        console.log(`Motors subprocess ${name} | exitcode | ${code}`);
    }

    return controller;
}

function createTurretController(config){
    let pins = {
        azimuth: config.turret.azimuth.pin,
        elevation: config.turret.elevation.pin,
        laser: config.turret.laser.pin,
    };

    let controller = new TurretController(90, 90, false, pins);

    controller.onStdout = (name, data) => {
        console.log(`Turret subprocess ${name} | stdout | ${data}`);
    }

    controller.onStderr = (name, data) => {
        console.log(`Turret subprocess ${name} | stderr | ${data}`);
    }

    controller.onExit = (name, code) => {
        console.log(`Turret subprocess ${name} | exitcode | ${code}`);
    }

    return controller;
}

function readConfig(){
    return new Promise((resolve, reject) => {
        fs.readFile(process.env.CONFIG_FILE, 'utf-8', (err, data) => {
            if (err){
                reject(err);
            }
            else{
                resolve(JSON.parse(data));
            }
        })
    })
}

function fetchCameraSnapshot(){
    return new Promise((resolve, reject) => {
        fetch(process.env.CAMERA_URL).then(res => res.arrayBuffer()).then(arrayBuffer => {
            resolve(arrayBuffer)
        }).catch(reject)
    })
}

function getClientConfig(config){
    return clientConfig = {
        turret: {
            azimuth: {
                min: config.turret.azimuth.angle_min,
                max: config.turret.azimuth.angle_max
            },
            elevation: {
                min: config.turret.elevation.angle_min,
                max: config.turret.elevation.angle_max
            }
        }
    }
}

module.exports = {start}