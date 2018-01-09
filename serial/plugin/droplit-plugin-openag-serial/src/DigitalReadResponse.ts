import ReadResponse from "./ReadResponse";


export default class DigitalReadResponse extends ReadResponse {

    public constructor(value: number) {

        if (value === 0 || value === 1) {
            super(value);
        } else {
            throw new RangeError('value: out of range [0, 1]');
        }
    }
}