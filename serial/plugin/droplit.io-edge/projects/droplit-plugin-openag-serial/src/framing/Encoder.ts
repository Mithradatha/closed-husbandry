
export default abstract class Encoder<E, D> {

    public abstract encode(value: E): D | Promise<D>;
    public abstract decode(value: D): E | Promise<E>;
}