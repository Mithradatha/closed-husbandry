
export class CobsEncoder {

    _delim: any;

    constructor(delim: any) {

        this._delim = delim;
    }

    pack(src: Uint8Array): Uint8Array {

        const sz: number = src.length;
        const dst = new Uint8Array(sz + 1);

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

    unpack(src: Uint8Array): Uint8Array {

        const sz: number = src.length;
        const dst = new Uint8Array(sz - 1);

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
