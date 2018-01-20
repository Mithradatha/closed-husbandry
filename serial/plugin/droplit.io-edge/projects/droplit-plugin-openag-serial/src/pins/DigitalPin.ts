import Pin from './Pin';
import { Direction } from '../UtilTypes';

export default class DigitalPin extends Pin {

    public constructor(direction: Direction, state: 'on' | 'off') {
        super('Digital', direction, state);
    }

    public get state(): 'on' | 'off' {
        return this._state;
    }

    public set state(value: 'on' | 'off') {
        this._state = value;
    }
}