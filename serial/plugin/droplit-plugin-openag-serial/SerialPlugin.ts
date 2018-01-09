// import { CobsEncoder } from './CobsEncoder';
// import * as droplit from 'droplit-plugin';
// import * as SerialPort from 'serialport';

// export class SerialPlugin extends droplit.DroplitPlugin {

//     private readonly BAUD_RATE = 9600;
//     private readonly DELIMITER = 0x0;

//     // iterate over /dev/tty* for more than one device
//     // private readonly DEVICE_PATH = '/dev/ttyACM0';
//     private readonly DEVICE_PATH = 'COM5';

//     private devices: any;
//     private services: any;

//     private serial: SerialPort;
//     private encoder: CobsEncoder;

//     constructor() {
//         super();

//         console.log('Constructor');

//         this.services = {
//             BinarySwitch: {
//                 get_switch: this.getSwitch,
//                 set_switch: this.setSwitch,
//                 switchOff: this.switchOff,
//                 switchOn: this.switchOn
//             }
//         };

//         this.serial = new SerialPort(
//             this.DEVICE_PATH,
//             { baudRate: this.BAUD_RATE }
//         );

//         this.encoder = new CobsEncoder(this.DELIMITER);
//         this.serial.on('open', onOpen.bind(this));

//         function onOpen(): void {

//             console.log('Connect');

//             setImmediate(() => { // simulate async

//                 this.devices = {
//                     1: { 'BinarySwitch.switch': 'off' }
//                 };

//                 this.onDeviceInfo({
//                     localId: '1',
//                     address: this.DEVICE_PATH,
//                     services: ['BinarySwitch'],
//                     promotedMembers: {
//                         switch: 'BinarySwitch.switch'
//                     }
//                 });
//             });
//         }
//     }

//     public discover() {

//         console.log('Discover');

//         setImmediate(() => { // simulate async

//             this.onDiscoverComplete();
//         });
//     }

//     public dropDevice(localId: string): boolean {
//         console.log('Drop');
//         this.disconnect(localId);
//         delete this.devices[localId];
//         return true;
//     }

//     // BinarySwitch Implementation
//     protected getSwitch(localId: string, callback: (value: any) => void): boolean {

//         console.log('Get Switch');

//         // device does not exist
//         if (!this.devices[localId]) {
//             callback(undefined);
//             return true;
//         }

//         setImmediate(() => { // simulate async
//             // send last set value
//             callback(this.devices[localId]['BinarySwitch.switch']);
//         });
//         return true;
//     }

//     protected setSwitch(localId: string, value: any): boolean {

//         console.log('Set Switch');

//         // device does not exist
//         if (!this.devices[localId])
//             return true;

//         // check if values are valid
//         if (value !== 'on' && value !== 'off')
//             return true;

//         const cmd = (value === 'off')
//             ? new Uint8Array([0x30])
//             : new Uint8Array([0x31]);

//         const encoded = new Buffer(this.encoder.pack(cmd));
//         const packet = Buffer.concat([encoded, new Buffer([this.DELIMITER])]);

//         this.serial.write(packet);

//         // simulate setting device property
//         this.devices[localId]['BinarySwitch.switch'] = value;
//         return true;
//     }

//     protected switchOff(localId: string): boolean {
//         console.log('Switch Off');

//         return this.setSwitch(localId, 'off');
//     }

//     protected switchOn(localId: string): boolean {
//         console.log('Switch On');

//         return this.setSwitch(localId, 'on');
//     }
// }