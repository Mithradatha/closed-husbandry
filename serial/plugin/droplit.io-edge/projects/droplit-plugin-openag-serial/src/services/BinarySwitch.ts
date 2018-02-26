import ServiceClass from './ServiceClass';
import Pin from '../pins/Pin';
import DigitalReadRequest from '../requests/DigitalReadRequest';
import DigitalReadResponse from '../responses/DigitalReadResponse';
import Response from '../responses/Response';
import DigitalWriteRequest from '../requests/DigitalWriteRequest';
import AsyncRequestHandler from '../devices/AsyncRequestHandler';

export default class BinarySwitch extends ServiceClass<string> {

    public constructor(handler: AsyncRequestHandler) {
        super(handler);
    }

    public getValue(pin: Pin): Promise<string> {

        const req = new DigitalReadRequest(pin.index);

        return new Promise<string>((resolve, reject) => {

            this.handler.send(req)
                .then((res: Response) => {

                    const newValue = (res as DigitalReadResponse).value;
                    const _switch = this.digitalToString(newValue);

                    this.setCachedValue(pin, _switch);
                    resolve(_switch);
                })
                .catch((err: any) => reject(err));
        });
    }

    public setValue(pin: Pin, _switch: string): Promise<string> {

        const previousValue = this.getCachedValue(pin);
        const newValue = this.stringToDigital(_switch);

        const req = new DigitalWriteRequest(pin.index, newValue);

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

        const value = pin.getState(0, 1);
        return this.digitalToString(value);
    }

    protected setCachedValue(pin: Pin, _switch: string) {

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
