import * as SerialPort from 'serialport';
import { queue } from 'async';
import { clearInterval } from 'timers';
import { Sequence } from './UtilTypes';
import * as SerialResponseFactory from './responses/SerialResponseFactory';
import SerialMessageEncoder from './protocol/SerialMessageEncoder';
import SequenceGuard from './protocol/SequenceGuard';
import SerialDeviceOptions from './SerialDeviceOptions';
import Request from './requests/Request';
import Response from './responses/Response';
import SerialMessage from './protocol/SerialMessage';

const ACK_INTERVAL = 50; // ms between acknowledgement checks

const DEFAULT_DELIMITER = 0x0;
const DEFAULT_BAUD_RATE = 9600;
const DEFAULT_MAX_RETRIES = 3;
const DEFAULT_RES_TIMEOUT = 1000; // ms

export default class SerialDevice {

    private options: SerialPort.OpenOptions;

    private devicePath: string;
    private delimiter: number;
    private maxRetries: number;
    private responseTimeout: number;

    private sequence: Sequence;
    private sequenceGuard: SequenceGuard;
    private encoder: SerialMessageEncoder;
    private requestQueue: any;

    private serialPort: SerialPort;
    private deviceConnected: boolean;

    constructor(options: SerialDeviceOptions) {

        options.autoOpen = false;
        options.baudRate = options.baudRate || DEFAULT_BAUD_RATE;
        this.options = options;

        this.devicePath = options.devicePath;
        this.delimiter = options.delimiter || DEFAULT_DELIMITER;
        this.maxRetries = options.maxRetries || DEFAULT_MAX_RETRIES;
        this.responseTimeout = options.responseTimeout || DEFAULT_RES_TIMEOUT;

        this.sequence = 0x0;
        this.sequenceGuard = new SequenceGuard();
        this.encoder = new SerialMessageEncoder(this.delimiter);

        // 1: only process one Request at a time
        this.requestQueue = queue(this.repeatRequest.bind(this), 1);

        this.deviceConnected = false;
        this.serialPort = new SerialPort(this.devicePath, this.options);
        this.serialPort.on('error', (err?: Error) => this.onError(err));
        this.serialPort.on('close', (err?: Error) => this.onClose(err));
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
        console.log(request.toBuffer());
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

                const res = SerialResponseFactory.assembleFrom(message);
                const seq = message.sequence;

                console.log(`This: ${this.sequence} vs. That: ${seq}`);
                console.log(`Response Value: ${res.value}`);

                this.sequenceGuard.unlock(seq);
                this.sequenceGuard.set(seq, res.value);

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

                if (!this.sequenceGuard.isLocked(this.sequence)) {

                    clearInterval(intervalId);
                    console.log('Message Acknowledged');

                    const res = this.sequenceGuard.get(this.sequence);
                    this.sequenceGuard.set(this.sequence, undefined);
                    this.sequenceGuard.lock(this.sequence);

                    resolve(res);
                }

            }, ACK_INTERVAL);

            setTimeout(() => {

                clearInterval(intervalId);
                reject('timed out');

            }, timeout);
        });
    }

    /**
     * stop and wait implementation of automatic repeat Request
     */
    private async repeatRequest(Request: Request, callback: (err?: Error, result?: Response) => void) {

        console.log('Repeat Request Worker');
        const message = new SerialMessage(Request.toBuffer(), this.sequence);
        const encoded: Buffer = this.encoder.encode(message);
        console.log(encoded);

        const timeout = this.responseTimeout;
        let error: Error | undefined;
        let Response: Response | undefined;

        for (let retry = 0; retry <= this.maxRetries; retry++) {

            console.log(`Delivery Retry #${retry}`);

            try {

                Response = await this.deliver(encoded, timeout);
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
        if (!error) this.sequence = (this.sequence === 0x0) ? 0x1 : 0x0;
        callback(error, Response);
    }

    private onError(err?: Error): void {

        console.log('Error Occured');
    }

    private onClose(err?: Error) {

        console.log('Close Occured');

        this.deviceConnected = false;
    }
}