class Keyboard{
    constructor(element){
        this.keyStates = {};
        this.callbacks = [];

        element.onkeydown = e => {
            this.onKeyEvent(e, true);
        }

        element.onkeyup = e => {
            this.onKeyEvent(e, false);
        }
    }
    
    onKeyEvent(e, state){
        let key = e.key.toUpperCase();
        this.keyStates[key] = state
        this.callCallbacks();
    }

    addCallback(callback){
        this.callbacks.push(callback);
    }

    callCallbacks(){
        for (let callback of this.callbacks){
            callback(this.keyStates);
        }
    }
}