import Response from './Response';
import SerialMessage from '../protocol/SerialMessage';
import DigitalReadResponse from './DigitalReadResponse';
import WriteResponse from './WriteResponse';
import AnalogReadResponse from './AnalogReadResponse';

export function assembleFrom(message: SerialMessage): Response {

    const buf: Buffer = message.buffer;
    const len: number = buf.length;

    switch (len) {

        case 2:
            return new DigitalReadResponse(buf[1]);
        case 3:
            return new AnalogReadResponse((buf[1] << 8) | buf[2]);
        default:
            return new WriteResponse();
    }
}