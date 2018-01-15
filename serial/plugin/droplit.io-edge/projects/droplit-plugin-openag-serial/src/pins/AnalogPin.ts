import Pin from './Pin';

export default class AnalogPin extends Pin {

    public constructor(state: number) {
        super('Analog', state);
    }

    public get state(): number {
        return this._state;
    }

    public set state(value: number) {
        this._state = value;
    }
}