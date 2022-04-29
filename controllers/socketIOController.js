const fs = require('fs');
const fetch = require('node-fetch')
const socketio = require('socket.io');

const TurretController = require('./turretController');

function start(server){
    readConfig().then(config => {
        const io = socketio(server);
        const turret = createTurretController(config)

        let clientCount = 0;
        let lastActivity = new Date();

        let idleHandler = setInterval(() => {
            if (new Date().getTime() - lastActivity.getTime() >= config.laser.timeout * 1000 || clientCount <= 0){
                if (turret.currentLaserState){
                    turret.targetLaserState = false;
                }
            }
        }, 100);

        io.on('connection', (socket) => {
            clientCount++;
            socket.emit('config', getClientConfig(config))

            socket.on('disconnect', () => {
                clientCount--;
            })
    
            socket.on('angles', ({azimuth, elevation}) => {
                azimuth = Math.max(Math.min(azimuth, config.azimuth.angle_max), config.azimuth.angle_min)
                elevation = Math.max(Math.min(elevation, config.elevation.angle_max), config.elevation.angle_min)
                
                if (config.azimuth.inverted){
                    azimuth = 180 - azimuth;
                }
                if (config.elevation.inverted){
                    elevation = 180 - elevation;
                }
                
                turret.targetAzimuth = azimuth;
                turret.targetElevation = elevation;

                lastActivity = new Date();
            })

            socket.on('laser_state', state => {
                turret.targetLaserState = state;
                lastActivity = new Date();
            })
        });

        setInterval(() => {
            fetchCameraSnapshot().then(data => {
                io.emit('camera', data);
            }).catch(err => {
                console.error(err);
            })
        }, 1000 / 30);
    }).catch(err => {
        console.error(err);
    })
}

function createTurretController(config){
    let pins = {
        azimuth: config.azimuth.pin,
        elevation: config.elevation.pin,
        laser: config.laser.pin,
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
        azimuth: {
            min: config.azimuth.angle_min,
            max: config.azimuth.angle_max
        },
        elevation: {
            min: config.elevation.angle_min,
            max: config.elevation.angle_max
        }
    }
}

module.exports = {start}