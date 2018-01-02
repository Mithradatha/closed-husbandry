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

        return Buffer.from(src.slice(0, src.length - 2));
    }

    export function valid(src: Buffer) {

        const sum: Buffer = generate(src);
        return sum[0] == 0 && sum[1] == 0;
    }


    //======================================
    // Tests
    //====================================== 

    export function test_generate_2(): boolean {

        // Arrange
        const msg = new Buffer([0x01, 0x02]);

        // Act
        const sum: Buffer = generate(msg);

        // Assert
        const pass: boolean = sum[0] == 0x04 && sum[1] == 0x03;

        return pass;
    }

    export function test_generate_5(): boolean {

        // Arrange ("abcde")
        const msg = new Buffer([97, 98, 99, 100, 101]);

        // Act
        const sum: Buffer = generate(msg);

        // Assert
        const pass: boolean = sum[0] == 0xC8 && sum[1] == 0xF0;

        return pass;
    }

    export function test_generate_6(): boolean {

        // Arrange ("abcdef")
        const msg = new Buffer([97, 98, 99, 100, 101, 102]);

        // Act
        const sum: Buffer = generate(msg);

        // Assert
        const pass: boolean = sum[0] == 0x20 && sum[1] == 0x57;

        return pass;
    }

    export function test_generate_8(): boolean {

        // Arrange ("abcdefgh")
        const msg = new Buffer([97, 98, 99, 100, 101, 102, 103, 104]);

        // Act
        const sum: Buffer = generate(msg);

        // Assert
        const pass: boolean = sum[0] == 0x06 && sum[1] == 0x27;

        return pass;
    }

    export function test_append_2(): boolean {

        // Arrange ("abcdefgh")
        const sum = new Buffer([0x04, 0x03]);
        const msg = new Buffer([0x01, 0x02]);

        // Act
        const data: Buffer = append(msg, sum);

        // Assert
        const pass: boolean = data[2] == 0xF8 && data[3] == 0x04;

        return pass;
    }

    export function test_strip_2(): boolean {

        // Arrange
        const data = new Buffer([0x01, 0x02, 0xF8, 0x04]);

        // Act
        const msg: Buffer = strip(data);

        // Assert
        return msg.length == 2 && msg[0] == 0x01 && msg[1] == 0x02;
    }

    export function test_valid_2(): boolean {

        // Arrange
        const msg = new Buffer([0x01, 0x02, 0xF8, 0x04]);

        // Act
        const isValid: boolean = valid(msg);

        // Assert
        return isValid;
    }
}