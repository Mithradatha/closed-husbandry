import Response from './Response';

export default class WriteResponse extends Response {

    public constructor() {
        super();
    }

    public get value(): number | undefined {
        return undefined;
    }
}