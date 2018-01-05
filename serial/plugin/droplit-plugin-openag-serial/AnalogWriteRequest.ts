import { Sequence } from './Message';
import { Request } from './Request';

export class AnalogWriteRequest extends Request {

    static readonly ID: number = 0x3;

    value: number;

    constructor(sequence: Sequence, pin: number, value: number) {

        super(sequence, pin);

        if (value > -1 && value < 256) {
            this.value = value;
        } else {
            throw new RangeError('value: out of range [0, 255]');
        }
    }

    public toBuffer(): Buffer {

        return Buffer.from(
            [
                this.sequence,
                this.pin,
                AnalogWriteRequest.ID,
                this.value
            ]);
    }
}