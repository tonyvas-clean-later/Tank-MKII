#!/bin/bash

cd /home/pi/pi-wall-turret
PORT=80 /usr/bin/node app.js &> logs/$(date +"%s").log
