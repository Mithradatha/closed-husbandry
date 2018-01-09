import * as SerialPort from "serialport";
import { AsyncQueue, queue, AsyncResultCallback } from 'async';
import { clearTimeout, clearInterval } from 'timers';
import { Sequence, Delimeter } from "./UtilTypes";
import SerialMessageEncoder from "./src/SerialMessageEncoder";
import SerialDeviceOptions from "./SerialDeviceOptions";
import SerialMessage from "./src/SerialMessage";
import * as SerialResponseFactory from './src/SerialResponseFactory';
import Request from "./src/Request";
import Response from "./src/Response";

export default class SerialDevice {

    // ms between acknowledgement checks
    private readonly ackInterval: number = 50;

    private responseTimeout: number;
    private maxRetries: number;

    private acknowledged: boolean[] = [false, false];
    private latestResponse?: Response;
    private sequence: Sequence = 0x0;

    private deviceConnected: boolean = false;
    private devicePath: string;

    private serialPort: SerialPort;
    private delimiter: Delimeter;

    private encoder: SerialMessageEncoder;
    private requestQueue: AsyncQueue<Request>;

    constructor(options: SerialDeviceOptions) {

        this.devicePath = options.devicePath;

        this.delimiter = (options.delimiter)
            ? options.delimiter
            : 0x0;

        this.maxRetries = (options.maxRetries || options.maxRetries == 0)
            ? options.maxRetries
            : 5;

        this.responseTimeout = (options.responseTimeout)
            ? options.responseTimeout
            : 5000; // ms

        this.serialPort = new SerialPort(this.devicePath, options);
        this.serialPort.on('open', () => this.onOpen(this.delimiter));

        this.encoder = new SerialMessageEncoder(this.delimiter);

        // 1: only process one request at a time
        this.requestQueue = queue(this.repeatRequest.bind(this), 1);
    }

    private onOpen(delim: Delimeter): void {

        const parser = this.serialPort.pipe(
            new SerialPort.parsers.Delimiter({ delimiter: [delim] }));

        parser.on('data', (data: Buffer) => this.onData(data));

        this.serialPort.on('error', (err: any) => this.onError(err));
        this.serialPort.on('close', (err?: any) => this.onClose(err));

        this.deviceConnected = true;
        console.log('Serial Device Connected');
    }

    private onData(data: Buffer): void {

        console.log('Serial Message Received');
        this.encoder.decode(data)
            .then((message: SerialMessage) => {
                this.latestResponse = SerialResponseFactory.assembleFrom(message);
                console.log(`This: ${this.sequence} vs. That: ${message.sequence}`);
                console.log(`Response Value: ${this.latestResponse.value}`);
                this.acknowledged[message.sequence] = true;
            }).catch((reason: any) => {
                console.log('Message Could Not Be Decoded');
            });
    }

    public send(request: Request): Promise<Response> {

        console.log('Client Sent Request');
        return new Promise<Response>((resolve, reject) => {

            if (this.deviceConnected) {

                console.log('Queueing Client\'s Request');
                this.requestQueue.push(request, (err?: Error, result?: Response) => {
                    if (err) {
                        console.log('err in send');
                        reject(err);
                    }
                    else {
                        console.log('Client Request Resolved');
                        resolve(result);
                    }
                });

            } else {
                reject('device not connected');
            }
        });
    }

    private deliver(msg: Buffer, timeout: number): Promise<Response> {

        console.log('Delivering Message');
        console.log(msg);
        this.serialPort.write(msg);

        return new Promise((resolve, reject) => {

            const intervalId = setInterval(() => {

                if (this.acknowledged[this.sequence]) {

                    console.log('Message Acknowledged');
                    this.acknowledged[this.sequence] = false;
                    clearInterval(intervalId);
                    const response = this.latestResponse;
                    this.latestResponse = undefined;
                    resolve(response);
                }

            }, this.ackInterval);

            setTimeout(() => {

                clearInterval(intervalId);
                reject('timed out');

            }, timeout);
        });
    }

    /** 
     * stop and wait implementation of automatic repeat request
     */
    private async repeatRequest(request: Request, callback: (err?: Error, result?: Response) => void) {

        console.log('Repeat Request Worker');
        const message = new SerialMessage(request.toBuffer(), this.sequence);
        const encoded: Buffer = this.encoder.encode(message);
        console.log(encoded);

        let timeout = this.responseTimeout;
        let error: Error | undefined;
        let response: Response | undefined;

        for (let retry = 0; retry <= this.maxRetries; retry++) {

            console.log(`Delivery Retry #${retry}`);

            try {

                response = await this.deliver(encoded, timeout);
                console.log('Response Received');
                error = undefined;
                break;

            } catch (err) {
                error = err;
                console.log('Response Not Received');
                // timeout *= 2;
            }
        }

        // alternating bit sequence
        this.sequence = (this.sequence === 0x0) ? 0x1 : 0x0;
        callback(error, response);
    }

    private onError(err: any): void {

        console.log(`OnError: ${err}`);
    }

    private onClose(err?: any): void {

        console.log(`OnClose: ${err}`);

        if (err && err.disconnect == true) {
            // Disconnect Message
        }

        this.deviceConnected = false;
    }
}