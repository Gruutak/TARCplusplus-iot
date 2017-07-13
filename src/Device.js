'use strict';
import nconf from 'nconf';
import { clientFromConnectionString } from 'azure-iot-device-mqtt';
import { Message } from 'azure-iot-device';
import logger from './logger';

var spawn = require('child_process').spawn;

/*
	PINS for mraa:
	D1 = 23
	D2 = 25

	Channels for SPI:
	ADC2 = [0x01, 0xA0, 0x00]
	ADC1 = [0x01, 0x80, 0x00]
 */

export class Device {
	constructor() {
		const connectionString = `HostName=${nconf.get('HOSTNAME')};DeviceId=${nconf.get('DEVICE_ID')};SharedAccessKey=${nconf.get('DEVICE_ACCESS_KEY')}`;

		this.client = clientFromConnectionString(connectionString);
	}

	printResultFor(op) {
		return function printResult(err, res) {
			if (err) logger.error(`${op} error: ${err.toString()}`);
			//if (res) logger.warn(`${op} status: ${res.constructor.name}`);
		};
	}

	run() {
		logger.info(`Iniciando leitura`);

		let py = spawn(`sudo`, [`python3`, `-u`, `sensors.py`]);

		py.stdout.on(`data`, data => {
			logger.warn(data);
		});

		py.stderr.on('data', function (data) {
			logger.error('stderr: ' + data);
		});


		/*
		let client = this.client;
		client.open(err => {
			if (err) {
				logger.error(`Could not connect: ${err}`);
			} else {
				logger.info(`Client connected`);

			    // Create a message and send it to the IoT Hub every second
			    setInterval(() => {
			        var temperature = 20 + (Math.random() * 15);
			        var humidity = 60 + (Math.random() * 20);
			        var data = JSON.stringify({ deviceId: nconf.get('DEVICE_ID'), temperature: temperature, humidity: humidity });
			        var message = new Message(data);
			        message.properties.add('temperatureAlert', (temperature > 30) ? 'true' : 'false');
			        logger.warn(`Sending message: ${message.getData()}`);
			        client.sendEvent(message, this.printResultFor('send'));
			    }, 1000);
		  	}
		});
		*/
	}
}
