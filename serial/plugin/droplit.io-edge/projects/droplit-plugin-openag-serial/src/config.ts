
import { Name } from './service';

export interface Service {
    name: Name;
    property: string;
    state: any;
}

export interface Pin {
    index: number;
    direction: string;
    service: Service;
}

export interface Device {
    path: string;
    pins: Pin[];
}

export interface Config {
    devices: Device[];
}
