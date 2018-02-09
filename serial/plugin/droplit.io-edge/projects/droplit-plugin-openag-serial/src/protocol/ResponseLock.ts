import { PrisonGuard } from './PrisonGuard';
import { Sequence } from './../UtilTypes';

export default class ResponseLock {

    private guard: PrisonGuard;

    public constructor(initialSequenceNumber: Sequence = 0x0) {
        this.guard = new PrisonGuard(2,
            undefined, initialSequenceNumber);
    }

    public get sequence(): Sequence {
        return this.guard.position as Sequence;
    }

    public flipSequence(): number {
        return this.guard.move(1);
    }

    public setResponse(response: any): void {
        this.guard.confine(response);
        this.guard.unlock();
    }

    public getResponse(): Promise<any> {
        return this.guard.free();
    }
}