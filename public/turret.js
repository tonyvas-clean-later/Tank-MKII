class Turret{
    constructor(keyboard, mouse, config){
        this.keyboard = keyboard;
        this.mouse = mouse;
        this.config = config;

        this.keyboard.addCallback((keyStates) => {
            this.onKeyboardInput(keyStates);
        })

        this.mouse.addCallback((keyStates, position) => {
            this.onMouseInput(position);
        });

        this.angles = {azimuth: config.azimuth.default, elevation: config.elevation.default};
        this.tracking = false;
        this.laserState = false;

        setTimeout(() => {
            this.onUpdate();
        }, 0);
    }

    onKeyboardInput(keyStates){
        let update = false;

        if (keyStates[' ']){
            this.tracking = !this.tracking
            update = true;
        }

        if (keyStates['SHIFT']){
            this.laserState = !this.laserState
            update = true;
        }

        if (update){
            this.onUpdate();
        }
    }

    onMouseInput(mousePosition){
        if (this.tracking){
            let azimuth = this.map(mousePosition.x.current, mousePosition.x.min, mousePosition.x.max, this.config.azimuth.min, this.config.azimuth.max);
            let elevation = this.map(mousePosition.y.current, mousePosition.y.min, mousePosition.y.max, this.config.elevation.min, this.config.elevation.max)

            let newAngles = {
                azimuth: Math.floor(azimuth),
                elevation: Math.floor(elevation)
            }

            newAngles.azimuth = Math.max(Math.min(newAngles.azimuth, this.config.azimuth.max), this.config.azimuth.min);
            newAngles.elevation = Math.max(Math.min(newAngles.elevation, this.config.elevation.max), this.config.elevation.min);

            if (!this.isSameObject(this.angles, newAngles)){
                this.angles = newAngles;
                this.onUpdate();
            }
        }
    }

    map(value, fromMin, fromMax, toMin, toMax){
        return (value - fromMin) * (toMax - toMin) / (fromMax - fromMin) +  toMin
    }

    isSameObject(a, b){
        return JSON.stringify(a) == JSON.stringify(b);
    }

    onUpdate(){}
}
