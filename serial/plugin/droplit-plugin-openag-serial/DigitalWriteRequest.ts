import { Sequence } from './Message';
import { Request } from './Request';

export class DigitalWriteRequest extends Request {

    static readonly ID: number = 0x1;

    value: number;

    constructor(sequence: Sequence, pin: number, value: number) {

        super(sequence, pin);

        if (value === 0 || value === 1) {
            this.value = value;
        } else {
            throw new RangeError('value: out of range [0, 1]');
        }
    }

    public toBuffer(): Buffer {

        return Buffer.from(
            [
                this.sequence,
                this.pin,
                DigitalWriteRequest.ID,
                this.value
            ]);
    }
}