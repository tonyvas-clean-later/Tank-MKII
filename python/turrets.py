#!/usr/bin/python3

from gpiozero import Servo, LED
from gpiozero.pins.pigpio import PiGPIOFactory
import sys, json

def map(val, inMin, inMax, outMin, outMax):
  return (val - inMin) * (outMax - outMin) / (inMax - inMin) +  outMin

def move(azim, elev):
  azim = min(max(azim % 360, AZIMUTH_MIN), AZIMUTH_MAX)
  elev = min(max(elev % 360, ELEVATION_MIN), ELEVATION_MAX)

  print(f'Moving to {azim}, {elev}')

  if INVERT_AZIMUTH:
    azim = 180 - azim

  if INVERT_ELEVATION:
    elev = 180 - elev

  azimuth.value = map(azim, 0, 180, -1, 1)
  elevation.value = map(elev, 0, 180, -1, 1)

def setLaser(state):
  if state:
    print('Setting laser on')
    laser.on()
  else:
    print('Setting laser off')
    laser.off()

try:
  with open(sys.argv[1], 'r') as f:
    config = json.loads(f.read())

    AZIMUTH_PIN = config['AZIMUTH_PIN']
    ELEVATION_PIN = config['ELEVATION_PIN']
    LASER_PIN = config['LASER_PIN']

    AZIMUTH_MIN = config['AZIMUTH_MIN']
    AZIMUTH_MAX = config['AZIMUTH_MAX']
    INVERT_AZIMUTH = config['INVERT_AZIMUTH']

    ELEVATION_MIN = config['ELEVATION_MIN']
    ELEVATION_MAX = config['ELEVATION_MAX']
    INVERT_ELEVATION = config['INVERT_ELEVATION']
except Exception as e:
  print('Failed to parse config')
  exit(1)

factory = PiGPIOFactory()
azimuth = Servo(AZIMUTH_PIN, pin_factory=factory)
elevation = Servo(ELEVATION_PIN, pin_factory=factory)
laser = LED(LASER_PIN, False)

while True:
  args = input().strip().split(' ')
  command = args[0]

  try:
    if command == 'laser_state':
      try:
        arg = args[1]
        if arg == 'on':
          state = True
        elif arg == 'off':
          state = False
        else:
          raise Exception('Invalid arg to laser_state: ' + state)
      except Exception as e:
        raise Exception('Failed to parse laser_state command ' + e)
      setLaser(state)

    elif command == 'position':
      try:
        values = args[1].split(',')
        azim = int(values[0])
        elev = int(values[1])
      except Exception as e:
        raise Exception('Failed to parse position command ' + e)
      move(azim, elev)

    else:
      raise Exception('Invalid command: ' + command)
  except Exception as e:
    print(e)