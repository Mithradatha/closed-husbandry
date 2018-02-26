import ReadResponse from './ReadResponse';
import log from '../util/Logger';

export default class AnalogReadResponse extends ReadResponse {

    public constructor(value: number) {

        log(`Analog Value: ${value}`);

        if (value > -1 && value < 1024) {
            super(value);
        } else {
            throw new RangeError('value out of range [0, 1023]');
        }
    }
}