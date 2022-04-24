#!/usr/bin/python3

from gpiozero import LED
import sys

try:
  laser = LED(sys.argv[1], False)
except Exception as e:
  print('Failed to create laser')
  exit(1)

while True:
  try:
    value = int(input().strip())
    laser.value = value
  except Exception as e:
    print(e)