const {spawn} = require('child_process');

class TurretController{
    constructor(azimuth, elevation, laserState, pins){
        this.procs = {
            azimuth: spawn('python3', [process.env.SERVO_SCRIPT, pins.azimuth]),
            elevation: spawn('python3', [process.env.SERVO_SCRIPT, pins.elevation]),
            laser: spawn('python3', [process.env.LASER_SCRIPT, pins.laser])
        }

        for (let name in this.procs){
            let proc = this.procs[name];

            proc.stdout.on('data', data => {
                this.onStdout(name, data.toString())
            })

            proc.stderr.on('data', data => {
                this.onStderr(name, data.toString())
            })

            proc.on('exit', code => {
                this.onExit(name, code);
            })
        }

        this.targetAzimuth = azimuth;
        this.targetElevation = elevation;
        this.targetLaserState = laserState;

        this.updateHandle = setInterval(() => {
            this.update()
        }, 10);
    }

    onStdout(name, data) {}
    onStderr(name, data) {}
    onExit(name, code) {}

    map(val, inMin, inMax, outMin, outMax){
        return (val - inMin) * (outMax - outMin) / (inMax - inMin) +  outMin
    }

    setServos(azimuth, elevation){
        console.log(`Setting position to ${azimuth},${elevation}`);
        this.procs.azimuth.stdin.write(`${this.map(azimuth, 0, 180, -1, 1)}\n`);
        this.procs.elevation.stdin.write(`${this.map(elevation, 0, 180, -1, 1)}\n`);

        this.currentAzimuth = azimuth;
        this.currentElevation = elevation;
    }

    setLaserState(state){
        console.log(`Turning laser ${state}`);
        this.procs.laser.stdin.write(`${Number(state)}\n`);
        this.currentLaserState = state;
    }

    update(){
        if (this.currentAzimuth != this.targetAzimuth || this.currentElevation != this.targetElevation){
            this.setServos(this.targetAzimuth, this.targetElevation);
        }

        if (this.currentLaserState != this.targetLaserState){
            this.setLaserState(this.targetLaserState);
        }
    }
}

module.exports = TurretController;