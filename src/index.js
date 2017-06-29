import './setup-config';
import { Receiver } from './Receiver';
import { Device } from './Device';

if (process.env.RECEIVER_MODE) {
	let receiver = new Receiver();
	receiver.run();
}
else if(process.env.DEVICE_MODE) {
	let device = new Device();
	device.run();
}
else {
	console.log('Mode not selected.');
}
