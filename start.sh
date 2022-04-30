#!/bin/bash

STREAM_PORT=5555

iptables -A INPUT -i lo -p tcp --dport $STREAM_PORT -j ACCEPT
iptables -A INPUT -p tcp --dport $STREAM_PORT -j DROP

cd /home/pi/pi-wall-turret
PORT=80 /usr/bin/node app.js &> logs/$(date +"%s").log
