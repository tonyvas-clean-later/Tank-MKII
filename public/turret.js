class Turret{
    constructor(keyboard, config){
        this.keyboard = keyboard;
        this.config = config;

        this.keyboard.addCallback(keyStates => {
            this.onUserInput(keyStates);
        });

        this.angles = {azimuth: 90, elevation: 90};
        this.onPositionChange(this.angles);
    }

    onUserInput(keys){
        let newAngles = {
            azimuth: this.angles.azimuth,
            elevation: this.angles.elevation
        }

        if (keys.ARROWLEFT){
            newAngles.azimuth += -this.config.sensitivity;
        }
        else if (keys.ARROWRIGHT){
            newAngles.azimuth += this.config.sensitivity;
        }

        if (keys.ARROWUP){
            newAngles.elevation += -this.config.sensitivity;
        }
        else if (keys.ARROWDOWN){
            newAngles.elevation += this.config.sensitivity;
        }

        newAngles.azimuth = Math.max(Math.min(newAngles.azimuth, this.config.azimuth.max), this.config.azimuth.min);
        newAngles.elevation = Math.max(Math.min(newAngles.elevation, this.config.elevation.max), this.config.elevation.min);

        if (!this.isSameObject(this.angles, newAngles)){
            this.angles = newAngles;
            this.onPositionChange(this.angles);
        }
    }

    isSameObject(a, b){
        return JSON.stringify(a) == JSON.stringify(b);
    }

    onPositionChange(angles){}
}
