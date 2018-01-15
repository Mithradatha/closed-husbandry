import { Sequence } from '../UtilTypes';
import Message from './Message';

export default class SerialMessage extends Message {

    private _sequence: Sequence;

    public constructor(msg: Buffer, sequence: Sequence) {
        super(msg);

        console.log(msg);

        this._sequence = sequence;
        this.prepend(this._sequence);
    }

    public static FromExisting(data: Buffer): SerialMessage {

        const sequence = data[0] as Sequence;
        return new SerialMessage(data.slice(1), sequence);
    }

    public get sequence(): Sequence {
        return this._sequence;
    }
}
