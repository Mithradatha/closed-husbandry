import { Response } from "./Response";

export class AnalogReadResponse extends Response {

    public value: number;

    constructor(buffer: Buffer) {
        super(buffer);

        const value: number = buffer[1];

        if (value > -1 && value < 1024) {
            this.value = value;
        } else {
            throw new RangeError('value: out of range [0, 1023]');
        }
    }
}