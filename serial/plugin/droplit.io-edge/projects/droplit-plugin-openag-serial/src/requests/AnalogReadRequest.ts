import ReadRequest from './ReadRequest';

export default class AnalogReadRequest extends ReadRequest {

    private static readonly ID: number = 0x2;

    public constructor(pin: number) {
        super(pin, AnalogReadRequest.ID);
    }
}