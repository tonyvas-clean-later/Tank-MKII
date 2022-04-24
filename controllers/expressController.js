const express = require('express');
const http = require('http');
const ip = require('ip');

function start(){
    const app = express();
    const server = http.createServer(app);

    app.use(express.static(process.env.PUBLIC_PATH));

    server.listen(process.env.PORT, () => {
        console.log(`Tank MKII running at port http://${ip.address()}:${process.env.PORT}`);
    });

    return server;
}

module.exports = {start}