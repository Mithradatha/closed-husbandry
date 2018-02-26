import Pin from '../pins/Pin';
import ServiceClass from './ServiceClass';
import AnalogReadRequest from '../requests/AnalogReadRequest';
import AnalogReadResponse from '../responses/AnalogReadResponse';
import Response from '../responses/Response';
import AsyncRequestHandler from '../devices/AsyncRequestHandler';
import { ArduinoConverter } from '../util/ArduinoConverter';
import AnalogWriteRequest from '../requests/AnalogWriteRequest';

export default class DimmableSwitch extends ServiceClass<number> {

    public constructor(handler: AsyncRequestHandler) {
        super(handler);
    }

    public getValue(pin: Pin): Promise<number> {

        const req = new AnalogReadRequest(pin.index);

        return new Promise<number>((resolve, reject) => {

            this.handler.send(req)
                .then((res: Response) => {

                    const val = (res as AnalogReadResponse).value;
                    const _brightness = this.bit10ToPerc(val);

                    this.setCachedValue(pin, _brightness);
                    resolve(_brightness);

                })
                .catch((err: any) => reject(err));
        });
    }

    public setValue(pin: Pin, _brightness: number): Promise<number> {

        const previousValue = this.getCachedValue(pin);
        const newValue = this.percToByte(_brightness);
        const req = new AnalogWriteRequest(pin.index, newValue);

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

        const value = pin.getState(0, 100);
        return value;
    }

    protected setCachedValue(pin: Pin, _brightness: number) {

        pin.setState(_brightness, 0, 100);
    }

    private bit10ToPerc(value: number): number {
        return ArduinoConverter.fromAnalog10(value, 0, 100);
    }

    private percToByte(value: number): number {
        return ArduinoConverter.toAnalog8(value, 0, 100);
    }
}
