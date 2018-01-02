import { SerialDevice } from './SerialDevice';
import { queue } from 'async';
import { clearTimeout, clearInterval } from 'timers';

import { setTimeout } from 'timers';
import { CobsEncoder } from './CobsEncoder';
import { FletcherChecksum } from "./FletcherChecksum";

console.log('Hey');

// let device = new SerialDevice({
//     devicePath: 'COM5',
//     baudRate: 9600,
//     delimiter: [0x0]
// });

// device.sendMessage(Buffer.from([0x31]));
