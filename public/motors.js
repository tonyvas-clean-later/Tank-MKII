class Motors{
    constructor(keyboard, config){
        this.keyboard = keyboard;
        this.config = config;

        this.keyboard.addCallback(keyStates => {
            this.onUserInput(keyStates);
        });

        this.speeds = {left: 0, right: 0};
        this.onSpeedChange(this.speeds);
    }

    scalePower(original){
        let scaled = {};
        for (let key in original){
            scaled[key] = original[key] * this.config.power;
        }

        return scaled;
    }

    onUserInput(keys){
        let encoded = this.encodeKeys(keys);
        let newSpeed = this.getSpeedForInput(encoded);

        if (!this.isSameObject(this.speeds, newSpeed)){
            this.speeds = this.scalePower(newSpeed);
            this.onSpeedChange(this.speeds);
        }
    }

    isSameObject(a, b){
        return JSON.stringify(a) == JSON.stringify(b);
    }

    getSpeedForInput(encodedInput){
        const SPEEDS = {
            '0000': { left:  0,      right:   0   },    // no keys
            '1000': { left:  1,      right:   1   },    // w
            '0100': { left: -1,      right:  -1   },    // s
            '0010': { left: -0.5,    right:   0.5 },    // a
            '0001': { left:  0.5,    right:  -0.5 },    // d
            '1010': { left:  0.5,    right:   1   },    // w a
            '1001': { left:  1,      right:   0.5 },    // w d
            '0110': { left: -0.5,    right:  -1   },    // s a
            '0101': { left: -1,      right:  -0.5 }     // s d
        }

        return SPEEDS[encodedInput];
    }

    encodeKeys(keys){
        const ORDER = ['W', 'S', 'A', 'D'];
        let encoded = ''

        for (let key of ORDER){
            if (keys[key]){
                encoded += '1'
            }
            else{
                encoded += '0'
            }
        }

        return encoded;
    }

    onSpeedChange(speeds){}
}

// const keysDown = {up: false, down: false, left: false, right: false};

// let lastCode = null;
// let lastSpeedMult = null;

// let speedMult = 1;

// function sendSpeeds(){
//     let code = '';
//     for (const dir of ['up', 'down', 'left', 'right']){
//         if (keysDown[dir]) code += '1';
//         else code += '0';
//     }

//     if (code == lastCode && speedMult == lastSpeedMult) return;
    
//     lastCode = code;
//     lastSpeedMult = speedMult;

//     let speeds = SPEEDS[code];
//     if (!speeds) speeds = SPEEDS.default;    

    
//     setLeft(speeds[0] * speedMult);
//     setRight(speeds[1] * speedMult);
// }

// document.body.onkeydown = e => {
//     switch (e.key.toLowerCase()) {
//         case 'w':
//             keysDown.up = true;
//             break;
//         case 's':
//             keysDown.down = true;
//             break;
//         case 'a':
//             keysDown.left = true;
//             break;
//         case 'd':
//             keysDown.right = true;
//             break;
//         case 'arrowup':
//             speedMult += 0.2;
//             break;
//         case 'arrowdown':
//             speedMult -= 0.2;
//             break;
//         default:
//             return;
//     }

//     if (speedMult > 1) speedMult = 1;
//     else if (speedMult < 0.2) speedMult = 0.2;

//     sendSpeeds();
// }

// document.body.onkeyup = e => {
//     switch (e.key.toLowerCase()) {
//         case 'w':
//             keysDown.up = false;
//             break;
//         case 's':
//             keysDown.down = false;
//             break;
//         case 'a':
//             keysDown.left = false;
//             break;
//         case 'd':
//             keysDown.right = false;
//             break;
//         default:
//             return;
//     }

//     sendSpeeds()
// }