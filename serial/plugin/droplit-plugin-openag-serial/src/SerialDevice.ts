import { Response } from 'communication/response/interface/Response';
import { SerialDeviceOptions } from './SerialDeviceOptions';
import { Sequence, Delimeter } from "UtilTypes";
import * as SerialPort from "serialport";
import { AsyncQueue, queue, AsyncResultCallback } from 'async';
import { clearTimeout, clearInterval } from 'timers';
import { SerialMessageEncoder } from 'communication/protocol/frame/implementation/SerialMessageEncoder';
import { SerialMessage } from 'communication/protocol/frame/implementation/SerialMessage';
import { Request } from 'communication/request/interface/Request';

export class SerialDevice {

    // ms between acknowledgement checks
    private readonly ackInterval: number = 50;

    private responseTimeout: number;
    private maxRetries: number;

    private acknowledged: boolean[] = [false, false];
    private sequence: Sequence = 0x0;

    private connected: boolean = false;
    private devicePath: string;

    private serialPort: SerialPort;
    private delimiter: Delimeter;

    private encoder: SerialMessageEncoder;
    private requestQueue: AsyncQueue<Request>;

    constructor(options: SerialDeviceOptions) {

        this.devicePath = options.devicePath;

        this.delimiter = (options.delimiter)
            ? options.delimiter
            : [0x0];

        this.maxRetries = (options.maxRetries || options.maxRetries == 0)
            ? options.maxRetries
            : 5;

        this.responseTimeout = (options.responseTimeout)
            ? options.responseTimeout
            : 500; // ms

        this.serialPort = new SerialPort(this.devicePath, options);
        this.serialPort.on('open', () => this.onOpen(this.delimiter));

        this.encoder = new SerialMessageEncoder(this.delimiter);

        // 1: only process one request at a time
        this.requestQueue = queue(this.repeatRequest.bind(this), 1);
    }

    private onOpen(delim: Delimeter): void {

        const parser = this.serialPort.pipe(
            new SerialPort.parsers.Delimiter({ delimiter: delim }));

        parser.on('data', (data: Buffer) => this.onData(data));

        this.serialPort.on('error', (err: any) => this.onError(err));
        this.serialPort.on('close', (err?: any) => this.onClose(err));

        this.connected = true;
    }

    private onData(data: Buffer): void {

        const message: SerialMessage = this.encoder.decode(data);
        this.acknowledged[message.sequence] = true;
    }

    public send(request: Request): Promise<Response> {

        return new Promise<Response>((resolve, reject) => {

            this.requestQueue.push(request, (err?: Error, result?: Response) => {
                if (err) reject(err);
                else resolve(result);
            });
        });
    }

    private deliver(msg: Buffer, timeout: number): Promise<number> {

        this.serialPort.write(msg);

        return new Promise((resolve, reject) => {

            const intervalId = setInterval(() => {

                if (this.acknowledged[this.sequence]) {

                    clearInterval(intervalId);
                    resolve('acknowledgement received');
                }

            }, this.ackInterval);

            setTimeout(() => {

                clearInterval(intervalId);
                console.log('NACK');
                reject('timed out');

            }, timeout);
        });
    }

    /** 
     * stop and wait implementation of automatic repeat request
     */
    private async repeatRequest(request: Request, callback: (err?: Error, result?: Response) => void) {

        // alternating bit sequence
        this.sequence = (this.sequence === 0x0) ? 0x1 : 0x0;

        const message = SerialMessage.FromRequest(request, this.sequence);
        const encoded: Buffer = this.encoder.encode(message);

        let timeout = this.responseTimeout;
        let success: boolean = false;

        for (let retry = 0; retry <= this.maxRetries; retry++) {

            try {

                let val = await this.deliver(frame, timeout);
                console.log(val);
                success = true;
                break;

            } catch (err) {
                console.log(err);
                // timeout *= 2;
            }
        }

        callback(undefined, { success: success, value: };
    }

    private onError(err: any): void {

    }

    private onClose(err?: any): void {

        if (err && err.disconnect == true) {
            // Disconnect Message
        }

        this.connected = false;
    }
}