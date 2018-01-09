import { ReadResponse } from "communication/response/interface/ReadResponse";


export class DigitalReadResponse extends ReadResponse {

    public constructor(value: number) {

        if (value === 0 || value === 1) {
            super(value);
        } else {
            throw new RangeError('value: out of range [0, 1]');
        }
    }
}