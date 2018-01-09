import { Response } from "communication/response/interface/Response";


export abstract class ReadResponse extends Response {

    private val: number;

    public constructor(value: number) {
        super();
        this.val = value;
    }

    public get value(): number | undefined {
        return this.val;
    }
}