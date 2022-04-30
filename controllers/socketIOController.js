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
            io.emit('socket_count', clientCount);

            // socket.on('auth', auth => {
            //     if (auth == process.env.AUTHENTICATION_CODE){
            //         socket.emit('config', getClientConfig(config))
            //         socket.authed = true;
            //     }
            //     else{
            //         socket.emit('autherror');
            //     }
            // })
            socket.emit('config', getClientConfig(config))
            socket.authed = true;

            socket.on('disconnect', () => {
                clientCount--;
                io.emit('socket_count', clientCount);
            })
    
            socket.on('angles', ({azimuth, elevation}) => {
                if (socket.authed){
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
                }
                else{
                    socket.emit('autherror');
                }
            })

            socket.on('laser_state', state => {
                if (socket.authed){
                    turret.targetLaserState = state;
                    lastActivity = new Date();
                }
                else{
                    socket.emit('autherror');
                }
            })
        });

        setInterval(() => {
            fetchCameraSnapshot().then(data => {
                for (let [id, socket] of io.sockets.sockets){
                    if (socket.authed){
                        socket.emit('camera', data);
                    }
                }
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

    let controller = new TurretController(config.azimuth.angle_default, config.elevation.angle_default, config.laser.state_default, pins);

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
            max: config.azimuth.angle_max,
            default: config.azimuth.angle_default
        },
        elevation: {
            min: config.elevation.angle_min,
            max: config.elevation.angle_max,
            default: config.elevation.angle_default
        }
    }
}

module.exports = {start}