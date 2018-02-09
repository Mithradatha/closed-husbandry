import { format } from 'util';

const DEBUG_MODE = true;

export default
    function log(message?: any, detail?: any): void {

    if (DEBUG_MODE) {

        const now = new Date();
        const time = [
            String(now.getHours()),
            String(now.getMinutes()),
            String(now.getSeconds()),
            String(now.getMilliseconds())
        ];

        time.forEach((value: string, index: number, array: string[]) => {
            array[index] = (Number(value) < 10) ? `0${value}` : value;
        });

        if (detail)
            message = `${message}: ${format(detail)}`;

        console.log(`[${time.join(':')}] ${message}`);
    }
}