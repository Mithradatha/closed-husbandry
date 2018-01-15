import * as FletcherChecksum from './FletcherChecksum';
import { Delimeter } from './../UtilTypes';
import SerialMessage from './SerialMessage';
import CobsEncoder from './CobsEncoder';
import MessageEncoder from './MessageEncoder';

export default class SerialMessageEncoder extends MessageEncoder {

    private delimiter: Delimeter;

    private encoder: CobsEncoder;

    public constructor(delimiter: Delimeter) {
        super();

        this.delimiter = delimiter;
        this.encoder = new CobsEncoder(this.delimiter);
    }

    public encode(message: SerialMessage): Buffer {

        console.log(message.sequence);
        let payload: Buffer = message.buffer;
        console.log(payload);
        const sum: Buffer = FletcherChecksum.generate(payload);
        console.log(sum);
        payload = FletcherChecksum.append(payload, sum);
        console.log(payload);

        const encoded: Buffer = this.encoder.pack(payload);
        console.log(encoded);
        return Buffer.concat([encoded, Buffer.from([this.delimiter])]);
    }

    public decode(data: Buffer): Promise<SerialMessage> {

        return new Promise((resolve, reject) => {

            const decoded: Buffer = this.encoder.unpack(data);

            if (FletcherChecksum.valid(decoded)) {

                const payload: Buffer = FletcherChecksum.strip(decoded);
                resolve(SerialMessage.FromExisting(payload));

            } else {
                reject('checksum: invalid');
            }
        });
    }
}