const ExpressController = require('./controllers/expressController');
const SocketIOController = require('./controllers/socketIOController');

function setEnv(){
    process.env.PORT = process.env.PORT || 9000;
    process.env.PUBLIC_PATH = `${__dirname}/public`;
    process.env.CONFIG_FILE = `${__dirname}/config.json`
    process.env.CAMERA_URL = `http://127.0.0.1:8080?action=snapshot`
    process.env.MOTOR_SCRIPT = `${__dirname}/python/motor.py`;
    process.env.SERVO_SCRIPT = `${__dirname}/python/servo.py`;
    process.env.LASER_SCRIPT = `${__dirname}/python/laser.py`;
}

setEnv();
const server = ExpressController.start();
SocketIOController.start(server);