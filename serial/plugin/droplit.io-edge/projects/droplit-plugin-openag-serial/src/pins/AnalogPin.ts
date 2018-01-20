import Pin from './Pin';
import { Direction } from '../UtilTypes';

export default class AnalogPin extends Pin {

    public constructor(direction: Direction, state: number) {
        super('Analog', direction, state);
    }

    public get state(): number {
        return this._state;
    }

    public set state(value: number) {
        this._state = value;
    }
}