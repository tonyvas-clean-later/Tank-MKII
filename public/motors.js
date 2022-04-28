class Motors{
    constructor(keyboard, mouse, config){
        this.keyboard = keyboard;
        this.mouse = mouse;
        this.config = config;

        this.keyboard.addCallback(keyStates => {
            this.onKeyboardInput(keyStates);
        });

        this.speeds = {left: 0, right: 0};
        this.power = 0.5;

        setTimeout(() => {
            this.onUpdate();
        }, 0);
    }

    scalePower(original){
        let scaled = {};
        for (let key in original){
            scaled[key] = original[key] * this.power;
        }

        return scaled;
    }

    onKeyboardInput(keys){
        if (keys.ARROWUP || keys.ARROWDOWN){
            if (keys.ARROWUP){
                this.power += 0.1
            }
            
            if (keys.ARROWDOWN){
                this.power += -0.1
            }

            this.power = Math.round(Math.max(Math.min(this.power, 1), 0.1) * 10) / 10;

            this.onUpdate();
        }
        else{
            let encoded = this.encodeKeys(keys);
            let newSpeed = this.getSpeedForInput(encoded);

            if (!this.isSameObject(this.speeds, newSpeed)){
                this.speeds = this.scalePower(newSpeed);
                this.onUpdate();
            }
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

    onUpdate(){}
}