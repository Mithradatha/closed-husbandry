import * as fs from 'fs';
import { resolve } from 'path';
import log from './Logger';
import Pin from './pins/Pin';
import PinOptions from './pins/PinOptions';
import DigitalPin from './pins/DigitalPin';
import AnalogPin from './pins/AnalogPin';
import SerialDevice from './SerialDevice';
import Request from './requests/Request';
import Response from './responses/Response';
import DigitalReadRequest from './requests/DigitalReadRequest';
import AnalogWriteRequest from './requests/AnalogWriteRequest';
import DigitalWriteRequest from './requests/DigitalWriteRequest';
import DigitalReadResponse from './responses/DigitalReadResponse';
import AnalogReadRequest from './requests/AnalogReadRequest';
import AnalogReadResponse from './responses/AnalogReadResponse';
import PinDirectionRequest from './requests/PinDirectionRequest';

const DEBUG = true;

const BAUD_RATE = 9600;
const DELIMITER = 0x0;
const MAX_RETRIES = 3;
const RES_TIMEOUT: number = 1000 * 3; // ms

const SERIAL_DEVICE_PATH = '/dev/serial/by-id';

export default class ProxySerialDevice {

    private device: SerialDevice;
    private pins: { [pin: number]: Pin };

    public constructor(path: string, pinOptions: { [pin: number]: PinOptions }) {
        this.pins = {};

        this.device = new SerialDevice({
            baudRate: BAUD_RATE,
            devicePath: path,
            delimiter: DELIMITER,
            maxRetries: MAX_RETRIES,
            responseTimeout: RES_TIMEOUT
        });

        for (const pinNumber in pinOptions) {

            if (!this.pins[pinNumber]) {

                const pin = pinOptions[pinNumber];

                switch (pin.mode) {
                    case 'Digital':
                        this.pins[pinNumber] = new DigitalPin(pin.direction, pin.state);
                        break;
                    case 'Analog':
                        this.pins[pinNumber] = new AnalogPin(pin.direction, pin.state);
                }
            }
        }

        log(this.pins);
    }

    public static Discover(): string[] {

        if (DEBUG)
            return ['COM5'];

        const devicePaths: string[] = [];

        try {
            const files: string[] = fs.readdirSync(SERIAL_DEVICE_PATH);

            files.forEach((name: string) => {

                const filePath = `${SERIAL_DEVICE_PATH}/${name}`;

                const stats = fs.lstatSync(filePath);
                if (stats.isSymbolicLink()) {

                    const linkString = fs.readlinkSync(filePath);
                    devicePaths.push(
                        resolve(SERIAL_DEVICE_PATH, linkString));
                }
            });
        } catch (ignore) { }

        return devicePaths;
    }

    public connect(): Promise<string> {

        return new Promise<string>((resolve, reject) => {

            this.device.connect()
                .then((devicePath: string) => {

                    for (const pinNumber in this.pins) {
                        if (this.pins.hasOwnProperty(pinNumber)) {

                            const direction = this.pins[pinNumber].direction;

                            this.device.send(new PinDirectionRequest(Number(pinNumber), (direction === 'Input') ? 0x0 : 0x1));
                        }
                    }

                    resolve(devicePath);
                })
                .catch((reason: any) => reject(reason));
        });
    }

    public set(pinNumber: number, value: any, callback: (err?: Error, val?: any) => void): boolean {

        if (!this.pins[pinNumber]) return false;

        const pin: Pin = this.pins[pinNumber];

        const req: Request = (pin.mode === 'Digital')
            ? new DigitalWriteRequest(pinNumber, (value === 'on') ? 0x1 : 0x0)
            : new AnalogWriteRequest(pinNumber, value);

        this.device.send(req)
            .then((res: Response) => {
                pin.state = value;
                callback(undefined, value);
            })
            .catch((reason: Error) => {
                callback(reason);
            });

        // callback(undefined, value);

        return true;
    }

    public get(pinNumber: number, callback: (value: any) => void): boolean {

        if (!this.pins[pinNumber]) return false;

        const pin = this.pins[pinNumber];

        if (pin.mode === 'Digital') {

            const req: Request = new DigitalReadRequest(pinNumber);
            this.device.send(req)
                .then((res: Response) => {
                    const val = ((res as DigitalReadResponse).value === 0x0) ? 'off' : 'on';
                    pin.state = val;
                    callback(val);
                });
        } else {

            const req: Request = new AnalogReadRequest(pinNumber);
            this.device.send(req)
                .then((res: Response) => {
                    const val = (res as AnalogReadResponse).value;
                    pin.state = val;
                    callback(val);
                });
        }

        // callback(this.getCached(pinNumber));

        return true;
    }

    public getCached(pinNumber: number): any {
        return this.pins[pinNumber].state;
    }
}