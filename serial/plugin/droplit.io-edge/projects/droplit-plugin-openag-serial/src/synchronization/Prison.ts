import Cell from './Cell';

export default class Prison {

    private prison: Cell[];

    public constructor(size: number, defaultInmates?: any) {

        this.prison = new Array<Cell>(size);

        for (let cell = 0; cell < size; cell++) {

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