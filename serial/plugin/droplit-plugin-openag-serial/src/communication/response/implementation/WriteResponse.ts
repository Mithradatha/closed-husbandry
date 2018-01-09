import Response from "communication/response/interface/Response";

export default class WriteResponse extends Response {

    public constructor() {
        super();
    }

    public get value(): number | undefined {
        return undefined;
    }
}