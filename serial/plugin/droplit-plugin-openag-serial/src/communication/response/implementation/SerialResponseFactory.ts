import Response from 'communication/response/interface/Response';
import SerialMessage from 'communication/protocol/frame/implementation/SerialMessage';
import DigitalReadResponse from 'communication/response/implementation/DigitalReadResponse';
import WriteResponse from 'communication/response/implementation/WriteResponse';
import AnalogReadResponse from 'communication/response/implementation/AnalogReadResponse';


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