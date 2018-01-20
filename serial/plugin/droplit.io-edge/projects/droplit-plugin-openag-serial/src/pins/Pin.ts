import { Mode, Direction } from '../UtilTypes';

export default abstract class Pin {

    protected _state: any;

    private _mode: Mode;
    private _direction: Direction;

    public constructor(mode: Mode, direction: Direction, state: any) {
        this._mode = mode;
        this._direction = direction;
        this._state = state;
    }

    public abstract get state(): any;
    public abstract set state(value: any);

    public get mode(): Mode {
        return this._mode;
    }

    public get direction(): Direction {
        return this._direction;
    }

    public set direction(value: Direction) {
        this._direction = value;
    }
}