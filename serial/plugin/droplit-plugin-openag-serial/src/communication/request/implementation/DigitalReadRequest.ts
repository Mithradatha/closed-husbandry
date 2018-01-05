import { ReadRequest } from "communication/request/interface/ReadRequest";

export class DigitalReadRequest extends ReadRequest {

    private static readonly ID: number = 0x0;

    public constructor(pin: number) {
        super(pin, DigitalReadRequest.ID);
    }
}