import { Mode } from '../UtilTypes';

export default abstract class Pin {

    protected _state: any;

    private _mode: Mode;

    public constructor(mode: Mode, state: any) {
        this._mode = mode;
        this._state = state;
    }

    public abstract get state(): any;
    public abstract set state(value: any);

    public get mode(): Mode {
        return this._mode;
    }
}