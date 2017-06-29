import './setup-config';
import { Receiver } from './Receiver';
import { Device } from './Device';
import logger from './logger';

if (process.env.RECEIVER_MODE) {
	logger.info('Starting in receiver mode.');
	let receiver = new Receiver();
	receiver.run();
}
else if(process.env.DEVICE_MODE) {
	logger.info('Starting in device mode.');
	let device = new Device();
	device.run();
}
else {
	logger.error('Mode not selected.');
}
