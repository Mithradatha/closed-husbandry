import ServiceClass from './ServiceClass';
import BinarySwitch from './BinarySwitch';
import DimmableSwitch from './DimmableSwitch';
import AsyncRequestHandler from '../devices/AsyncRequestHandler';

export default abstract class ServiceClassFactory {

    public static CreateService(
        name: string, handler: AsyncRequestHandler): ServiceClass<any> {

        switch (name) {

            case 'BinarySwitch':
                return new BinarySwitch(handler);
            case 'DimmableSwitch':
                return new DimmableSwitch(handler);
        }
    }
}