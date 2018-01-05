import { Request } from "./Request";

export abstract class ReadRequest extends Request {

    public constructor(pin: number, fnc: number) {
        super(pin, fnc);
    }

    public toBuffer(): Buffer {

        return Buffer.from(
            [
                this.pin,
                this.fnc
            ]);
    }
}