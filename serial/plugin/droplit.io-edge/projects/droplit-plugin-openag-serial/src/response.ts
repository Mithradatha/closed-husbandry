import * as Frame from './frame';

export class Response {

    protected readonly _id: Frame.Id;
    protected readonly _value: number;

    constructor(id: Frame.Id, value: number) {

        this._id = id;
        this._value = value;
    }

    public get id(): Frame.Id { return this._id; }
    public get value(): number { return this._value; }
}

export abstract class Factory {

    static AssembleFrom(payload: Buffer): Response {

        const id = payload[0] as Frame.Id;
        const len: number = payload.length;

        switch (len) {

            case 2: // Digital Read
                return new Response(id, payload[1]);
            case 3: // Analog Read
                return new Response(id, (payload[2] << 8) | payload[1]);
            default:
                return new Response(id, undefined);
        }
    }
}
