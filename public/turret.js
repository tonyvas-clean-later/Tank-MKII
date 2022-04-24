class Turret{
    constructor(keyboard, angleRanges){
        this.keyboard = keyboard;
        this.keyboard.addCallback(keyStates => {
            this.onUserInput(keyStates);
        });

        this.angleRanges = angleRanges;
        this.angles = {azimuth: 90, elevation: 90};
    }

    onUserInput(keys){
        const STEP = 5;
        let newAngles = {
            azimuth: this.angles.azimuth,
            elevation: this.angles.elevation
        }

        if (keys.ARROWLEFT){
            newAngles.azimuth += -STEP
        }
        else if (keys.ARROWRIGHT){
            newAngles.azimuth += STEP
        }

        if (keys.ARROWUP){
            newAngles.elevation += -STEP
        }
        else if (keys.ARROWDOWN){
            newAngles.elevation += STEP
        }

        newAngles.azimuth = Math.max(Math.min(newAngles.azimuth, this.angleRanges.azimuth.max), this.angleRanges.azimuth.min);
        newAngles.elevation = Math.max(Math.min(newAngles.elevation, this.angleRanges.elevation.max), this.angleRanges.elevation.min);

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
