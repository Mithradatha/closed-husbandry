
export type LOW = 0x0;
export type HIGH = 0x1;

export type INPUT = 0x0;
export type OUTPUT = 0x1;

export abstract class Converter {

    static FromAnalog8(
        value: number, outMin: number, outMax: number): number {
        return Converter.Map(value, 0, 255, outMin, outMax);
    }

    static ToAnalog8(
        value: number, inMin: number, inMax: number): number {
        return Converter.Map(value, inMin, inMax, 0, 255);
    }

    static FromAnalog10(
        value: number, outMin: number, outMax: number): number {
        return Converter.Map(value, 0, 1023, outMin, outMax);
    }

    static ToDigital(
        value: number, inMin: number, inMax: number): number {
        return Converter.Map(value, inMin, inMax, 0, 1);
    }

    static FromDigital(
        value: number, outMin: number, outMax: number): number {
        return Converter.Map(value, 0, 1, outMin, outMax);
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
    static Map(value: number,
        inMin: number, inMax: number,
        outMin: number, outMax: number
    ): number {

        // TODO: Memoize slope
        const slope = (1.0 * (outMax - outMin)) / (inMax - inMin);
        return outMin + Math.floor(slope * (value - inMin) + 0.5);
    }
}
