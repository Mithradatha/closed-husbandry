import { Response } from "communication/response/interface/Response";


export class WriteResponse extends Response {

    public constructor() {
        super();
    }

    public get value(): number | undefined {
        return undefined;
    }
}