import ReadRequest from './ReadRequest';

export default class DigitalReadRequest extends ReadRequest {

    private static readonly ID: number = 0x0;

    public constructor(pin: number) {
        super(pin, DigitalReadRequest.ID);
    }
}