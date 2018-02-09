
export class PrisonGuard {

    private prison: Prison
    private prisonSize: number;

    private _position: number;

    public constructor(
        prisonSize: number,
        defaultInmates?: any,
        initial_position: number = 0
    ) {
        this.prison = new Prison(prisonSize, defaultInmates);
        this.prisonSize = prisonSize;
        this._position = initial_position
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

class Prison {

    private prison: Cell[];

    public constructor(size: number, defaultInmates?: any) {
        this.prison = new Array<Cell>(size);

        for (let cell: number = 0; cell < size; cell++) {
            this.prison[cell] = {
                isLocked: true,
                inmates: defaultInmates
            };
        }
    }

    public lock(cell: number): void {
        this.prison[cell].isLocked = true;
    }

    public unlock(cell: number): void {
        this.prison[cell].isLocked = false;
    }

    public getInmates(cell: number): any {
        return this.prison[cell].inmates;
    }

    public setInmates(cell: number, inmates: any): void {
        this.prison[cell].inmates = inmates;
    }

    public isLocked(cell: number): boolean {
        return this.prison[cell].isLocked;
    }
}

interface Cell {

    isLocked: boolean;
    inmates: any;
}