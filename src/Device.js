'use strict';
import nconf from 'nconf';
import { clientFromConnectionString } from 'azure-iot-device-mqtt';
import { Message } from 'azure-iot-device';
import logger from './logger';
import mraa from 'mraa';
import SPI from 'spi';

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

		this.spi = new SPI.Spi('/dev/spidev0.0', {'mode': SPI.MODE['MODE_0']});
		this.spi.maxSpeed(10000);
		this.spi.open();

		this.client = clientFromConnectionString(connectionString);

		//do something when app is closing
		process.on('exit', this.exitHandler);

		//catches ctrl+c event
		process.on('SIGINT', this.exitHandler);

		//catches uncaught exceptions
		process.on('uncaughtException', this.exitHandler);
	}

	printResultFor(op) {
		return function printResult(err, res) {
			if (err) logger.error(`${op} error: ${err.toString()}`);
			//if (res) logger.warn(`${op} status: ${res.constructor.name}`);
		};
	}

	exitHandler() {
		this.spi.close();

		process.exit();
	}

	run() {
		// Working with SPI for analog sensors
		let temperature_buffer = new Buffer([0x01, 0x80, 0x00]);

		setInterval(() => {
			this.spi.read(temperature_buffer, (device, buf) => {
				var s = "";

				for (var i=0; i < buf.length; i++)
			      s = s + buf[i] + " ";
			    console.log(s);
			});
		}, 5000)

		// Working with MRAA and digital sensors
		// console.log('MRAA Version: ' + mraa.getVersion()); //write the mraa version to the console
		//
		// let touchSensor = new mraa.Gpio(25); //setup digital read on pin 25
		// touchSensor.dir(mraa.DIR_IN); //set the gpio direction to input
		//
		// let led = new mraa.Gpio(23); //setup digital read on pin 23
		// led.dir(mraa.DIR_OUT);
		//
		// function periodicActivity() {
    	// 		let touch_value = touchSensor.read(); //read the digital value of the pin
		// 		led.write(touch_value);
		// }
		//
		// setInterval(periodicActivity, 2000); //call the indicated function every 0.001 second (1000 milliseconds)

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
