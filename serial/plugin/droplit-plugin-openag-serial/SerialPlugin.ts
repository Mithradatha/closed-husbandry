
import * as droplit from 'droplit-plugin';
import SerialDevice from './SerialDevice';
import DigitalReadRequest from './src/DigitalReadRequest';
import DigitalReadResponse from './src/DigitalReadResponse';
import Response from './src/Response';
import { setImmediate } from 'async';

const BAUD_RATE: number = 9600;
const DELIMITER: number = 0x0;
const MAX_RETRIES: number = 3;
const RES_TIMEOUT: number = 1000 * 3; // ms

export class SerialPlugin extends droplit.DroplitPlugin {

    private devices: Map<string, SerialDevice>;

    private services: any;
    private members: any;

    public constructor() {
        super();

        this.services = {
            BinarySwitch: {
                get_switch: this.getSwitch,
                set_switch: this.setSwitch,
                switchOff: this.switchOff,
                switchOn: this.switchOn
            },
            DimmableSwitch: {
                get_brightness: this.getBrightness,
                set_brightness: this.setBrightness,
                stepUp: this.stepUp,
                stepdown: this.stepDown
            }
        };

        this.members = {
            switch: 'BinarySwitch.switch',
            brightness: 'DimmableSwitch.brightness'
        };
    }

    public discover(): void {

        const devicePaths: string[] = SerialDevice.Discover();

        devicePaths.forEach(devicePath => {

            if (!this.devices.has(devicePath)) {

                const device = new SerialDevice({
                    baudRate: BAUD_RATE,
                    devicePath: devicePath,
                    delimiter: DELIMITER,
                    maxRetries: MAX_RETRIES,
                    responseTimeout: RES_TIMEOUT
                });

                device.connect()
                    .then((devicePath: string) => {

                        console.log('Connected!');
                        this.onDeviceInfo({
                            localId: devicePath,
                            services: this.services,
                            promotedMembers: this.members,
                            pluginName: SerialPlugin.name,
                            timestamp: new Date()
                        });

                        this.devices.set(devicePath, device);
                        this.onDiscoverComplete();
                    })
                    .catch((reason: any) => {
                        this.onDiscoverComplete();
                    });
            }
        });

    }

    public dropDevice(localId: string): boolean {

        const device = this.devices.get(localId);
        if (device) {

            device.disconnect()
                .then((devicePath: string) => {
                    this.devices.delete(devicePath);
                });
        }

        /* 
        * Note: Not sure how to wait on disconnect
        * without changing method signature to async,
        * so just return true always, and if the disconnect
        * is rejected, then the device is still cached.
        */

        return true;
    }

    protected getSwitch(localId: string, callback: (value: any) => void, index: string): boolean {

        const device = this.devices.get(localId);

        if (!device) {
            callback(undefined);
            return true;

        } else {

            try {
                const req = new DigitalReadRequest(Number(index));
                const res = await device.send(req) as DigitalReadResponse;
                callback(res.value);
                return true;

            } catch (err) {
                return false;
            }
        }
    }

    protected setSwitch(localId: string, value: any, index: string): boolean {

    }

    protected switchOff(localId: string, value: any, callback: (value: any) => void, index: string): boolean {

    }


    protected switchOn(localId: string, value: any, callback: (value: any) => void, index: string): boolean {

    }

    protected getBrightness(localId: string, callback: (value: any) => void, index: string): boolean {


    }

    protected setBrightness(localId: string, value: any, index: string): boolean {

    }


    protected stepUp(localId: string, value: any, callback: (value: any) => void, index: string): boolean {

    }


    protected stepDown(localId: string, value: any, callback: (value: any) => void, index: string): boolean {

    }


}