import { Response } from "./Response";


export class AnalogWriteResponse extends Response {

    constructor(buffer: Buffer) {
        super(buffer);
    }
}