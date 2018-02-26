
export namespace ArduinoConverter {

    export function fromAnalog8(
        value: number, outMin: number, outMax: number): number {
        return this.map(value, 0, 255, outMin, outMax);
    }

    export function toAnalog8(
        value: number, inMin: number, inMax: number): number {
        return this.map(value, inMin, inMax, 0, 255);
    }

    export function fromAnalog10(
        value: number, outMin: number, outMax: number): number {
        return this.map(value, 0, 1023, outMin, outMax);
    }

    export function toDigital(
        value: number, inMin: number, inMax: number): number {
        return this.map(value, inMin, inMax, 0, 1);
    }

    export function fromDigital(
        value: number, outMin: number, outMax: number): number {
        return this.map(value, 0, 1, outMin, outMax);
    }

    /**
     * https://stackoverflow.com/questions/5731863
     *
     * @param {number} value input value in range [inMin, inMax]
     * @param {number} inMin input minimum range
     * @param {number} inMax input maximum range
     * @param {number} outMin output minimum range
     * @param {number} outMax output maximum range
     * @returns {number} output value in range [outMin, outMax]
     */
    export function map(value: number,
        inMin: number, inMax: number,
        outMin: number, outMax: number
    ): number {

        // TODO: Memoize slope
        const slope = (1.0 * (outMax - outMin)) / (inMax - inMin);
        return outMin + Math.floor(slope * (value - inMin) + 0.5);
    }
}
