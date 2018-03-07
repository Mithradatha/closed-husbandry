import { Response } from './response';
import { Request } from './request';

export interface AsyncRequestHandler {

    send(request: Request): Promise<Response>;
}