import { WriteRequest } from "communication/request/interface/WriteRequest";

export class DigitalWriteRequest extends WriteRequest {

    private static readonly ID: number = 0x1;

    public constructor(pin: number, val: number) {

        if (val === 0 || val === 1) {
            super(pin, DigitalWriteRequest.ID, val);
        } else {
            throw new RangeError('val: out of range [0, 1]');
        }
    }
}