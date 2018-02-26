import { Direction, Service, Member } from '../util/Types';

export default interface PinOptions {

    // mode: Mode;
    direction: Direction;
    service: Service;
    member: Member;
    state: any;
}