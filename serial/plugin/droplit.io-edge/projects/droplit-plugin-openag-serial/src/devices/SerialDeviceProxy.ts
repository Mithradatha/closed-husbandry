import SerialDevice from './SerialDevice';
import ServiceClassFactory from '../services/ServiceClassFactory';
import PinDirectionRequest from '../requests/PinDirectionRequest';
import PinOptions from '../pins/PinOptions';
import Pin from '../pins/Pin';
import { DeviceServiceMember } from 'droplit-plugin';
import Response from '../responses/Response';
import { Service } from '../util/Types';

const BAUD_RATE = 9600;
const DELIMITER = 0x0;
const MAX_RETRIES = 3;
const RES_TIMEOUT: number = 1000 * 3; // ms

// const SERIAL_DEVICE_PATH = '/dev/serial/by-id';

export default class SerialDeviceProxy {

    private device: SerialDevice;
    private pins: { [index: number]: Pin } = {};

    public constructor(
        serialDevicePath: string,
        private pinOptions: { [index: number]: PinOptions }
    ) {

        this.device = new SerialDevice({
            baudRate: BAUD_RATE,
            devicePath: serialDevicePath,
            delimiter: DELIMITER,
            maxRetries: MAX_RETRIES,
            responseTimeout: RES_TIMEOUT
        });
    }

    public static Discover(): string[] {

        return ['COM5'];

        // const devicePaths: string[] = [];

        // try {
        //     const files: string[] = fs.readdirSync(SERIAL_DEVICE_PATH);

        //     files.forEach((name: string) => {

        //         const filePath = `${SERIAL_DEVICE_PATH}/${name}`;

        //         const stats = fs.lstatSync(filePath);
        //         if (stats.isSymbolicLink()) {

        //             const linkString = fs.readlinkSync(filePath);
        //             devicePaths.push(
        //                 resolve(SERIAL_DEVICE_PATH, linkString));
        //         }
        //     });
        // } catch (ignore) { }

        // return devicePaths;
    }

    public connect(): Promise<string> {
        return this.device.connect();
    }

    public disconnect(): Promise<string> {
        return this.device.disconnect();
    }

    public get(name: Service, pinIndex: number,
        callback?: (currentValue: any) => void): boolean {

        if (!this.pins[pinIndex]) return false;
        const pin = this.pins[pinIndex];

        const service = ServiceClassFactory
            .CreateService(name, this.device);

        service.getValue(pin)
            .then((currentValue: any) => {

                callback && callback(currentValue);

            }).catch((ignored: any) => { });

        return true;
    }

    public set(name: Service, pinIndex: number, value: any,
        callback?: (err?: any, previousValue?: any) => void): boolean {

        if (!this.pins[pinIndex]) return false;
        const pin = this.pins[pinIndex];

        const service = ServiceClassFactory
            .CreateService(name, this.device);

        service.setValue(pin, value)
            .then((previousValue: any) => {

                callback && callback(undefined, previousValue);
            })
            .catch((err: any) => callback && callback(err));

        return true;
    }

    public initialize(callback: (properties: DeviceServiceMember) => void): void {

        for (const idx in this.pinOptions) {

            const index = Number(idx);
            const option = this.pinOptions[index];

            const pin = new Pin(index, option.direction);
            this.pins[index] = pin;

            const direction = (pin.direction === 'Input') ? 0 : 1;
            const req = new PinDirectionRequest(index, direction);
            this.device.send(req)
                .then((res: Response) => {

                    this.set(option.service, index, option.state,
                        (err?: any, previousValue?: any) => {

                            callback({
                                localId: this.device.path,
                                service: option.service,
                                index: idx,
                                member: option.member,
                                value: option.state,
                                error: err,
                                timestamp: new Date()
                            });
                        });
                });
        }
    }
}
