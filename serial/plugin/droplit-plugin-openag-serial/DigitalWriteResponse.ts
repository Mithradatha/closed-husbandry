import { Response } from "./Response";


export class DigitalWriteResponse extends Response {

    constructor(buffer: Buffer) {
        super(buffer);
    }
}