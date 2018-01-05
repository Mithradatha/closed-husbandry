import { SerialDevice } from './SerialDevice';
import { Sequence } from './Message';
import { Response } from './Response';

export abstract class Request {

    protected sequence: Sequence;
    protected pin: number;

    public constructor(sequence: Sequence, pin: number) {

        this.sequence = sequence;

        if (pin > -1 && pin < 256) {
            this.pin = pin;
        } else {
            throw new RangeError('pin: out of range [0, 255]');
        }
    }

    protected abstract toBuffer(): Buffer;

    public send(device: SerialDevice): Promise<Response> {


    }
}