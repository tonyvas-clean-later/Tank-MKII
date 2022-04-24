#!/usr/bin/python3

from gpiozero import Motor
import sys

try:
  pins = sys.argv[1].split(',')
  motor = Motor(pins[0], pins[1], pins[2])
except Exception as e:
  print('Failed to create laser')
  exit(1)

while True:
  try:
    value = float(input().strip())
    motor.value = value
  except Exception as e:
    print(e)