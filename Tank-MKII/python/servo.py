#!/usr/bin/python3

from gpiozero import Servo
from gpiozero.pins.pigpio import PiGPIOFactory
import sys

def map(val, inMin, inMax, outMin, outMax):
  return (val - inMin) * (outMax - outMin) / (inMax - inMin) +  outMin

try:
  servo = Servo(sys.argv[1], pin_factory = PiGPIOFactory(), min_pulse_width = 0.5 / 1000, max_pulse_width = 2.5 / 1000)
except Exception as e:
  print('Failed to create laser')
  exit(1)

while True:
  try:
    value = float(input().strip())
    servo.value = value
  except Exception as e:
    print(e)