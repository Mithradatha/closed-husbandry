
import { SerialMessage } from 'communication/protocol/frame/implementation/SerialMessage';
import { MessageEncoder } from "communication/protocol/frame/interface/MessageEncoder";
import { FletcherChecksum } from 'communication/protocol/FletcherChecksum';
import { CobsEncoder } from "communication/protocol/CobsEncoder";
import { Delimeter } from "UtilTypes";

export class SerialMessageEncoder extends MessageEncoder {

    private delimiter: Delimeter;

    private encoder: CobsEncoder;

    public constructor(delimiter: string | Buffer | number[]) {
        super();

        this.delimiter = delimiter;
        this.encoder = new CobsEncoder(this.delimiter);
    }

    public encode(message: SerialMessage): Buffer {

        let payload: Buffer = message.buffer;
        const sum: Buffer = FletcherChecksum.generate(payload);
        payload = FletcherChecksum.append(payload, sum);

        const encoded: Buffer = this.encoder.pack(payload);
        return Buffer.from([encoded, this.delimiter]);
    }

    public decode(data: Buffer): SerialMessage {

        const decoded: Buffer = this.encoder.unpack(data);

        if (FletcherChecksum.valid(decoded)) {

            let payload: Buffer = FletcherChecksum.strip(decoded);
            return SerialMessage.FromExisting(payload);

        } else {
            throw new Error('checksum: invalid');
        }
    }
}