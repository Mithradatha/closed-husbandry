import * as SerialPort from 'serialport';
import { queue } from 'async';
import { Response } from './response';
import { Request } from './request';
import { Builder as FrameBuilder, Sequence } from './frame';

export interface ResponseCallback extends ErrorCallback {

    (err?: Error, result?: Response): void;
}

export interface AsyncRequestWorker extends AsyncWorker<Request> {

    (req: Request, cb: ResponseCallback): void;
}

export class AsyncRequestHandler {

    private requestQueue: AsyncQueue<Request>;

    constructor(worker: AsyncRequestWorker, concurrency?: number) {

        this.requestQueue = queue<Request>(worker, concurrency);
    }

    send(request: Request): Promise<Response> {

        return new Promise<Response>((resolve, reject) => {

            this.requestQueue.push(request,
                (err?: Error, result?: Response) => {

                    if (err) reject(err);
                    resolve(result);
                });
        });
    }
}

export class RepeatRequestHandler extends AsyncRequestHandler {

    constructor(
        private maxRetries: number,
        private responseTimeout: number
    ) {

        super(async (req: Request, cb: ResponseCallback) => {

            let res: Response;
            let err: Error;

            for (let retry = 0; retry <= this.maxRetries; retry++) {

                try {

                    res = await this.deliver(req, this.responseTimeout);
                    err = undefined;
                    break;

                } catch (error) { err = error; }
            }

            // alternating bit sequence
            if (!err) this.lock.flipSequence();
            callback(error, response);

        }, 1);
    }
}






export class Device {

    private frame: FrameBuilder;
    private serialPort: SerialPort;

    private sequence: Sequence = 0x0;

    constructor(
        private path: string,
        private delimiter: number,
        private maxRetries: number,
        private responseTimeout: number
    ) {

        this.frame = new FrameBuilder(delimiter);
        this.serialPort = this.serialPort = new SerialPort(path, {
            autoOpen: false,
            baudRate: 9600
        });
    }

    connect(): void {

        this.serialPort.open((err?: Error) => {

            if (!err) this.onOpen();
        });
    }

    private onOpen(): void {

        const parser = this.serialPort.pipe(
            new SerialPort.parsers.Delimiter({
                delimiter: [this.delimiter]
            }));

        parser.on('data', (data: Buffer) => this.onData(data));
    }

    private onData(data: Buffer): void {

        this.frame.destruct(data, this.sequence)
            .then(res => {

                this.notify(res);
            });
    }
}