import * as SerialPort from 'serialport';
import { queue } from 'async';
import { clearInterval } from 'timers';
import log from './Logger';
import * as SerialResponseFactory from './responses/SerialResponseFactory';
import SerialMessageEncoder from './protocol/SerialMessageEncoder';
import ResponseLock from './protocol/ResponseLock';
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

    // private sequence: Sequence;
    private lock: ResponseLock;
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

        this.lock = new ResponseLock(0x0);
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

        log('Client Sent Request', request.toBuffer());
        return new Promise<Response>((resolve, reject) => {

            if (this.deviceConnected) {

                log('Queueing Client\'s Request');
                this.requestQueue.push(request, (err?: Error, result?: Response) => {
                    if (err) {
                        log('err in send');
                        reject(err);
                    }
                    else {
                        log('Client Request Resolved');
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
        log('Serial Device Connected');

        callback(this.devicePath);
    }

    private onData(data: Buffer): void {

        log('Serial Message Received');
        this.encoder.decode(data)
            .then((message: SerialMessage) => {

                const res = SerialResponseFactory.assembleFrom(message);
                const seq = message.sequence;

                log(`Expected Sequence Number: ${this.lock.sequence}`); log(`Actual Sequence Number: ${seq}`);
                log(`Response Value: ${res.value}`);

                this.lock.setResponse(res.value);

            }).catch((reason: any) => {
                log('Message Could Not Be Decoded');
            });
    }

    private deliver(msg: Buffer, timeout: number): Promise<Response> {

        log('Delivering Message', msg);
        this.serialPort.write(msg);

        return new Promise((resolve, reject) => {

            const intervalId = setInterval(() => {

                this.lock.getResponse()
                    .then((response: any) => {

                        clearInterval(intervalId);
                        log('Message Acknowledged');
                        resolve(response);

                    }).catch(ignored => { });

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

        log('Repeat Request Worker');
        const message = new SerialMessage(Request.toBuffer(), this.lock.sequence);
        const encoded: Buffer = this.encoder.encode(message);

        const timeout = this.responseTimeout;
        let error: Error | undefined;
        let response: Response | undefined;

        for (let retry = 0; retry <= this.maxRetries; retry++) {

            log(`Delivery Retry #${retry}`);

            try {

                response = await this.deliver(encoded, timeout);
                log('Response Received');
                error = undefined;
                break;

            } catch (err) {
                error = err;
                log('Response Not Received');
                // timeout *= 2;
            }
        }

        // alternating bit sequence
        if (!error) this.lock.flipSequence();
        callback(error, response);
    }

    private onError(err?: Error): void {

        log('Error Occured');
    }

    private onClose(err?: Error) {

        log('Close Occured');

        this.deviceConnected = false;
    }
}