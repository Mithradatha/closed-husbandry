import { DroplitPlugin, DeviceServiceMember } from 'droplit-plugin';
import { setImmediate } from 'timers';
import { Proxy as DeviceProxy } from './device';
import { Config } from './config';
import { Name } from './service';
import * as debug from 'debug';
const logger = debug('serial:serialplugin');

export class SerialPlugin extends DroplitPlugin {

    private config: Config = require('./config.json');
    private devices: { [path: string]: DeviceProxy } = {};

    public discover(): void {

        logger('discover');

        DeviceProxy.Discover().then(devicePaths => {

            logger('device paths: %O', devicePaths);

            devicePaths.forEach(devicePath => {

                if (!this.devices[devicePath]) {

                    logger('config: %O', this.config);

                    const supportedDevices = this.config.devices.filter((device => device.path === devicePath));

                    if (supportedDevices.length > 0) {

                        const proxyConfig = supportedDevices[0];
                        logger('proxyConfig: %O', proxyConfig);

                        const device = new DeviceProxy(proxyConfig);
                        const services: { [name: string]: boolean } = {};

                        proxyConfig.pins.forEach(pin => {
                            services[pin.service.name] = true;
                        });

                        device.connect().then(() => {

                            this.onDeviceInfo({
                                localId: devicePath,
                                address: devicePath,
                                services: Object.keys(services),
                                timestamp: new Date()
                            });

                            this.devices[devicePath] = device;

                            device.initialize((properties: DeviceServiceMember) => {
                                this.onPropertiesChanged([properties]);
                            }).then(() => this.onDiscoverComplete());

                        }).catch(ignore => this.onDiscoverComplete());
                    }
                }
            });
        });
    }

    public dropDevice(localId: string): boolean {

        logger('dropDevice');

        const device = this.devices[localId];
        if (device) device.disconnect();

        return true;
    }

    protected getSwitch(devicePath: string, callback: (_switch: string) => void, index: string): boolean {

        logger('getSwitch');

        logger(`localId: ${devicePath}, callback: ${callback}, index: ${index}`);

        if (!this.devices[devicePath]) return false;

        setImmediate(() => {

            this.devices[devicePath].get(Name.BinarySwitch, Number(index), callback);
        });

        return true;
    }

    protected setSwitch(devicePath: string, _switch: string, index: string): boolean {

        logger('setSwitch');

        logger(`localId: ${devicePath}, value: ${_switch}, index: ${index}`);

        const device = this.devices[devicePath];
        const pin = Number(index);

        if (!device || !(_switch === 'on' || _switch === 'off')) return false;

        logger('devices.set');

        this.devices[devicePath].set(Name.BinarySwitch, pin, _switch,
            (err?: Error, previousValue?: string) => {

                logger(`err: ${err}, val: ${previousValue}`);

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

        logger('switchOff');

        logger(`localId: ${devicePath}, value: ${value}, callback: ${callback}, index: ${index}`);

        return this.setSwitch(devicePath, 'off', index);
    }

    protected switchOn(devicePath: string, value: any, callback: (_switch: any) => void, index: string): boolean {

        logger('switchOn');

        logger(`localId: ${devicePath}, value: ${value}, callback: ${callback}, index: ${index}`);

        return this.setSwitch(devicePath, 'on', index);
    }

    protected getBrightness(devicePath: string, callback: (_brightness: number) => void, index: string): boolean {

        logger('getBrightness');

        logger(`localId: ${devicePath}, callback: ${callback}, index: ${index}`);

        if (!this.devices[devicePath]) return false;

        setImmediate(() => {

            this.devices[devicePath].get(Name.DimmableSwitch,
                Number(index), callback);
        });

        return true;
    }

    protected setBrightness(devicePath: string, _brightness: number, index: string): boolean {

        logger('setBrightness');

        logger(`localId: ${devicePath}, value: ${_brightness}, index: ${index}`);

        const device = this.devices[devicePath];
        const pin = Number(index);

        if (!device || (_brightness < 0 || _brightness > 100)) {

            logger('value out of expected range');
            return false;
        }

        this.devices[devicePath].set(Name.DimmableSwitch, pin, _brightness,
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

        logger('stepDown');

        logger(`localId: ${devicePath}, value: ${value}, callback: ${callback}, index: ${index}`);

        // if (value - 10 < 0)
        //     value = 0;
        // else
        //     value -= 10;

        return this.setBrightness(devicePath, value, index);
    }

    protected stepUp(devicePath: string, value: number, callback: (_brightness: number) => void, index: string): boolean {

        logger('stepUp');

        logger(`localId: ${devicePath}, value: ${value}, callback: ${callback}, index: ${index}`);

        // if (value + 10 > 100)
        //     value = 100;
        // else
        //     value += 10;

        return this.setBrightness(devicePath, value, index);
    }
}