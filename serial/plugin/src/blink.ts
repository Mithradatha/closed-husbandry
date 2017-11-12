import { CobsEncoder } from './CobsEncoder';
import * as SerialPort from 'serialport';

const delim = 0x0;
const encoder = new CobsEncoder(delim);
const devicePath = '/dev/ttyACM0';

const serialPort = new SerialPort(devicePath, { baudRate: 9600 });

const parser = serialPort.pipe(
    new SerialPort.parsers.Readline({ delimiter: '\n' })
);

const ledOFF = new Uint8Array([0x30]);
const ledON = new Uint8Array([0x31]);

let iterations: number;
let interval: number;

if (process.argv.length === 4) {

    iterations = parseInt(process.argv[2], 10);
    interval = parseInt(process.argv[3], 10);
} else {

    console.log('Missing Command-Line Arguments...');
    console.log('node blink.js <iterations> <interval(ms)>');
    cleanup();
}

serialPort.on('open', onOpen);
parser.on('error', onError);
parser.on('data', onData);
serialPort.on('close', onClose);

function onOpen(): void {

    console.log('Connection Opened...');

    setTimeout(() => {

        blink(iterations, cleanup);
    }, 3000);
}

function blink(iteration: number, cb): void {

    setTimeout(() => {

        const cmd = (iteration % 2 === 0) ? ledON : ledOFF;
        console.log('TX: ' + cmd);
        serialPort.write(prep(cmd));

        if (--iteration) {

            blink(iteration, cb);
        } else {

            cb();
        }
    }, interval);
}

function cleanup() {

    console.log('Cleaning Up...');
    serialPort.write(prep(ledOFF));

    setTimeout(() => {

        serialPort.close();
        process.exit(0);
    }, 3000);
}

function onError(error: Error): void {

    console.log('Error Occurred... ' + error.message);
}

function onData(data: Buffer): void {

    console.log('RX: ' + data);
}

function onClose(): void {

    console.log('Connection Closed...');
}

function printArray(arr: Uint8Array): void {

    process.stdout.write('[ ');
    const lastIndex: number = arr.length - 1;

    for (let index = 0; index < lastIndex; index++) {

        process.stdout.write(arr[index].toString() + ', ');
    }

    process.stdout.write(arr[lastIndex].toString());
    process.stdout.write(' ]\n');
}

function parse() {

}

function prep(cmd: Uint8Array): Buffer {

    const encoded = new Buffer(encoder.pack(cmd));
    return Buffer.concat([encoded, new Buffer([delim])]);
}
