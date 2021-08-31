import SimpleFactory  from '@proficonf/utils/shared/SimpleFactory';
import { EventEmitter } from 'events';
import { nanoid } from 'nanoid';
import { DependencyContainer } from './dependency-container';
import { IframeLoader } from './iframe-loader';
import { IframeMessenger } from './iframe-messenger';
import { EventForwarder } from './event-forwarder';
import { EmbeddedRoom } from './embedded-room';

DependencyContainer
    .set('eventEmitterFactory', SimpleFactory.for(EventEmitter))
    .set('iframeLoaderFactory', SimpleFactory.for(IframeLoader))
    .set('iframeMessengerFactory', SimpleFactory.for(IframeMessenger))
    .set('nanoid', nanoid)
    .set('window', window)
    .set('document', document)
    .set('eventForwarderFactory', SimpleFactory.for(EventForwarder));

export { EmbeddedRoom };
