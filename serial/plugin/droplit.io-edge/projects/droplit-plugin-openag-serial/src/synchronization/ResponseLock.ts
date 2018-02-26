import PrisonGuard from './PrisonGuard';
import { Sequence } from '../util/Types';
import Response from '../responses/Response';

export default class ResponseLock {

    private guard: PrisonGuard;

    public constructor(initialSequenceNumber: Sequence = 0x0) {

        this.guard =
            new PrisonGuard(2, undefined, initialSequenceNumber);
    }

    public get sequence(): Sequence {
        return this.guard.position as Sequence;
    }

    public flipSequence(): number {
        return this.guard.move(1);
    }

    public setResponse(response: Response): void {

        this.guard.confine(response);
        this.guard.unlock();
    }

    public getResponse(): Promise<Response> {
        return this.guard.free();
    }
}