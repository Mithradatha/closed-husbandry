import { DeviceServiceMember } from './../../droplit-plugin/src/DroplitPlugins';
import { queue } from 'async';
import { Builder as FrameBuilder, Sequence } from './frame';
import * as Service from './service';
import { SequenceLock } from './sync';
import * as SerialPort from 'serialport';
import { Response } from './response';
import { Request, Acknowledgement, PinDirection } from './request';
import * as Config from './config';
import { Pin } from './pin';
import * as debug from 'debug';
const deviceLogger = debug('serial:device');
const proxyLogger = debug('serial:proxy');

export interface AsyncRequestHandler {

    send(request: Request): Promise<Response>;
}

export interface Options {

    autoOpen: boolean;
    baudRate: number;
    devicePath: string;
    delimiter: number;
    initSequence: Sequence;
    maxRetries: number;
    resTimeout: number;
    ackInterval: number;
}

export class Device implements AsyncRequestHandler {

    private options: Options;
    private isConnected = false;

    private serialPort: SerialPort;
    private requestQueue: AsyncQueue<Request>;

    private lock: SequenceLock;
    private frame: FrameBuilder;

    constructor(path: string) {

        this.options = {

            autoOpen: false,
            baudRate: 96000,
            devicePath: path,
            delimiter: 0x0,
            initSequence: 0x0,
            maxRetries: 3,
            resTimeout: 1000,
            ackInterval: 50
        };

        this.lock = new SequenceLock(this.options.initSequence);
        this.frame = new FrameBuilder(this.options.delimiter);

        this.requestQueue = queue<Request>(this.repeatRequest, 1);

        this.serialPort = new SerialPort(path, this.options);
        this.serialPort.on('error', err => this.onError(err));
        this.serialPort.on('close', err => this.onClose(err));
        this.serialPort.on('data', data => deviceLogger('data %O', data));
    }

    get connected() { return this.isConnected; }

    connect(): Promise<void> {

        deviceLogger('connect');
        return new Promise<void>((resolve, reject) => {

            if (this.isConnected) resolve();
            else this.serialPort.open((err?: Error) => {

                if (err) reject(err);
                else {

                    deviceLogger('onOpen');
                    const parser = this.serialPort.pipe(
                        new SerialPort.parsers.Delimiter({
                            delimiter: [this.options.delimiter]
                        }));

                    parser.on('data', (data: Buffer) => this.onData(data));

                    // deviceLogger('sending acknowledgement');
                    // this.send(new Acknowledgement())
                    //     .then((res: Response) => {

                    //         this.isConnected = true;
                    //         resolve();
                    //     })
                    //     .catch((error: any) => reject(error));

                    this.isConnected = true;
                    resolve();
                }
            });
        });
    }

    private onData(data: Buffer): void {

        deviceLogger('onData');
        this.frame.destruct(data, this.lock.sequence)
            .then((response: Response) => {

                this.lock.notify(response);
            });
    }

    send(request: Request): Promise<Response> {

        deviceLogger('send: %O', request);
        return new Promise<Response>((resolve, reject) => {

            if (!this.isConnected) reject('device not connected');

            this.requestQueue.push(request,
                (err?: Error, result?: Response) => {

                    if (err) reject(err);
                    else resolve(result);
                });
        });
    }

    private dispatch(msg: Buffer): Promise<Response> {

        deviceLogger('dispatch msg: %O', msg);
        return new Promise<Response>((resolve, reject) => {

            this.serialPort.write(msg, (error: any, bytes: number) => {

                if (error) reject(error);
                // else logger(`bytes written: ${bytes}`);
            });

            const intervalId = setInterval(() => {

                this.lock.await()
                    .then((res: Response) => {

                        clearInterval(intervalId);
                        resolve(res);
                    })
                    .catch(error => deviceLogger('error: %O', error));

            }, this.options.ackInterval);

            setTimeout(() => {

                clearInterval(intervalId);
                reject('timed out');
            }, this.options.resTimeout);
        });
    }

    private repeatRequest = async (req: Request,
        callback: AsyncResultCallback<Response>) => {

        const msg = this.frame.construct(req, this.lock.sequence);

        let err: Error;
        let res: Response;

        for (let retry = 0; retry <= this.options.maxRetries; retry++) {

            deviceLogger('repeatRequest #%d', retry + 1);

            try {

                res = await this.dispatch(msg);
                err = undefined;
                break;
            }
            catch (error) { err = error; }
        }

        if (!err) this.lock.flipSequence();
        callback(err, res);
    }

    disconnect(): Promise<void> {

        deviceLogger('disconnect');
        return new Promise<void>((resolve, reject) => {

            if (!this.isConnected) resolve();
            else this.serialPort.close((error: Error) => {

                if (error) reject(error);
                else resolve();
            });
        });
    }

    private onError(err?: Error): void {
        deviceLogger('onError');
    }

    private onClose(err?: Error): void {

        deviceLogger('onClose');
        this.isConnected = false;
    }
}

export class Proxy {

    private device: Device;
    private pins: { [index: number]: Pin } = {};

    constructor(private config: Config.Device) {

        this.device = new Device(config.path);
    }

    static async Discover(): Promise<string[]> {

        proxyLogger('discover');
        const ports = await SerialPort.list();
        const paths: string[] = [];

        ports.forEach((port: any) => {
            paths.push(port.comName);
        });

        return paths;
    }

    connect(): Promise<void> {
        proxyLogger('connect');
        return this.device.connect();
    }

    disconnect(): Promise<void> {
        proxyLogger('disconnect');
        return this.device.disconnect();
    }

    get(adapter: Service.Name, pinIndex: number,
        callback?: (currentValue: any) => void): boolean {

        proxyLogger('get(%O, %d)', adapter, pinIndex);
        if (!this.pins[pinIndex]) return false;
        const pin = this.pins[pinIndex];

        const service = Service.Factory
            .CreateService(adapter, this.device);

        service.getValue(pin)
            .then((currentValue: any) => {

                callback && callback(currentValue);

            }).catch((ignored: any) => { });

        return true;
    }

    set(adapter: Service.Name, pinIndex: number, value: any,
        callback?: (err?: any, previousValue?: any) => void): boolean {

        proxyLogger('set(%O, %d, %O)', adapter, pinIndex, value);
        if (!this.pins[pinIndex]) return false;
        const pin = this.pins[pinIndex];

        const service = Service.Factory
            .CreateService(adapter, this.device);

        service.setValue(pin, value)
            .then((previousValue: any) => {

                callback && callback(undefined, previousValue);
            })
            .catch((err: any) => callback && callback(err));

        return true;
    }

    async initialize(callback: (properties: DeviceServiceMember) => void): Promise<void> {

        proxyLogger('initialize');
        for (const idx in this.config.pins) {

            const pin = this.config.pins[idx];
            this.pins[pin.index] = new Pin(pin.index);

            const direction = pin.direction === 'Input' ? 0 : 1;

            const req = new PinDirection(pin.index, direction);
            await this.device.send(req);

            this.set(pin.service.name, pin.index, pin.service.state,
                (err?: any, previousValue?: any) => {

                    callback({
                        localId: this.config.path,
                        service: pin.service.name,
                        index: idx,
                        member: pin.service.property,
                        value: pin.service.state,
                        error: err,
                        timestamp: new Date()
                    });
                });
        }
    }
}
