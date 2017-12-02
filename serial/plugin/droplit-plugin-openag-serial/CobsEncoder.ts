/**
 * https://en.wikipedia.org/wiki/Consistent_Overhead_Byte_Stuffing
 * 
 * This encoding is limited to 255 bytes
 *
 * If the packet size needs to be larger,
 * include a modulo operation when packing
 */

export class CobsEncoder {

    private _delim: any;

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


    //======================================
    // Tests
    //======================================

    test_pack_2(): boolean {

        // Arrange
        const msg = new Uint8Array([0x0, 0x1]);

        // Act
        const encoded = this.pack(msg);

        // Assert
        return encoded[0] == 1 && encoded[1] == 2 && encoded[2] == 0x1;
    }

    test_pack_5(): boolean {

        // Arrange
        const msg = new Uint8Array([0x30, 0x33, 0x35, 0x30, 0x34]);

        // Act
        const encoded = this.pack(msg);

        // Assert
        return encoded[0] == 6 && encoded[5] == 0x34;
    }

    test_unpack_2(): boolean {

        // Arrange
        const encoded = new Uint8Array([1, 2, 0x1]);

        // Act
        const decoded = this.unpack(encoded);

        // Assert
        return decoded[0] == 0x0 && decoded[1] == 0x1;
    }

    test_unpack_5(): boolean {

        // Arrange
        const msg = new Uint8Array([6, 0x30, 0x33, 0x35, 0x30, 0x34]);

        // Act
        const decoded = this.unpack(msg);

        // Assert
        return decoded[0] == 0x30 && decoded[4] == 0x34;
    }
}
