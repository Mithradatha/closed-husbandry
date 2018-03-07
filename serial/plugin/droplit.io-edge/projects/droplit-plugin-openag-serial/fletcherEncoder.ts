import { Encoder } from './encoder';

/**
 * https://en.wikipedia.org/wiki/Fletcher%27s_checksum
 *
 * 8-bit implementation (16-bit checksum)
 *
 * This implementation was not written with optimization
 * in mind. There are ways to optimize this code if needed
*/

export class FletcherEncoder implements Encoder<Buffer, Buffer> {

    public checksum(data: Buffer): { sum0: number, sum1: number } {

        let sum0 = 0;
        let sum1 = 0;

        data.forEach(byte => {

            sum0 = (sum0 + byte) % 0xFF;
            sum1 = (sum1 + sum0) % 0xFF;
        });

        return { sum0, sum1 };
    }

    encode(data: Buffer): Buffer {

        const { sum0, sum1 } = this.checksum(data);

        const chk0 = 0xFF - ((sum0 + sum1) % 0xFF);
        const chk1 = 0xFF - ((sum0 + chk0) % 0xFF);

        const fletcher = Buffer.from([chk0, chk1]);
        return Buffer.concat([data, fletcher], data.length + 2);
    }

    decode(data: Buffer): Promise<Buffer> {

        return new Promise<Buffer>((resolve, reject) => {

            const { sum0, sum1 } = this.checksum(data);

            if (sum0 || sum1) reject('checksum must evaluate to 0x00');

            resolve(data.slice(0, data.length - 2));
        });
    }
}
