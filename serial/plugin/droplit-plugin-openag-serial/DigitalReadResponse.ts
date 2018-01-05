import { Response } from "./Response";

export class DigitalReadResponse extends Response {

    public value: number;

    constructor(buffer: Buffer) {
        super(buffer);

        const value: number = buffer[1];

        if (value === 0 || value === 1) {
            this.value = value;
        } else {
            throw new RangeError('value: out of range [0, 1]');
        }
    }
}