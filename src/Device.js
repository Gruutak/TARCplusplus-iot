'use strict';
import nconf from 'nconf';
import { clientFromConnectionString } from 'azure-iot-device-mqtt';
import { Message } from 'azure-iot-device';
import logger from './logger';
import mraa from 'mraa';

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
		console.log('MRAA Version: ' + mraa.getVersion()); //write the mraa version to the console
		
		let touchSensor = new mraa.Gpio(25); //setup digital read on pin 25
		touchSensor.dir(mraa.DIR_IN); //set the gpio direction to input
		
		let led = new mraa.Gpio(23); //setup digital read on pin 23
		led.dir(mraa.DIR_OUT);

		function periodicActivity() {
    			let touch_value = touchSensor.read(); //read the digital value of the pin
			led.write(touch_value);
		}

		setInterval(periodicActivity, 1); //call the indicated function every 0.001 second (1000 milliseconds)
		
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
