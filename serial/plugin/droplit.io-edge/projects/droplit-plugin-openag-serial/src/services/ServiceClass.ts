import Pin from '../pins/Pin';
import AsyncRequestHandler from '../devices/AsyncRequestHandler';

export default abstract class ServiceClass<T> {

    public constructor(protected handler: AsyncRequestHandler) { }

    public abstract getValue(pin: Pin): Promise<T>;

    public abstract setValue(pin: Pin, value: T): Promise<T>;

    protected abstract getCachedValue(pin: Pin): T;

    protected abstract setCachedValue(pin: Pin, value: T): void;
}