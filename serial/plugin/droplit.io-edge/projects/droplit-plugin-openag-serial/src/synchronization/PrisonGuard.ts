import Prison from './Prison';

export default class PrisonGuard {

    private prison: Prison;
    private prisonSize: number;

    private _position: number;

    public constructor(
        prisonSize: number,
        defaultInmates?: any,
        initialPosition: number = 0
    ) {
        this.prison = new Prison(prisonSize, defaultInmates);
        this.prisonSize = prisonSize;
        this._position = initialPosition;
    }

    public get position() {
        return this._position;
    }

    public move(cells: number): number {

        this.lock();
        this._position = (this._position + cells) % this.prisonSize;

        return this._position;
    }

    public lock(): void {
        this.prison.lock(this._position);
    }

    public unlock(): void {
        this.prison.unlock(this._position);
    }

    public confine(inmates: any): void {

        this.prison.setInmates(this._position, inmates);
        this.prison.lock(this._position);
    }

    public free(): Promise<any> {

        return new Promise<any>((resolve, reject) => {

            if (this.prison.isLocked(this._position))
                reject('Permission Denied');

            const mates = this.prison.getInmates(this._position);
            this.prison.setInmates(this._position, undefined);

            resolve(mates);
        });
    }
}
