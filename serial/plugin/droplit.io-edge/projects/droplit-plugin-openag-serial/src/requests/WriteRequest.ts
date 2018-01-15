import Request from './Request';

export default abstract class WriteRequest extends Request {

    protected val: number;

    public constructor(pin: number, fnc: number, val: number) {
        super(pin, fnc);

        this.val = val;
    }

    public toBuffer(): Buffer {

        return Buffer.from(
            [
                this.pin,
                this.fnc,
                this.val
            ]);
    }
}