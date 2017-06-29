import './setup-config';
import {Receiver} from './Receiver';
import { openClient as runDevice } from './Device';


let receiver = new Receiver();
receiver.run();
// runDevice();
