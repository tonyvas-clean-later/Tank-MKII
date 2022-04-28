class Mouse{
    constructor(element){
        this.keyStates = {}; // does nothing yet
        this.position = {
            x: {
                min: 0,
                max: element.clientWidth,
                current: null
            },
            y: {
                min: 0,
                max: element.clientHeight,
                current: null
            }
        };

        this.callbacks = [];

        element.onmousemove = e => {
            this.onKeyEvent(e);
        }
    }
    
    onKeyEvent(e){
        let rect = e.target.getBoundingClientRect();

        this.position.x.current = Math.floor(e.clientX - rect.left);
        this.position.y.current = Math.floor(e.clientY - rect.top);

        this.callCallbacks();
    }

    addCallback(callback){
        this.callbacks.push(callback);
    }

    callCallbacks(){
        for (let callback of this.callbacks){
            callback(this.keyStates, this.position);
        }
    }
}