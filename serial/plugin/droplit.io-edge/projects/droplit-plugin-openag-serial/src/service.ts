import { Response } from './response';
import * as Request from './request';
import { AsyncRequestHandler } from './device';
import { LOW, HIGH, Converter as ArduinoConverter } from './arduino';
import { Pin } from './pin';
import * as debug from 'debug';
const binarySwitchLogger = debug('serial:binaryswitch');
const dimmableSwitchLogger = debug('serial:dimmableswitch');

export enum Name {

    BinarySwitch = 'BinarySwitch',
    DimmableSwitch = 'DimmableSwitch'
}

export abstract class Service<T> {

    constructor(protected handler: AsyncRequestHandler) { }

    abstract getValue(pin: Pin): Promise<T>;

    abstract setValue(pin: Pin, value: T): Promise<T>;

    protected abstract getCachedValue(pin: Pin): T;

    protected abstract setCachedValue(pin: Pin, value: T): void;
}

export class BinarySwitch extends Service<string> {

    constructor(handler: AsyncRequestHandler) {
        super(handler);
    }

    getValue(pin: Pin): Promise<string> {

        binarySwitchLogger('getValue(%O)', pin);
        const req = new Request.DigitalRead(pin.index);

        return new Promise<string>((resolve, reject) => {

            this.handler.send(req)
                .then((res: Response) => {

                    const newValue = res.value;
                    const _switch = this.digitalToString(newValue);

                    this.setCachedValue(pin, _switch);
                    resolve(_switch);
                })
                .catch((err: any) => reject(err));
        });
    }

    setValue(pin: Pin, _switch: string): Promise<string> {

        binarySwitchLogger('setValue(%O, %s)', pin, _switch);
        const previousValue = this.getCachedValue(pin);
        const newValue = this.stringToDigital(_switch) as LOW | HIGH;

        const req = new Request.DigitalWrite(pin.index, newValue);

        return new Promise<string>((resolve, reject) => {

            this.handler.send(req)
                .then((res: Response) => {

                    this.setCachedValue(pin, _switch);
                    resolve(previousValue);
                })
                .catch((err: any) => reject(err));
        });
    }

    protected getCachedValue(pin: Pin): string {

        binarySwitchLogger('getCachedValue(%O)', pin);
        const value = pin.getState(0, 1);
        return this.digitalToString(value);
    }

    protected setCachedValue(pin: Pin, _switch: string) {

        binarySwitchLogger('setCachedValue(%O, %s)', pin, _switch);
        const value = this.stringToDigital(_switch);
        pin.setState(value, 0, 1);
    }

    private stringToDigital(value: string): number {
        return (value === 'off') ? 0 : 1;
    }

    private digitalToString(value: number): string {
        return (value === 0) ? 'off' : 'on';
    }
}

export class DimmableSwitch extends Service<number> {

    constructor(handler: AsyncRequestHandler) {
        super(handler);
    }

    getValue(pin: Pin): Promise<number> {

        dimmableSwitchLogger('getValue(%O)', pin);
        const req = new Request.AnalogRead(pin.index);

        return new Promise<number>((resolve, reject) => {

            this.handler.send(req)
                .then((res: Response) => {

                    const val = res.value;
                    const _brightness = this.bit10ToPerc(val);

                    this.setCachedValue(pin, _brightness);
                    resolve(_brightness);

                })
                .catch((err: any) => reject(err));
        });
    }

    setValue(pin: Pin, _brightness: number): Promise<number> {

        dimmableSwitchLogger('setCachedValue(%O, %d)',
            pin, _brightness);
        const previousValue = this.getCachedValue(pin);
        const newValue = this.percToByte(_brightness);
        const req = new Request.AnalogWrite(pin.index, newValue);

        return new Promise<number>((resolve, reject) => {

            this.handler.send(req)
                .then((res: Response) => {

                    this.setCachedValue(pin, _brightness);
                    resolve(previousValue);
                })
                .catch((err: any) => reject(err));
        });
    }

    protected getCachedValue(pin: Pin): number {

        dimmableSwitchLogger('getCachedValue(%O)', pin);
        const value = pin.getState(0, 100);
        return value;
    }

    protected setCachedValue(pin: Pin, _brightness: number) {

        dimmableSwitchLogger('setCachedValue(%O, %d)',
            pin, _brightness);
        pin.setState(_brightness, 0, 100);
    }

    private bit10ToPerc(value: number): number {
        return ArduinoConverter.FromAnalog10(value, 0, 100);
    }

    private percToByte(value: number): number {
        return ArduinoConverter.ToAnalog8(value, 0, 100);
    }
}

export abstract class Factory {

    static CreateService(
        adapter: Name, handler: AsyncRequestHandler): Service<any> {

        switch (adapter) {

            case Name.BinarySwitch:
                return new BinarySwitch(handler);
            case Name.DimmableSwitch:
                return new DimmableSwitch(handler);
        }
    }
}