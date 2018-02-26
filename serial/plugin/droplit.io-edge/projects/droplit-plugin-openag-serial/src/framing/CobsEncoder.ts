import { Delimeter } from '../util/Types';
import Encoder from './Encoder';

/**
 * https://en.wikipedia.org/wiki/Consistent_Overhead_Byte_Stuffing
 *
 * This encoding is limited to 255 bytes
 *
 * If the frame size needs to be larger,
 * include a modulo operation when packing
 */

export default class CobsEncoder extends Encoder<Buffer, Buffer> {

    private _delim: Delimeter;

    constructor(delim: Delimeter) {

        super();
        this._delim = delim;
    }

    public encode(src: Buffer): Buffer {
        return this.pack(src);
    }

    public decode(src: Buffer): Buffer {
        return this.unpack(src);
    }

    pack(src: Buffer): Buffer {

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

            if (src[srcx] === this._delim) {

                fill();
                delimx = srcx + 1;
            }
        }

        if (srcx !== delimx) {

            fill();
        }

        return dst;
    }

    unpack(src: Buffer): Buffer {

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

                dst[dstx++] = this._delim;
            }
        }

        return dst;
    }
}
