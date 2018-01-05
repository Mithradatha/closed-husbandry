/**
 * https://en.wikipedia.org/wiki/Fletcher%27s_checksum
 * 
 * 8-bit implementation (16-bit checksum)
 * 
 * This implementation was not written with optimization
 * in mind. There are ways to optimize this code if needed
*/

export namespace FletcherChecksum {

    export function generate(src: Buffer): Buffer {

        let sum0: number = 0;
        let sum1: number = 0;

        src.forEach(elem => {
            sum0 = (sum0 + elem) % 255;
            sum1 = (sum1 + sum0) % 255;
        });

        return new Buffer([sum1, sum0]);
    }

    export function append(src: Buffer, sum: Buffer): Buffer {

        const sum0: number = sum[1];
        const sum1: number = sum[0];

        const chk0: number = 255 - ((sum0 + sum1) % 255);
        const chk1: number = 255 - ((sum0 + chk0) % 255);

        const len = src.length;
        let res = new Buffer(len + 2);
        for (let i = 0; i < len; i++) {
            res[i] = src[i];
        }

        res[len] = chk0;
        res[len + 1] = chk1;

        return res;
    }

    export function strip(src: Buffer): Buffer {

        return src.slice(0, src.length - 2);
    }

    export function valid(src: Buffer) {

        const sum: Buffer = generate(src);
        return sum[0] === 0 && sum[1] === 0;
    }
}