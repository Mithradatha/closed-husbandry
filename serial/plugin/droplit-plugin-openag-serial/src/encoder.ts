
export interface Encoder<Decoded, Encoded> {

    encode(value: Decoded): Encoded | Promise<Encoded>;
    decode(value: Encoded): Decoded | Promise<Decoded>;
}