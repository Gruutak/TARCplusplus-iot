#!/usr/bin/env python

#Graduacao
#Lucas Bertone			552313
#Luis Barbosa			511374

#Pos Graduacao
#Ana Paula
#Rodolpho Ribeiro


#Libraries
import sys
import time
import _thread
import json

import spidev
from libsoc import gpio
from libsoc_zero.GPIO import Tilt
from time import sleep

tilt = Tilt('GPIO-C')


def read_Tilt():
	global tilt
	msg = Msg()
	while True:
		tilt.wait_for_tilt()
		msg.print_tilt()

class Msg(object):
	def __init__ (self, temp='', lum=''):
		self.Temperatura = temp
		self.Luminosidade = lum
	def print_tilt (self):
		print('tilt')
	def print_msg(self):
		print(json.dumps(msg.__dict__))


spi = spidev.SpiDev()
spi.open(0,0)
spi.max_speed_hz=10000
spi.mode = 0b00
spi.bits_per_word = 8
channel_select_temperatura=[0x01, 0x80, 0x00] #ADC2
channel_select_luminosidade=[0x01, 0xA0, 0x00] #ADC1
timer = 0


if __name__=='__main__':
	_thread.start_new_thread(read_Tilt, ())
	gpio_cs = gpio.GPIO(18, gpio.DIRECTION_OUTPUT)
	with gpio.request_gpios([gpio_cs]):
		while timer < 120:
			gpio_cs.set_high()
			sleep(0.00001)
			gpio_cs.set_low()
			rx = spi.xfer(channel_select_temperatura)
			gpio_cs.set_high()

			adc_value = (rx[1] << 8) & 0b1100000000
			adc_value = adc_value | (rx[2] & 0xff)

			#Realiza a conversao para celsius
			adc_value = (adc_value*5.0/1023-0.5)*100


			gpio_cs.set_high()
			sleep(0.00001)
			gpio_cs.set_low()
			rx = spi.xfer(channel_select_luminosidade)
			gpio_cs.set_high()

			adc_value2 = (rx[1] << 8) & 0b1100000000
			adc_value2 = adc_value2 | (rx[2] & 0xff)


			msg = Msg(adc_value, adc_value2)
			msg.print_msg()

			sleep(5)
			timer = timer + 5
		connection.close()
