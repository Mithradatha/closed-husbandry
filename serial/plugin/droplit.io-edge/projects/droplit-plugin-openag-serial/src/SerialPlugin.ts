import { DroplitPlugin, DeviceServiceMember } from 'droplit-plugin';
import { setImmediate } from 'timers';
import SerialDeviceProxy from './devices/SerialDeviceProxy';
import log from './util/Logger';
import { PluginConfiguration } from './config.interface';

const DEVICE_SERVICES: string[] = ['BinarySwitch', 'DimmableSwitch'];

export class SerialPlugin extends DroplitPlugin {

    private config: PluginConfiguration = require('./config.json');

    private devices: { [path: string]: SerialDeviceProxy } = {};

    public discover(): void {

        log('discover');

        const devicePaths: string[] = SerialDeviceProxy.Discover();

        devicePaths.forEach(devicePath => {

            if (!this.devices[devicePath]) {

                const device = new SerialDeviceProxy(devicePath, this.config.devices[]);

                device.connect().then((devicePath: string) => {

                    this.onDeviceInfo({
                        localId: devicePath,
                        address: devicePath,
                        services: DEVICE_SERVICES,
                        timestamp: new Date()
                    });

                    this.devices[devicePath] = device;

                    device.initialize((properties: DeviceServiceMember) => {
                        this.onPropertiesChanged([properties]);

                        this.onDiscoverComplete();
                    });

                }).catch(ignore => this.onDiscoverComplete());
            }
        });
    }

    public dropDevice(localId: string): boolean {

        log('dropDevice');

        const device = this.devices[localId];
        if (device) device.disconnect();

        return true;
    }

    protected getSwitch(devicePath: string, callback: (_switch: string) => void, index: string): boolean {

        log('getSwitch');

        log(`localId: ${devicePath}, callback: ${callback}, index: ${index}`);

        if (!this.devices[devicePath]) return false;

        setImmediate(() => {

            this.devices[devicePath].get('BinarySwitch',
                Number(index), callback);
        });

        return true;
    }

    protected setSwitch(devicePath: string, _switch: string, index: string): boolean {

        log('setSwitch');

        log(`localId: ${devicePath}, value: ${_switch}, index: ${index}`);

        const device = this.devices[devicePath];
        const pin = Number(index);

        if (!device || !(_switch === 'on' || _switch === 'off')) return false;

        log('devices.set');

        this.devices[devicePath].set('BinarySwitch', pin, _switch,
            (err?: Error, previousValue?: string) => {

                log(`err: ${err}, val: ${previousValue}`);

                if (previousValue !== _switch) {

                    this.onPropertiesChanged([{
                        localId: devicePath,
                        service: 'BinarySwitch',
                        index,
                        member: 'switch',
                        value: _switch,
                        error: err,
                        timestamp: new Date()
                    }]);
                }
            });

        return true;
    }

    protected switchOff(devicePath: string, value: any, callback: (_switch: any) => void, index: string): boolean {

        log('switchOff');

        log(`localId: ${devicePath}, value: ${value}, callback: ${callback}, index: ${index}`);

        return this.setSwitch(devicePath, 'off', index);
    }

    protected switchOn(devicePath: string, value: any, callback: (_switch: any) => void, index: string): boolean {

        log('switchOn');

        log(`localId: ${devicePath}, value: ${value}, callback: ${callback}, index: ${index}`);

        return this.setSwitch(devicePath, 'on', index);
    }

    protected getBrightness(devicePath: string, callback: (_brightness: number) => void, index: string): boolean {

        log('getBrightness');

        log(`localId: ${devicePath}, callback: ${callback}, index: ${index}`);

        if (!this.devices[devicePath]) return false;

        setImmediate(() => {

            this.devices[devicePath].get('DimmableSwitch',
                Number(index), callback);
        });

        return true;
    }

    protected setBrightness(devicePath: string, _brightness: number, index: string): boolean {

        log('setBrightness');

        log(`localId: ${devicePath}, value: ${_brightness}, index: ${index}`);

        const device = this.devices[devicePath];
        const pin = Number(index);

        if (!device || (_brightness < 0 || _brightness > 100)) {

            log('value out of expected range');
            return false;
        }

        this.devices[devicePath].set('DimmableSwitch', pin, _brightness,
            (err?: Error, previousValue?: number) => {

                if (previousValue !== _brightness) {

                    this.onPropertiesChanged([{
                        localId: devicePath,
                        service: 'DimmableSwitch',
                        index,
                        member: 'brightness',
                        value: _brightness,
                        error: err,
                        timestamp: new Date()
                    }]);
                }
            });

        return true;
    }

    protected stepDown(devicePath: string, value: number, callback: (_brightness: number) => void, index: string): boolean {

        log('stepDown');

        log(`localId: ${devicePath}, value: ${value}, callback: ${callback}, index: ${index}`);

        // if (value - 10 < 0)
        //     value = 0;
        // else
        //     value -= 10;

        return this.setBrightness(devicePath, value, index);
    }

    protected stepUp(devicePath: string, value: number, callback: (_brightness: number) => void, index: string): boolean {

        log('stepUp');

        log(`localId: ${devicePath}, value: ${value}, callback: ${callback}, index: ${index}`);

        // if (value + 10 > 100)
        //     value = 100;
        // else
        //     value += 10;

        return this.setBrightness(devicePath, value, index);
    }
}