import { Encoder } from './Encoder';
import * as SerialPort from 'serialport';


// // Options Type Defs
// interface OpenOptions {
//     autoOpen?: boolean;
//     baudRate?: 115200|57600|38400|19200|9600|4800|2400|1800|1200|600|300|200|150|134|110|75|50|number;
//     dataBits?: 8|7|6|5;
//     highWaterMark?: number;
//     lock?: boolean;
//     stopBits?: 1|2;
//     parity?: 'none'|'even'|'mark'|'odd'|'space';
//     rtscts?: boolean;
//     xon?: boolean;
//     xoff?: boolean;
//     xany?: boolean;
//     binding?: BaseBinding;
//     bindingOptions?: {
//         vmin?: number;
//         vtime?: number;
//     };
// }


export interface SerialDeviceOptions extends SerialPort.OpenOptions {

    devicePath: string;
    baudRate: 115200 | 57600 | 38400 | 19200 | 9600 | 4800 | 2400 | 1800 | 1200 | 600 | 300 | 200 | 150 | 134 | 110 | 75 | 50 | number;
    delimiter: string | Buffer | number[];
    maxRetries?: number;
    responseTimeout?: number;
    //encoder?: Encoder;
}



