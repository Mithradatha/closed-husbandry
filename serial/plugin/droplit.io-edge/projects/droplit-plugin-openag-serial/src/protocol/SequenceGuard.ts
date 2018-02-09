
export default class SequenceGuard {

    private prison: Cell[];

    public constructor(prisonSize: number = 2) {

        this.prison = new Array<Cell>(prisonSize);

        for (let cell: number = 0; cell < prisonSize; cell++) {
            this.prison[cell] = { isLocked: true, inmate: undefined };
        }
    }

    public lock(cell: number): void {
        this.prison[cell].isLocked = true;
    }

    public unlock(cell: number): void {
        this.prison[cell].isLocked = false;
    }

    public get(cell: number): any {
        return (this.prison[cell].isLocked)
            ? { error: 'Permission Denied' }
            : this.prison[cell].inmate;
    }

    public set(cell: number, value: any): void {
        if (!this.prison[cell].isLocked)
            this.prison[cell].inmate = value;
    }

    public isLocked(cell: number): boolean {
        return this.prison[cell].isLocked;
    }
}

interface Cell {

    isLocked: boolean;
    inmate: any;
}