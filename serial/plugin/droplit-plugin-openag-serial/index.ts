import { Response } from 'communication/response/interface/Response';

import { queue } from 'async';
import { clearTimeout, clearInterval } from 'timers';

import { setTimeout } from 'timers';
import { DigitalReadRequest } from 'communication/request/implementation/DigitalReadRequest';
import { SerialDevice } from 'SerialDevice';
import { DigitalWriteRequest } from 'communication/request/implementation/DigitalWriteRequest';


let device = new SerialDevice({
    devicePath: 'COM5',
    baudRate: 9600,
    delimiter: [0x0]
});


let req = new DigitalWriteRequest(7, 0);
console.log('Sending...');
device.send(req)
    .then((res: Response) => {
        console.log('SUCCESS');
    }).catch((err: any) => {
        console.log('ERROR');
    })
