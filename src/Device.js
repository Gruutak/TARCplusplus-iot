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

		let client = this.client;
		client.open(err => {
			if (err) {
				logger.error(`Could not connect: ${err}`);
			} else {
				logger.info(`Client connected`);

				let py = spawn(`sudo`, [`python3`, `-u`, `sensors.py`]);

				py.stdout.on(`data`, py_data => {
					if(py_data == `tilt`) {
						var message = new Message();
						message.properties.add('earthquakeAlert', true);
				        logger.warn(`Sending message: ${message.getData()}`);
				        client.sendEvent(message, this.printResultFor('send'));
					}
					else {
						let parsed_json = JSON.parse(py_data);

						// Create a message and send it to the IoT Hub every second
				        var temperature = data[`Temperatura`];
				        var luminosity = data[`Luminosidade`];
				        var data = JSON.stringify({ deviceId: nconf.get('DEVICE_ID'), temperature: temperature, humidity: humidity });
				        var message = new Message(data);
				        logger.warn(`Sending message: ${message.getData()}`);
				        client.sendEvent(message, this.printResultFor('send'));
					}
				});

				py.stderr.on('data', data => logger.error('stderr: ' + data));


		  	}
		});
	}
}
