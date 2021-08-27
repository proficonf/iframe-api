import { DependencyContainer } from '../src/dependency-container';
import { factoryMockHelper } from './setup';
import { EmbeddedRoom } from '../src/embedded-room';

describe('EmbeddedRoom', ()=>{
    let embeddedRoom;
    let eventEmitterFactory;
    let eventEmitter;
    let iframeLoaderFactory;
    let iframeLoader;
    let iframeMessengerFactory;
    let iframeMessenger;
    let window;
    let nanoid;
    let mediaSourcesFactory;
    let mediaSources;
    let eventForwarderFactory;
    let eventForwarder;
    let document;
    let iframeElement;
    let rootElement;

    beforeEach(()=>{
        eventEmitter = jasmine.createSpyObj('eventEmitter', ['on', 'removeListener', 'once']);
        eventEmitterFactory = factoryMockHelper.create(eventEmitter);

        iframeLoader = jasmine.createSpyObj('iframeLoader', ['loadUrl']);
        iframeLoaderFactory = factoryMockHelper.create(iframeLoader);

        iframeMessenger = jasmine.createSpyObj('iframeMessenger', [
            'initialize',
            'addMessageHandlerOnce',
            'sendMessage',
            'sendRequest',
        ]);
        iframeMessengerFactory = factoryMockHelper.create(iframeMessenger);

        window = { stub: true };
        nanoid = jasmine.createSpy('nanoid').and.returnValue('Fake-Id');

        mediaSources = {
            camera: jasmine.createSpyObj('camera', ['enable', 'disable', 'switch', 'getState']),
            screenSharing: jasmine.createSpyObj('camera', ['enable', 'disable', 'switch', 'getState']),
            microphone: jasmine.createSpyObj('camera', ['enable', 'disable', 'switch', 'getState'])
        };
        mediaSourcesFactory = factoryMockHelper.create(mediaSources);

        eventForwarder = jasmine.createSpyObj('eventForwarder', [
            'initialize'
        ]);
        eventForwarderFactory = factoryMockHelper.create(eventForwarder);

        iframeElement = {
            setAttribute: jasmine.createSpy('setAttribute'),
            contentWindow: { contentWindowStub: true },
            style: {}
        };

        document = jasmine.createSpyObj('document', {
            createElement: iframeElement
        });

        rootElement = jasmine.createSpyObj('root', ['appendChild']);

        DependencyContainer
            .set('eventEmitterFactory', eventEmitterFactory)
            .set('iframeLoaderFactory', iframeLoaderFactory)
            .set('iframeMessengerFactory', iframeMessengerFactory)
            .set('nanoid', nanoid)
            .set('window', window)
            .set('document', document)
            .set('mediaSourcesFactory', mediaSourcesFactory)
            .set('eventForwarderFactory', eventForwarderFactory);

        embeddedRoom = new EmbeddedRoom({
            rootElement,
            meetingId: 'fake-meeting-id',
            user: {
                name: 'fake-user-name',
                locale: 'fake-locale'
            },
            iframe: {
                width: 'fake-width',
                height: 'fake-height',
                style: {
                    'fake-style-prop': 'fake-style-prop-value',
                }
            },
            appOrigin: 'fake-app-origin'
        });
    });

    describe('constructor()', () => {
        it('should create new EventEmitter', () => {
            expect(eventEmitterFactory.create).toHaveBeenCalledOnceWith();
        });

        describe('[iframe initialization]', () => {
            it('should create iframe element', () => {
                expect(document.createElement).toHaveBeenCalledOnceWith('iframe');
            });

            it('should initialize default iframe properties', () => {
                expect(iframeElement.allow).toBe('camera; microphone; display-capture; autoplay; clipboard-write; clipboard-read; fullscreen');
                expect(iframeElement.name).toBe('ProficonfEmbeddedRoom-fake-meeting-id');
                expect(iframeElement.id).toBe('ProficonfEmbeddedRoom-fake-meeting-id');
            });

            it('should initialize iframe styles', () => {
                expect(iframeElement.style['border']).toBe('0');
                expect(iframeElement.style['fake-style-prop']).toBe('fake-style-prop-value');
                expect(iframeElement.style['width']).toBe('fake-width');
                expect(iframeElement.style['height']).toBe('fake-height');
            });

            it('should set default values for height and width', () => {
                new EmbeddedRoom({
                    rootElement,
                    meetingId: 'fake-meeting-id',
                    user: {
                        name: 'fake-user-name',
                        locale: 'fake-locale'
                    },
                    iframe: {
                        style: {
                            'fake-style-prop': 'fake-style-prop-value',
                        }
                    },
                    appOrigin: 'fake-app-origin'
                });

                expect(iframeElement.style['width']).toBe('100%');
                expect(iframeElement.style['height']).toBe('100%');
            });
        });
    });

    it('has iframeElement getter', ()=>{
        expect(embeddedRoom.iframeElement).toBe(iframeElement);
    });

    it('has rootElement getter', ()=>{
        expect(embeddedRoom.rootElement).toBe(rootElement);
    });

    it('should allow to subscribe for events', ()=>{
        embeddedRoom.on('x', 'y');

        expect(eventEmitter.on).toHaveBeenCalledOnceWith('x', 'y');
    });

    it('should allow to subscribe for events once', ()=>{
        embeddedRoom.once('x', 'y');

        expect(eventEmitter.once).toHaveBeenCalledOnceWith('x', 'y');
    });

    it('should allow to unsubscribe from events', ()=>{
        embeddedRoom.removeListener('x', 'y');

        expect(eventEmitter.removeListener).toHaveBeenCalledOnceWith('x', 'y');
    });

    describe('join()', ()=>{
        it('should make iframe visible', (done)=>{
            embeddedRoom.join()
                .then(()=>{
                    expect(rootElement.appendChild).toHaveBeenCalledOnceWith(iframeElement);
                    done();
                });

        });
    });
});