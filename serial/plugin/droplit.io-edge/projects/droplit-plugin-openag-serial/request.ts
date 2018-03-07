import { INPUT, OUTPUT, LOW, HIGH } from './type';
import * as Frame from './frame';

export abstract class Request {

    protected abstract readonly _id: Frame.Id;
    protected abstract readonly _buffer: Buffer;

    public get id(): Frame.Id { return this._id; }
    public get buffer(): Buffer { return this._buffer; }
}

export class Acknowledgement extends Request {

    protected _id = Frame.Id.Acknowledgement;
    protected _buffer = Buffer.from([this.id]);
}

export class PinDirection extends Request {

    protected _id = Frame.Id.PinDirection;

    constructor(
        protected pin: number,
        protected direction: INPUT | OUTPUT
    ) { super(); }

    protected _buffer = Buffer.from(
        [this.id, this.pin, this.direction]
    );
}

export class DigitalRead extends Request {

    protected _id = Frame.Id.DigitalRead;

    constructor(protected pin: number) { super(); }

    protected _buffer = Buffer.from([this.id, this.pin]);
}

export class DigitalWrite extends Request {

    protected _id = Frame.Id.DigitalWrite;

    constructor(
        protected pin: number,
        protected val: LOW | HIGH
    ) { super(); }

    protected _buffer = Buffer.from(
        [this.id, this.pin, this.val]
    );
}

export class AnalogRead extends Request {

    protected _id = Frame.Id.AnalogRead;

    constructor(protected pin: number) { super(); }

    protected _buffer = Buffer.from([this.id, this.pin]);
}

export class AnalogWrite extends Request {

    protected _id = Frame.Id.AnalogWrite;

    constructor(
        protected pin: number,
        protected val: number
    ) { super(); }

    protected _buffer = Buffer.from(
        [this.id, this.pin, this.val]
    );
}
