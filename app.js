const {spawn} = require('child_process');

const ExpressController = require('./controllers/expressController');
const SocketIOController = require('./controllers/socketIOController');

function setEnv(){
    process.env.PORT = process.env.PORT || 9000;
    process.env.PUBLIC_PATH = `${__dirname}/public`;
    process.env.CONFIG_FILE = `${__dirname}/config.json`
    process.env.AUTHENTICATION_CODE = 'potato'
    process.env.CAMERA_URL = `http://127.0.0.1:8080?action=snapshot`
    process.env.MJPG_STREAMER_PATH = `${__dirname}/mjpg-streamer`
    process.env.SERVO_SCRIPT = `${__dirname}/python/servo.py`;
    process.env.LASER_SCRIPT = `${__dirname}/python/laser.py`;
}

function startStreamer(){
    let options = [
        '-i',
        `${process.env.MJPG_STREAMER_PATH}/input_uvc.so -f 30 -r 1280x720`,
        '-o',
        `${process.env.MJPG_STREAMER_PATH}/output_http.so -w ${process.env.MJPG_STREAMER_PATH}/www -p 8080`
    ]
    let streamer = spawn(`${process.env.MJPG_STREAMER_PATH}/mjpg_streamer`, options);

    streamer.stdout.on('data', data => {
        // console.log(data.toString());
    })

    streamer.stderr.on('data', data => {
        // console.error(data.toString());
    })

    streamer.on('exit', code => {
        console.log(code);
    })

    return streamer;
}

setEnv();
const streamer = startStreamer();
const server = ExpressController.start();
SocketIOController.start(server);