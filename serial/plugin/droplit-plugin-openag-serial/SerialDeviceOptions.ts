import { Delimeter } from './UtilTypes';
import { OpenOptions } from 'serialport';

export default interface SerialDeviceOptions extends OpenOptions {

    devicePath: string;
    delimiter?: Delimeter
    maxRetries?: number;
    responseTimeout?: number;
}



