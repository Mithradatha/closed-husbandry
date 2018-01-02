
export namespace SerialProtocol {

    export enum Command {

        DigitalRead = 0x0,
        DigitalWrite = 0x1,
        AnalogRead = 0x2,
        AnalogWrite = 0x3
    }

    export interface Payload {

        pin: number;
        cmd: Command;
        val: number;
    }
}