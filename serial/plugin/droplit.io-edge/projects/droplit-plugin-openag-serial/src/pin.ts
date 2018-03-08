import { Converter as ArduinoConverter } from './arduino';
import * as debug from 'debug';
const logger = debug('serial:pin');

export class Pin {

    // range: [0, 255]
    private state: number;
    private _index: number;

    constructor(index: number) {

        this._index = index;
    }

    get index() { return this._index; }

    setState(value: number, inMin: number, inMax: number): void {
        logger('setState');
        this.state = ArduinoConverter.ToAnalog8(value, inMin, inMax);
    }

    getState(outMin: number, outMax: number): number {
        logger('getState');
        return ArduinoConverter.FromAnalog8(this.state, outMin, outMax);
    }
}