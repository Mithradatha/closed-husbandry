
export default class Message {

    private _buffer: Buffer;

    public constructor(_buffer: Buffer) {
        this._buffer = _buffer;
    }

    public get buffer(): Buffer {
        return this._buffer;
    }

    public pop(): number {

        const first: number = this._buffer[0];
        this._buffer = this._buffer.slice(1);
        return first;
    }

    public prepend(data: any): number {

        this._buffer = Buffer.from([data, this._buffer]);
        return this._buffer.length;
    }

    public append(data: any): number {

        this._buffer = Buffer.from([this._buffer, data]);
        return this._buffer.length;
    }
}