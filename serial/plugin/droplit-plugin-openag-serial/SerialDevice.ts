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
import MessageEncoder from "./src/MessageEncoder";

const ACK_INTERVAL: number = 50; // ms between acknowledgement checks

const DEFAULT_DELIMITER: number = 0x0;
const DEFAULT_BAUD_RATE: number = 9600;
const DEFAULT_MAX_RETRIES: number = 3;
const DEFAULT_RES_TIMEOUT: number = 1000; // ms

export default class SerialDevice {

    private options: SerialPort.OpenOptions;

    private devicePath: string;
    private delimiter: number;
    private maxRetries: number;
    private responseTimeout: number;

    private sequence: Sequence;
    private acknowledged: boolean[];

    private serialPort: SerialPort;
    private deviceConnected: boolean;

    private encoder: SerialMessageEncoder;
    private requestQueue: AsyncQueue<Request>;

    private latestResponse?: Response;

    constructor(options: SerialDeviceOptions) {

        options.autoOpen = false;
        options.baudRate = options.baudRate || DEFAULT_BAUD_RATE;
        this.options = options;

        this.devicePath = options.devicePath;
        this.delimiter = options.delimiter || DEFAULT_DELIMITER;
        this.maxRetries = options.maxRetries || DEFAULT_MAX_RETRIES;
        this.responseTimeout = options.responseTimeout || DEFAULT_RES_TIMEOUT;

        this.sequence = 0x0;
        this.acknowledged = [false, false];

        this.deviceConnected = false;
        this.serialPort = new SerialPort(this.devicePath, this.options);
        this.serialPort.on('error', (err?: Error) => this.onError(err));
        this.serialPort.on('close', (err?: Error) => this.onClose(err));

        this.encoder = new SerialMessageEncoder(this.delimiter);

        // 1: only process one request at a time
        this.requestQueue = queue(this.repeatRequest.bind(this), 1);
    }

    public static Discover(): string[] {
        // TODO: Implement
        return ['COM5'];
    }

    public connect(): Promise<string> {

        return new Promise((resolve, reject) => {

            if (this.deviceConnected) resolve(this.devicePath);
            else this.serialPort.open((err?: Error) => {

                if (err) reject(err.message);
                else this.onOpen(resolve);
            });
        });
    }

    public disconnect(): Promise<string> {

        return new Promise((resolve, reject) => {

            if (!this.deviceConnected) resolve(this.devicePath);
            else this.serialPort.close((err?: Error) => {

                if (err) reject(err.message);
                else resolve(this.devicePath);
            });
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

    private onOpen(callback: (value?: string | PromiseLike<string>) => void): void {

        const parser = this.serialPort.pipe(
            new SerialPort.parsers.Delimiter({ delimiter: [this.delimiter] }));

        parser.on('data', (data: Buffer) => this.onData(data));

        this.deviceConnected = true;
        console.log('Serial Device Connected');

        callback(this.devicePath);
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

            }, ACK_INTERVAL);

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

    private onError(err?: Error): void {

        console.log('Error Occured');
    }

    private onClose(err?: Error) {

        console.log('Close Occured');

        this.deviceConnected = false;
    }
}