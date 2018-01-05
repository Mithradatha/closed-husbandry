import { CobsEncoder } from './CobsEncoder';
import { SerialDeviceOptions } from './SerialDeviceOptions';
import * as SerialPort from 'serialport';
import { AsyncQueue, queue, AsyncResultCallback } from 'async';
import { clearTimeout, clearInterval } from 'timers';
import { FletcherChecksum } from './FletcherChecksum';
import { MessageBroker } from './MessageBroker';
import { Sequence, Delimeter } from './Message';
import { Request } from './Request';
import { Response } from './Response';



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

    private msgBroker: MessageBroker;
    private requestQueue: AsyncQueue<Request>;

    constructor(options: SerialDeviceOptions) {

        this.responseTimeout = (options.responseTimeout)
            ? options.responseTimeout
            : 500; // ms

        this.maxRetries = (options.maxRetries || options.maxRetries == 0)
            ? options.maxRetries
            : 5;

        this.delimiter = (options.delimiter)
            ? options.delimiter
            : [0x0];

        this.msgBroker = new MessageBroker();
        this.devicePath = options.devicePath;

        this.serialPort = new SerialPort(this.devicePath, options);
        this.serialPort.on('open', () => this.onOpen(this.delimiter));

        // 1: only process one request at a time
        this.requestQueue = queue(this.repeatRequest.bind(this), 1);
        this.requestQueue.drain = function () {
            console.log('Finished processing all items');
        }
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

        const payload = this.msgBroker.unwrap(data);
        const bytes = payload.length;

        if (bytes == 2 || bytes == 4) {

            const sequence = payload[0];
            console.log('onData');
            if (this.sequence !== sequence) {
                throw 'Synchronization Fault';
            }

            this.acknowledged[sequence] = true;

            if (bytes == 4) {
                // TODO: Read value and raise event
            }
        }
    }

    private onError(err: any): void {

    }

    private onClose(err?: any): void {

        if (err && err.disconnect == true) {
            // Disconnect Message
        }

        this.connected = false;
    }

    private deliver(msg: Buffer, timeout: number): Promise<any> {

        this.serialPort.write(msg);

        return new Promise((resolve, reject) => {

            const intervalId = setInterval(() => {

                console.log('interval');

                console.log('deliver');
                if (this.acknowledged[this.sequence]) {

                    clearInterval(intervalId);
                    console.log('ACK');
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
    private async repeatRequest(request: Request, callback) {

        // alternating bit sequence
        console.log('repeatRequest');
        this.sequence = (this.sequence === 0x0) ? 0x1 : 0x0;

        const seq = Buffer.from([this.sequence]);
        const payload = Buffer.concat([seq, msg]);
        const frame = this.msgBroker.wrap(msg);

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

            console.log(retry);
        }

        callback(success);
    }

    public send(request: Request): Promise<Response> {

        return new Promise<Response>((resolve, reject) => {

            this.requestQueue.push(request, function (err) {
                console.log('finished processing request');
                if (!err) resolve(new Response)
            });
        });
    }
}