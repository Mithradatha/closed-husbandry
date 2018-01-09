import { ReadResponse } from "communication/response/interface/ReadResponse";

export class AnalogReadResponse extends ReadResponse {

    public constructor(value: number) {

        if (value > -1 && value < 1024) {
            super(value);
        } else {
            throw new RangeError('value: out of range [0, 1023]');
        }
    }
}