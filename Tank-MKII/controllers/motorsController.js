const {spawn} = require('child_process');

class MotorsController{
    constructor(left, right, pins){
        this.procs = {
            left: spawn('python3', [process.env.MOTOR_SCRIPT, pins.left]),
            right: spawn('python3', [process.env.MOTOR_SCRIPT, pins.right])
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

        this.targetLeft = left;
        this.targetRight = right;

        this.updateHandle = setInterval(() => {
            this.update()
        }, 10);
    }

    onStdout(name, data) {}
    onStderr(name, data) {}
    onExit(name, code) {}

    setLeft(speed){
        console.log(`Setting left to ${speed}`);
        this.procs.left.stdin.write(`${speed}\n`);
        this.currentLeft = speed;
    }

    setRight(speed){
        console.log(`Setting right to ${speed}`);
        this.procs.right.stdin.write(`${speed}\n`);
        this.currentRight = speed;
    }

    update(){
        if (this.currentLeft != this.targetLeft){
            this.setLeft(this.targetLeft);
        }

        if (this.currentRight != this.targetRight){
            this.setRight(this.targetRight);
        }
    }
}

module.exports = MotorsController;
