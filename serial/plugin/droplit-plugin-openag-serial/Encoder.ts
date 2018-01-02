
export interface Encoder {

    encode(buffer: Buffer): Buffer;
    decode(buffer: Buffer): Buffer;
}