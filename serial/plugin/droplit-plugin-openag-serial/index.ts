import DigitalWriteRequest from './src/communication/request/implementation/DigitalWriteRequest';
import SerialDevice from './src/SerialDevice';
import Response from './src/communication/response/interface/Response';


let device = new SerialDevice({
    devicePath: 'COM5',
    baudRate: 9600,
    delimiter: [0x0]
});


let req = new DigitalWriteRequest(7, 0);
console.log('Sending...');
device.send(req)
    .then((res: Response) => {
        console.log('SUCCESS');
    }).catch((err: any) => {
        console.log('ERROR');
    })
