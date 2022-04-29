const socket = io();
let turret;

function reset(){
    window.location = window.location
}

function setupTurret(config, keyboard, mouse){
    turret = new Turret(keyboard, mouse, config);

    turret.onUpdate = () => {
        socket.emit('angles', turret.angles);
        socket.emit('laser_state', turret.laserState);
        
        let azimuthElement = document.getElementById('azimuth')
        let elevationElement = document.getElementById('elevation')
        let trackingElement = document.getElementById('tracking');
        let laserStateElement = document.getElementById('laser_state')

        azimuthElement.innerHTML = turret.angles.azimuth;
        elevationElement.innerHTML = turret.angles.elevation;

        if (turret.tracking){
            trackingElement.innerHTML = 'Yes'
            trackingElement.style.color = 'lime'
        }
        else{
            trackingElement.innerHTML = 'No'
            trackingElement.style.color = 'red'
        }

        if (turret.laserState){
            laserStateElement.innerHTML = 'On'
            laserStateElement.style.color = 'lime'
        }
        else{
            laserStateElement.innerHTML = 'Off'
            laserStateElement.style.color = 'red'
        }
    }
}

socket.on('config', (config) => {
    let keyboard = new Keyboard(document.body);
    let mouse = new Mouse(document.getElementById('camera'));

    setupTurret(config, keyboard, mouse)
})

socket.on('camera', arrayBuffer => {
    const buffer = new Uint8Array(arrayBuffer);
    document.getElementById('camera').src = URL.createObjectURL(
        new Blob([buffer.buffer], {type: 'image/jpg'})
    )
})