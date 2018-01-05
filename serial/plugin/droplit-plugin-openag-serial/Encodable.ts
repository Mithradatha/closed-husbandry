
export interface Encodable {

    encode(data: Buffer): Buffer;
    decode(data: Buffer): Buffer;
}