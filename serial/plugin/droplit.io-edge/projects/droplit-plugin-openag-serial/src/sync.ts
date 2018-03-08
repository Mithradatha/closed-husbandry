import { Response } from './response';
import { Sequence } from './frame';
import * as debug from 'debug';
const logger = debug('serial:sync');

export class Lock {

    private locked: boolean;

    constructor(isLocked: boolean = true) { this.locked = isLocked; }

    lock(): void { this.locked = true; }
    unlock(): void { this.locked = false; }
    isLocked(): boolean { return this.locked; }
}

export class Cell<T> {

    private _lock: Lock;
    private _value: T;

    constructor(isLocked: boolean = true, value?: T) {

        this._lock = new Lock(isLocked);
        this._value = value;
    }

    lock(): void { this._lock.lock(); }
    unlock(): void { this._lock.unlock(); }
    isLocked(): boolean { return this._lock.isLocked(); }

    get value() { return this._value; }
    set value(value: T) { this._value = value; }
}

export class Prison<T> {

    private prison: Cell<T>[];

    constructor(size: number) {
        this.prison = new Array<Cell<T>>(size);

        for (let cell = 0; cell < size; cell++) {
            this.prison[cell] = new Cell<T>();
        }
    }

    lock(cell: number): void { this.prison[cell].lock(); }
    unlock(cell: number): void { this.prison[cell].unlock(); }

    isLocked(cell: number): boolean {
        return this.prison[cell].isLocked();
    }

    getValue(cell: number): T { return this.prison[cell].value; }
    setValue(cell: number, value: T): void {
        this.prison[cell].value = value;
    }
}

export class SequenceLock {

    private prison: Prison<Response>;
    private _sequence: Sequence;

    constructor(initialSequence: Sequence = 0x0) {

        this.prison = new Prison<Response>(2);
        this._sequence = initialSequence;
    }

    get sequence() { return this._sequence; }

    flipSequence(): void {

        logger('flipSequence');
        this._sequence = (this._sequence === 0x0) ? 0x1 : 0x0;
    }

    notify(response: Response): void {

        logger('notify(%O)', response);
        this.prison.setValue(this._sequence, response);
        this.prison.unlock(this._sequence);
    }

    await(): Promise<Response> {

        logger('await');
        return new Promise<Response>((resolve, reject) => {

            if (this.prison.isLocked(this._sequence))
                reject('permission denied');

            const response = this.prison.getValue(this._sequence);
            this.prison.setValue(this._sequence, undefined);

            this.prison.lock(this._sequence);
            resolve(response);
        });
    }
}