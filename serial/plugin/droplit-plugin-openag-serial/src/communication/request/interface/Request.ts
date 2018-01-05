
export abstract class Request {

    protected pin: number;
    protected fnc: number;

    public constructor(pin: number, fnc: number) {

        if (pin > -1 && pin < 256) {
            this.pin = pin;
        } else {
            throw new RangeError('pin: out of range [0, 255]');
        }

        if (fnc > -1 && fnc < 4) {
            this.fnc = fnc;
        } else {
            throw new RangeError('fnc: out of range [0, 3]');
        }
    }

    public abstract toBuffer(): Buffer;
}