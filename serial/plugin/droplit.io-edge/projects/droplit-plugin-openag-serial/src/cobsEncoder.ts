import { Encoder } from './encoder';

/**
 * https://en.wikipedia.org/wiki/Consistent_Overhead_Byte_Stuffing
 *
 * This encoding is limited to 255 bytes
 *
 * If the frame size needs to be larger,
 * include a modulo operation when packing
 */

export class CobsEncoder implements Encoder<Buffer, Buffer> {

    constructor(private delim: number) { }

    encode(src: Buffer): Buffer {

        const sz: number = src.length;
        const dst = new Buffer(sz + 1);

        let srcx = 0;
        let dstx = 0;
        let delimx = 0;

        const fill = () => {

            dst[dstx++] = srcx - delimx + 1;

            for (let i = delimx; i < srcx; i++) {

                dst[dstx++] = src[i];
            }
        };

        for (; srcx < sz; srcx++) {

            if (src[srcx] === this.delim) {

                fill();
                delimx = srcx + 1;
            }
        }

        if (srcx !== delimx) {

            fill();
        }

        return dst;
    }

    decode(src: Buffer): Buffer {

        const sz: number = src.length;
        const dst = new Buffer(sz - 1);

        let srcx = 0;
        let dstx = 0;
        let delimx = 0;

        while (srcx < sz) {

            const token: number = src[srcx++];
            delimx = srcx + token - 1;

            for (; srcx < delimx; srcx++) {

                dst[dstx++] = src[srcx];
            }

            if (srcx < sz) {

                dst[dstx++] = this.delim;
            }
        }

        return dst;
    }
}
