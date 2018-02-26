import Response from './Response';
import SerialMessage from '../framing/SerialMessage';
import DigitalReadResponse from './DigitalReadResponse';
import WriteResponse from './WriteResponse';
import AnalogReadResponse from './AnalogReadResponse';
import log from '../util/Logger';

export default abstract class SerialResponseFactory {

    public static AssembleFrom(message: SerialMessage): Response {

        const buf: Buffer = message.buffer;
        const len: number = buf.length;

        switch (len) {

            case 2:
                log('DigitalReadResponse');
                return new DigitalReadResponse(buf[1]);
            case 3:
                log('AnalogReadResponse');
                return new AnalogReadResponse((buf[2] << 8) | buf[1]);
            default:
                log('DefaultWriteResponse');
                return new WriteResponse();
        }
    }
}
