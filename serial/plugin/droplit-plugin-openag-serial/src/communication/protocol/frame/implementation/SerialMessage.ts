
import { Request } from "communication/request/interface/Request";
import { Response } from "communication/response/interface/Response";
import { Message } from "communication/protocol/frame/interface/Message";
import { Sequence } from "UtilTypes";

export class SerialMessage extends Message {

    private _sequence: Sequence;

    public constructor(msg: Buffer, sequence: Sequence) {
        super(msg);

        this._sequence = sequence;
        this.prepend(this._sequence);
    }

    public static FromExisting(data: Buffer): SerialMessage {

        const sequence = data[0] as Sequence;
        return new SerialMessage(data.slice(1), sequence);
    }

    public static FromRequest(request: Request, sequence: Sequence): SerialMessage {
        return new SerialMessage(request.toBuffer(), sequence);
    }

    public toResponse(success: boolean): Response {
        return { success: success, value: this.buffer[1] };
    }

    public get sequence(): Sequence {
        return this._sequence;
    }
}
