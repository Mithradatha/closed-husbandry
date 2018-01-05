import { FletcherChecksum } from "./FletcherChecksum";
import { CobsEncoder } from "./CobsEncoder";

export class MessageBroker {

    private encoder: CobsEncoder;

    constructor() {

    }

    public wrap(msg: Buffer, append?: Buffer): Buffer {

        console.log('wrap');


        const sum = FletcherChecksum.generate(payload);
        const data = FletcherChecksum.append(payload, sum);
        const encoded = this.encoder.pack(data);

        const delim = Buffer.from([this.delimiter])
        const frame = Buffer.concat([new Buffer(encoded), delim]);

        return frame;
    }

    public unwrap(data: Buffer): Buffer {

        // TODO: unwrap should remove sequence

        const decoded = this.encoder.unpack(data);

        if (FletcherChecksum.valid(decoded)) {

            const payload = FletcherChecksum.strip(decoded);
            return Buffer.from(payload.buffer);
        }

        return Buffer.from([]);
    }
}