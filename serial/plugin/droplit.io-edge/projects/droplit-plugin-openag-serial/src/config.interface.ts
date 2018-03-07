import { Direction, Service, State } from './util/Types';

export interface PluginConfiguration {

    devices: DeviceConfiguration[];
}

export interface DeviceConfiguration {

    path: string;
    pins: PinConfiguration[];
}

export interface PinConfiguration {

    index: number;
    direction: Direction;
    service: Service;
    state: State;
}
