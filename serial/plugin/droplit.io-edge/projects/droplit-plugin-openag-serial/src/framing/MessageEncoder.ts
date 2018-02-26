import Message from './Message';
import Encoder from './Encoder';

export default
    abstract class MessageEncoder extends Encoder<Message, Buffer> {

    public abstract encode(message: Message): Buffer | Promise<Buffer>;
    public abstract decode(data: Buffer): Message | Promise<Message>;
}