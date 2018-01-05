import { WriteRequest } from "communication/request/interface/WriteRequest";

export class AnalogWriteRequest extends WriteRequest {

    private static readonly ID: number = 0x3;

    public constructor(pin: number, val: number) {

        if (val > -1 && val < 256) {
            super(pin, AnalogWriteRequest.ID, val);
        } else {
            throw new RangeError('val: out of range [0, 255]');
        }
    }
}