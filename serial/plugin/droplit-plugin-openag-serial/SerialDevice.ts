import { CobsEncoder } from './CobsEncoder';
import { SerialDeviceOptions } from './SerialDeviceOptions';
import * as SerialPort from 'serialport';
import { AsyncQueue, queue } from 'async';
import { clearTimeout, clearInterval } from 'timers';
import { FletcherChecksum } from './FletcherChecksum';

type Sequence = 0x0 | 0x1;
export type Delimiter = string | Buffer | number[];

export class SerialDevice {

    // ms between acknowledgement checks
    private readonly interval: number = 50;

    private requestTimeout: number;
    private maxRetries: number;

    private acknowledged: boolean[] = [false, false];
    private sequence: Sequence = 0x0;

    private connected: boolean = false;
    private devicePath: string;

    private serialPort: SerialPort;
    private encoder: CobsEncoder;
    private delimiter: Delimiter;

    private requestQueue: AsyncQueue<any>;

    constructor(options: SerialDeviceOptions) {

        this.requestTimeout = options.responseTimeout;
        this.maxRetries = options.maxRetries;

        this.delimiter = options.delimiter;
        this.encoder = new CobsEncoder(this.delimiter);

        this.devicePath = options.devicePath;

        this.serialPort = new SerialPort(this.devicePath, options);
        this.serialPort.on('open', () => this.onOpen(this.delimiter));

        // 1: only process one request at a time
        this.requestQueue = queue(this.repeatRequest.bind(this), 1);
    }

    private onOpen(delimiter: Delimiter): void {

        this.connected = true;

        const parser = this.serialPort.pipe(
            new SerialPort.parsers.Delimiter(
                { delimiter: delimiter }));

        parser.on('data', (data: Buffer) => this.onData(data));

        this.serialPort.on('error', (err: any) => this.onError(err));
        this.serialPort.on('close', (err?: any) => this.onClose(err));
    }

    private onData(data: Buffer): void {

        const payload = this.unwrap(data);
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

    private wrap(msg: Buffer): Buffer {

        console.log('wrap');
        const seq = Buffer.from([this.sequence]);
        const payload = Buffer.concat([seq, msg]);

        const sum = FletcherChecksum.generate(payload);
        const data = FletcherChecksum.append(payload, sum);
        const encoded = this.encoder.pack(data);

        const delim = Buffer.from([this.delimiter])
        const frame = Buffer.concat([new Buffer(encoded), delim]);

        return frame;
    }

    private unwrap(data: Buffer): Buffer {

        // TODO: unwrap should remove sequence

        const decoded = this.encoder.unpack(data);

        if (FletcherChecksum.valid(decoded)) {

            const payload = FletcherChecksum.strip(decoded);
            return Buffer.from(payload.buffer);
        }

        return Buffer.from([]);
    }

    private onError(err: any): void {

    }

    private onClose(err?: any): void {

        if (err && err.disconnect == true) {
            // Disconnect Message
        }

        this.connected = false;
    }

    public sendMessage(msg: Buffer): void {

        this.requestQueue.push(msg, function (result) {
            console.log('finished processing message');
            console.log(result);
        });
    }

    private deliver(msg: Buffer, timeout: number): Promise<any> {

        this.serialPort.write(msg);

        return new Promise((resolve, reject) => {

            const intervalId = setInterval(() => {

                console.log('interval');

                console.log('deliver');
                if (this.acknowledged[this.sequence]) {

                    clearInterval(intervalId);
                    resolve('acknowledgement received');
                }

            }, this.interval);

            setTimeout(() => {

                clearInterval(intervalId);
                reject('timed out');

            }, timeout);
        });
    }

    /** 
     * stop and wait implementation of automatic repeat request
     */
    private async repeatRequest(msg: Buffer, callback) {

        // alternating bit sequence
        console.log('repeatRequest');
        this.sequence = (this.sequence === 0x0) ? 0x1 : 0x0;

        const frame = this.wrap(msg);

        let timeout = this.requestTimeout;
        let sucess: boolean = false;

        for (let retry = 0; retry < this.maxRetries; retry++) {

            try {
                let val = await this.deliver(frame, timeout);
                console.log(val);
                sucess = true;
                break;
            } catch (err) {
                console.log(err);
                timeout *= 2;
            }

            console.log(retry);
        }

        callback(sucess);
    }
}