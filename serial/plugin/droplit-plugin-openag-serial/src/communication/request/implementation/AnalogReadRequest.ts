import { ReadRequest } from "communication/request/interface/ReadRequest";

export class AnalogReadRequest extends ReadRequest {

    private static readonly ID: number = 0x2;

    public constructor(pin: number) {
        super(pin, AnalogReadRequest.ID);
    }
}