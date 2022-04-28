#!/bin/bash

cd /home/pi/Tank-MKII
PORT=80 /usr/bin/node app.js &> logs/$(date +"%s").log
