import Pin from './Pin';

export default class DigitalPin extends Pin {

    public constructor(state: 'on' | 'off') {
        super('Digital', state);
    }

    public get state(): 'on' | 'off' {
        return this._state;
    }

    public set state(value: 'on' | 'off') {
        this._state = value;
    }
}