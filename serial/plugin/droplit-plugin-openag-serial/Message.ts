
export type Delimeter = string | Buffer | number[];
export type Sequence = 0x0 | 0x1;

export interface Message {

    sequence: Sequence;
    checksum: Buffer;
    delimiter: Delimeter

    toBuffer(): Buffer;
}