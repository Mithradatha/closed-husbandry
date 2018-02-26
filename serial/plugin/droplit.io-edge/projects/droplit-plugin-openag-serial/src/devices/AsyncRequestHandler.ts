import Request from '../requests/Request';
import Response from '../responses/Response';

export default interface AsyncRequestHandler {

    send(request: Request): Promise<Response>;
}