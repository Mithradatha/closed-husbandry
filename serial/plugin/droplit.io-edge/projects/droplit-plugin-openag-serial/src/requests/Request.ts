
export default abstract class Request {

    protected pin: number;
    protected fnc: number;

    public constructor(pin: number, fnc: number) {

        if (pin > -1 && pin < 256) {
            this.pin = pin;
        } else {
            throw new RangeError('pin: out of range [0, 255]');
        }
    }

    public abstract toBuffer(): Buffer;
}