import WriteRequest from './WriteRequest';

export default class PinDirectionRequest extends WriteRequest {

    private static readonly ID: number = 0x4;

    public constructor(pin: number, val: number) {

        if (val === 0 || val === 1) {
            super(pin, PinDirectionRequest.ID, val);
        } else {
            throw new RangeError('val: out of range [0, 1]');
        }
    }
}