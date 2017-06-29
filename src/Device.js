'use strict';
import nconf from 'nconf';
import { clientFromConnectionString } from 'azure-iot-device-mqtt';
import { Message } from 'azure-iot-device';

export class Device {
	constructor() {
		const connectionString = `HostName=${nconf.get('HOSTNAME')};DeviceId=${nconf.get('DEVICE_ID')};SharedAccessKey=${nconf.get('DEVICE_ACCESS_KEY')}`;

		this.client = clientFromConnectionString(connectionString);
	}

	printResultFor(op) {
		return function printResult(err, res) {
			if (err) console.log(`${op} error: ${err.toString()}`);
			if (res) console.log(`${op} status: ${res.constructor.name}`);
		};
	}

	run() {
		let client = this.client;
		client.open(err => {
			if (err) {
				console.log(`Could not connect: ${err}`);
			} else {
				console.log(`Client connected`);

			    // Create a message and send it to the IoT Hub every second
			    setInterval(() => {
			        var temperature = 20 + (Math.random() * 15);
			        var humidity = 60 + (Math.random() * 20);
			        var data = JSON.stringify({ deviceId: 'myFirstNodeDevice', temperature: temperature, humidity: humidity });
			        var message = new Message(data);
			        message.properties.add('temperatureAlert', (temperature > 30) ? 'true' : 'false');
			        console.log(`Sending message: ${message.getData()}`);
			        client.sendEvent(message, this.printResultFor('send'));
			    }, 1000);
		  	}
		});
	}
}
