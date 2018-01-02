
import { CobsEncoder } from './CobsEncoder';
import { FletcherChecksum } from './FletcherChecksum';
const AvailablePorts = require('serialport');
import * as SerialPort from 'serialport';

export class DoStuff {

    private readonly BAUD_RATE = 9600;
    private readonly DELIMITER = 0x0;

    private serialPorts: Map<string, SerialPort>;
    private devices: Map<string, object>;
    private encoder: CobsEncoder;

    constructor() {

        this.devices = new Map<string, object>();
        this.serialPorts = new Map<string, SerialPort>();

        AvailablePorts.list()
            .then((ports) => this.connect(ports))
            .catch((err) => console.log("uh oh"));

        this.encoder = new CobsEncoder(this.DELIMITER);

        // class Delimiter extends Stream.Transform {
        // 	constructor(options: {delimiter: string | Buffer | number[]});
        // }
    }

    private connect(ports): void {

        ports.forEach(port => {

            const devicePath = port.comName;
            const serial = new SerialPort(
                devicePath,
                { baudRate: this.BAUD_RATE }
            );

            serial.on('open', (data?: any) => {
                this.onOpen(devicePath, serial);
            });
        });
    }

    private onOpen(devicePath: string, serial: SerialPort): void {

        const parser = serial.pipe(new SerialPort.parsers.Delimiter(
            { delimiter: [this.DELIMITER] }
        ));

        parser.on('data', (data: Buffer) => this.onData(devicePath, data));
        serial.on('error', (err: any) => this.onError(devicePath, err));
        serial.on('close', (err?: any) => this.onClose(devicePath, err));

        this.serialPorts.set(devicePath, serial);
        this.devices.set(devicePath, { 'BinarySwitch.switch': 'off' });

        console.log('Opened Connection: ' + devicePath);
    }

    private onData(devicePath: string, data: Buffer): void {
        //console.log(data);
        const decoded = this.encoder.unpack(data);
        //console.log(decoded);
        if (FletcherChecksum.valid(decoded)) {

            const payload = FletcherChecksum.strip(decoded);
            console.log(payload);

            this.deliver(devicePath, payload);
        }
    }

    private onError(devicePath: string, err: any): void {

    }

    private onClose(devicePath: string, err?: any): void {

        if (err && err.disconnect == true) {
            // Disconnect Message
        }

        this.serialPorts.delete(devicePath);
    }

    public deliver(devicePath: string, payload: Uint8Array): void {

        const sum: Uint8Array = FletcherChecksum.generate(payload);
        let data: Uint8Array = FletcherChecksum.append(payload, sum);
        let encoded: Uint8Array = this.encoder.pack(data);

        let msg = Buffer.concat([new Buffer(encoded), new Buffer([this.DELIMITER])]);

        this.serialPorts.get(devicePath).write(msg);
    }
}