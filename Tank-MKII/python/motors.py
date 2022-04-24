#!/usr/bin/python3

from gpiozero import Motor
from time import sleep
import sys, json

def get_args_dict(args, keys):
    args_dict = {}
    for i, key in enumerate(keys):
        try: args_dict[key] = args[i]
        except: raise Exception(f'Missing argument: "{key}"!')
    return args_dict

def add_motor(args):
    args_dict = get_args_dict(args, ['name', 'forward_pin', 'backward_pin', 'enable_pin'])

    name = args_dict['name']
    if name in motors: raise Exception(f'Motor "{name}" already exists!')
    
    motors[name] = Motor(args_dict['forward_pin'], args_dict['backward_pin'], args_dict['enable_pin'])

def set_motor(args):
    args_dict = get_args_dict(args, ['name', 'speed'])

    name = args_dict['name']
    speed = float(args_dict['speed'])

    if name not in motors: raise Exception(f'Motor "{name}" does not exist!')
    if speed > 1 or speed < -1: raise Exception(f'Speed of {speed} is outside of range -1 to 1!')

    # if motors[name].value / speed < 0:
    #     motors[name].value = 0
    #     sleep(0.5)

    motors[name].value = speed

motors = {}
done = False
while not done:
    try:
        words = input().lower().split(' ')
        command = words[0]
        args = words[1:]

        if command == 'exit':
            done = True
        elif command == 'add':
            add_motor(args)
            pass
        elif command == 'set':
            pass
            set_motor(args)
        else:
            raise Exception(f'Invalid command "{command}"!')
        print('ok')
    except Exception as e:
        print(e, file = sys.stderr)