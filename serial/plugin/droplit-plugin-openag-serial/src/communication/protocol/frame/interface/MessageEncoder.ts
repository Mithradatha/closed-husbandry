import Message from "communication/protocol/frame/interface/Message";

export default abstract class MessageEncoder {

    public abstract encode(message: Message): Buffer;
    public abstract decode(data: Buffer): Message;
}