const socket = io();
let canvas = document.getElementById('camera')
let context = canvas.getContext('2d')
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

document.body.onload = () => {
    // socket.emit('auth', window.prompt('Enter authentication code!'))
}

socket.on('config', (config) => {
    let keyboard = new Keyboard(document.body);
    let mouse = new Mouse(document.getElementById('camera'));

    setupTurret(config, keyboard, mouse)
})

socket.on('camera', arrayBuffer => {
    const buffer = new Uint8Array(arrayBuffer);
    let src = URL.createObjectURL(
        new Blob([buffer.buffer], {type: 'image/jpg'})
    )

    let img = new Image();
    img.src = src;

    img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        context.drawImage(img, 0, 0);

        if (!turret.tracking){
            let x = turret.map(turret.angles.azimuth, 0, 180, 0, canvas.width)
            let y = turret.map(turret.angles.elevation, 0, 180, 0, canvas.height)

            let radius = 5;
            context.strokeStyle = 'red';
            context.arc(x + radius / 2, y + radius / 2, 5, 0, 2 * Math.PI);
            context.stroke();
        }
    }
})

socket.on('socket_count', count => {
    document.getElementById('client_count').innerHTML = count;
})

socket.on('autherror', () => {
    alert('Authentication error!');
})