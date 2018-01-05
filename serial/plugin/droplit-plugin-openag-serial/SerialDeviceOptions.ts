import { Encoder } from './Encoder';
import * as SerialPort from 'serialport';
import { Delimeter } from './Message';

export interface SerialDeviceOptions extends SerialPort.OpenOptions {

    devicePath: string;
    delimiter?: Delimeter
    maxRetries?: number;
    responseTimeout?: number;
}



