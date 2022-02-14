import SimpleFactory  from '@proficonf/utils/shared/SimpleFactory';
import { EventEmitter } from 'events';
import { nanoid } from 'nanoid';
import { DependencyContainer } from './dependency-container';
import { IframeLoader } from './iframe-loader';
import { IframeMessenger } from './iframe-messenger';
import { EventForwarder } from './event-forwarder';
import { EmbeddedRoom } from './embedded-room';
import { InterfaceConfigSerializer } from './interface-config-serializer';
import { UI_SERIALIZATION_ORDER } from './default-ui-config';

DependencyContainer
    .set('eventEmitterFactory', SimpleFactory.for(EventEmitter))
    .set('iframeLoaderFactory', SimpleFactory.for(IframeLoader))
    .set('iframeMessengerFactory', SimpleFactory.for(IframeMessenger))
    .set('nanoid', nanoid)
    .set('window', window)
    .set('document', document)
    .set('location', location)
    .set('eventForwarderFactory', SimpleFactory.for(EventForwarder))
    .set('interfaceConfigSerializer', new InterfaceConfigSerializer({
        serializationOrder: UI_SERIALIZATION_ORDER,
    }));

export { EmbeddedRoom };
