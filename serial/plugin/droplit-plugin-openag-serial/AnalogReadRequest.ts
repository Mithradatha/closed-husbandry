import { Sequence } from './Message';
import { Request } from './Request';

export class AnalogReadRequest extends Request {

    static readonly ID: number = 0x2;

    constructor(sequence: Sequence, pin: number) {
        super(sequence, pin);
    }

    public toBuffer(): Buffer {

        return Buffer.from(
            [
                this.sequence,
                this.pin,
                AnalogReadRequest.ID
            ]);
    }
}