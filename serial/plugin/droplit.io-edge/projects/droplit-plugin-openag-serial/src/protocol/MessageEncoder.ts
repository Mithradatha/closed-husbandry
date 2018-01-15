import Message from './Message';

export default abstract class MessageEncoder {

    public abstract encode(message: Message): Buffer;
    public abstract decode(data: Buffer): Promise<Message>;
}