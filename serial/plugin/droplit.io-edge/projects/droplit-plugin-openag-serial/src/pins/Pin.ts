import { Direction } from '../util/Types';
import { ArduinoConverter } from '../util/ArduinoConverter';

export default class Pin {

    private _index: number;
    private _direction: Direction;

    // range: [0, 255]
    private state: number;

    public constructor(
        index: number, direction: Direction, state: number = 0
    ) {
        this._index = index;
        this._direction = direction;
        this.state = state;
    }

    public get index(): number { return this._index; }
    public get direction(): Direction { return this._direction; }

    public setState(value: number, inMin: number, inMax: number): void {

        this.state = ArduinoConverter.toAnalog8(value, inMin, inMax);
    }

    public getState(outMin: number, outMax: number): number {

        return ArduinoConverter.fromAnalog8(this.state, outMin, outMax);
    }
}