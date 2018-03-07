import { Request } from './request';
import { Response, Factory as ResponseFactory } from './response';
import { FletcherEncoder } from './fletcherEncoder';
import { CobsEncoder } from './cobsEncoder';

export type Sequence = 0x0 | 0x1;

export enum Id {

    DigitalRead = 0x0,
    DigitalWrite = 0x1,
    AnalogRead = 0x2,
    AnalogWrite = 0x3,
    PinDirection = 0x4,
    Acknowledgement = 0x6
}

export class Builder {

    private cobs: CobsEncoder;
    private fletcher: FletcherEncoder;

    constructor(private delimiter: number) {

        this.cobs = new CobsEncoder(delimiter);
        this.fletcher = new FletcherEncoder();
    }

    construct(request: Request, sequence: Sequence): Buffer {

        const payload: Buffer = request.buffer;
        const message = Buffer.from([sequence, payload]);

        const fletcherEncoded = this.fletcher.encode(message);
        const cobsEncoded = this.cobs.encode(fletcherEncoded);

        return Buffer.from([cobsEncoded, this.delimiter]);
    }

    destruct(buffer: Buffer, sequence: Sequence): Promise<Response> {

        return new Promise<Response>((resolve, reject) => {

            const cobsDecoded: Buffer = this.cobs.decode(buffer);

            this.fletcher.decode(cobsDecoded)
                .then(message => {

                    const seq = message[0] as Sequence;
                    const pay: Buffer = message.slice(1);

                    return { seq, pay };
                })
                .then(decoded => {

                    if (decoded.seq !== sequence)
                        reject('unexpected sequence number');

                    resolve(ResponseFactory.AssembleFrom(decoded.pay));
                })
                .catch(error => reject(error));
        });
    }
}
