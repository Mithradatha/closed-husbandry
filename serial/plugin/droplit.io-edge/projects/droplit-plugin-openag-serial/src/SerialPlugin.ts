import { DroplitPlugin } from 'droplit-plugin';
import { setImmediate } from 'timers';
import ProxySerialDevice from './ProxySerialDevice';

const DEVICE_SERVICES = ['BinarySwitch', 'DimmableSwitch'];
const DEVICE_MEMBERS = {
    BinarySwitch: 'switch',
    DimmableSwitch: 'brightness'
};

export class SerialPlugin extends DroplitPlugin {

    private devices: { [path: string]: ProxySerialDevice };

    private services: any;

    public constructor() {

        super();

        this.devices = {};

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
                stepDown: this.stepDown,
                stepUp: this.stepUp
            }
        };
    }

    public discover(): void {

        console.log('discover');

        const devicePaths: string[] = ProxySerialDevice.Discover();

        devicePaths.forEach(devicePath => {

            if (!this.devices[devicePath]) {

                const device = new ProxySerialDevice(
                    devicePath,
                    {
                        13: {
                            mode: 'Digital',
                            direction: 'Output',
                            state: 'off'
                        }
                    }
                );

                device.connect().then((devicePath: string) => {

                    this.onDeviceInfo({
                        localId: devicePath,
                        address: devicePath,
                        services: DEVICE_SERVICES,
                        promotedMembers: DEVICE_MEMBERS,
                        timestamp: new Date()
                    });

                    this.devices[devicePath] = device;
                    this.onDiscoverComplete();

                });
            }
        });
    }

    public dropDevice(localId: string): boolean {

        console.log('dropDevice');

        return true;
    }

    protected getSwitch(localId: string, callback: (value: string) => void, index: string): boolean {

        console.log('getSwitch');

        console.log(`localId: ${localId}, callback: ${callback}, index: ${index}`);

        if (!this.devices[localId]) return false;

        setImmediate(() => {
            callback && this.devices[localId].get(Number(index), callback);
        });

        return true;
    }

    protected setSwitch(localId: string, value: string, index: string): boolean {

        console.log('setSwitch');

        console.log(`localId: ${localId}, value: ${value}, index: ${index}`);

        const device = this.devices[localId];
        const pin = Number(index);

        if (!device || !(value === 'on' || value === 'off')) return false;

        console.log('devices.set');

        const previousValue = this.devices[localId].getCached(pin);

        this.devices[localId].set(pin, value, (err?: Error, val?: any) => {

            console.log(`err: ${err}, val: ${val}`);

            if (val !== previousValue) {

                this.onPropertiesChanged([{
                    localId,
                    service: 'BinarySwitch',
                    index,
                    member: 'switch',
                    value: val,
                    error: err,
                    timestamp: new Date()
                }]);
            }
        });

        return true;
    }

    protected switchOff(localId: string, value: any, callback: (value: any) => void, index: string): boolean {

        console.log('switchOff');

        console.log(`localId: ${localId}, value: ${value}, callback: ${callback}, index: ${index}`);

        return this.setSwitch(localId, 'off', index);
    }

    protected switchOn(localId: string, value: any, callback: (value: any) => void, index: string): boolean {

        console.log('switchOn');

        console.log(`localId: ${localId}, value: ${value}, callback: ${callback}, index: ${index}`);

        return this.setSwitch(localId, 'on', index);
    }

    protected getBrightness(localId: string, callback: (value: any) => void, index: string): boolean {

        console.log('getBrightness');

        console.log(`localId: ${localId}, callback: ${callback}, index: ${index}`);

        if (!this.devices[localId]) return false;

        setImmediate(() => {
            callback && this.devices[localId].get(Number(index), callback);
        });

        return true;
    }

    protected setBrightness(localId: string, value: any, index: string): boolean {

        console.log('setBrightness');

        console.log(`localId: ${localId}, value: ${value}, index: ${index}`);

        const device = this.devices[localId];
        const pin = Number(index);

        if (!device || !(value > -1 || value < 101)) return false;

        const previousValue = this.devices[localId].getCached(pin);

        this.devices[localId].set(pin, value, (err?: Error, val?: any) => {

            if (val !== previousValue) {

                this.onPropertiesChanged([{
                    localId,
                    service: 'DimmableSwitch',
                    index,
                    member: 'brightness',
                    value: val,
                    error: err,
                    timestamp: new Date()
                }]);
            }
        });

        return true;
    }

    protected stepDown(localId: string, value: any, callback: (value: any) => void, index: string): boolean {

        console.log('stepDown');

        console.log(`localId: ${localId}, value: ${value}, callback: ${callback}, index: ${index}`);

        return this.setBrightness(localId, 0, index);
    }

    protected stepUp(localId: string, value: any, callback: (value: any) => void, index: string): boolean {

        console.log('stepUp');

        console.log(`localId: ${localId}, value: ${value}, callback: ${callback}, index: ${index}`);

        return this.setBrightness(localId, 255, index);
    }
}