
import SerialDevice from "./SerialDevice";
import DigitalWriteRequest from "./src/DigitalWriteRequest";
import Response from "./src/Response";

console.log('Creating Serial Device');
let device = new SerialDevice({
    devicePath: 'COM5',
    baudRate: 9600,
    delimiter: 0x0
});
console.log('Serial Device Created');

console.log('Creating Request');
let req = new DigitalWriteRequest(13, 0);

setTimeout(() => {

    console.log('Sending Request');

    device.send(req)
        .then((res: Response) => {
            console.log(`Caught Response: ${res.value}`);
        }).catch((err: any) => {
            console.log(`Caught Error: ${err}`);
        });
}, 5000);

// import CobsEncoder from './src/CobsEncoder';
// import * as FletcherChecksum from './src/FletcherChecksum';

// let msg = Buffer.from([0x0, 0x7, 0x1, 0x0]);
// let encoder = new CobsEncoder(0x0);
// let sum = FletcherChecksum.generate(msg);
// let checked = FletcherChecksum.append(msg, sum);
// let encoded = encoder.pack(checked);
// let frame = Buffer.concat([encoded, Buffer.from([0x0])]);

// console.log(frame);
// console.log(Buffer.from([0x5, 0xFF]));