import { DependencyContainer } from '../src/dependency-container';
import { factoryMockHelper } from './setup';
import { EmbeddedRoom } from '../src/embedded-room';

describe('EmbeddedRoom', () => {
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
    const messageHandlers = new Map();

    function emitMessage(command, payload) {
        return messageHandlers.get(command)(payload);
    }

    beforeEach(() => {
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
        iframeMessenger.addMessageHandlerOnce.and.callFake((command, handler) => {
            messageHandlers.set(command, handler);
        });

        iframeMessengerFactory = factoryMockHelper.create(iframeMessenger);

        window = { stub: true };
        nanoid = jasmine.createSpy('nanoid').and.returnValue('Fake-Id');

        mediaSources = {
            camera: jasmine.createSpyObj('camera', ['enable', 'disable', 'update', 'getState']),
            screenSharing: jasmine.createSpyObj('camera', ['enable', 'disable', 'update', 'getState']),
            microphone: jasmine.createSpyObj('camera', ['enable', 'disable', 'update', 'getState'])
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

    it('has iframeElement getter', () => {
        expect(embeddedRoom.iframeElement).toBe(iframeElement);
    });

    it('has rootElement getter', () => {
        expect(embeddedRoom.rootElement).toBe(rootElement);
    });

    it('should allow to subscribe for events', () => {
        embeddedRoom.on('x', 'y');

        expect(eventEmitter.on).toHaveBeenCalledOnceWith('x', 'y');
    });

    it('should allow to subscribe for events once', () => {
        embeddedRoom.once('x', 'y');

        expect(eventEmitter.once).toHaveBeenCalledOnceWith('x', 'y');
    });

    it('should allow to unsubscribe from events', () => {
        embeddedRoom.removeListener('x', 'y');

        expect(eventEmitter.removeListener).toHaveBeenCalledOnceWith('x', 'y');
    });

    describe('join()', () => {
        beforeAll(() => {
            jasmine.clock().install().mockDate(new Date());
        });

        afterAll(() => {
            jasmine.clock().uninstall();
        });

        beforeEach(() => {
            iframeMessenger.sendMessage
                .withArgs('initialize', {})
                .and.callFake(() => emitMessage('app:ready', {}));
        });

        it('should make iframe visible', async () => {
            await embeddedRoom.join();

            expect(rootElement.appendChild).toHaveBeenCalledOnceWith(iframeElement);
        });

        it('should initialize iframeLoader', async () => {
            await embeddedRoom.join();

            expect(iframeLoaderFactory.create).toHaveBeenCalledOnceWith(iframeElement);
        });

        it('should load iframe url', async () => {
            await embeddedRoom.join();

            expect(iframeLoader.loadUrl).toHaveBeenCalledOnceWith(
                'fake-app-origin/j/fake-meeting-id/?embedded=1&userName=fake-user-name&userLocale=fake-locale'
            );
        });

        it('Should createe iframe messenger', async () => {
            await embeddedRoom.join();

            expect(iframeMessengerFactory.create).toHaveBeenCalledOnceWith({
                targetOrigin: 'fake-app-origin',
                targetWindow: iframeElement.contentWindow,
                window,
                nanoid,
                correlationId: 'fake-meeting-id'
            });
        });

        it('Should initialize media sources module', async () => {
            await embeddedRoom.join();

            expect(mediaSourcesFactory.create).toHaveBeenCalledOnceWith({
                iframeMessenger
            });
        });

        it('Should create eventForwarder', async () => {
            await embeddedRoom.join();

            expect(eventForwarderFactory.create).toHaveBeenCalledOnceWith({
                iframeMessenger,
                eventEmitter
            });
        });

        it('Should initialize eventForwarder', async () => {
            await embeddedRoom.join();

            expect(eventForwarder.initialize).toHaveBeenCalledOnceWith();
        });

        it('Should initialize iframeMessenger', async () => {
            await embeddedRoom.join();

            expect(iframeMessenger.initialize).toHaveBeenCalledOnceWith();
        });

        it('Should send initialize command', async () => {
            await embeddedRoom.join();

            expect(iframeMessenger.sendMessage).toHaveBeenCalledOnceWith('initialize', {});
        });

        it('Should throw on initialization timeout', async () => {
            iframeMessenger.sendMessage
                .withArgs('initialize', {})
                .and.callFake(() => {
                    jasmine.clock().tick(70000);
                });

            await expectAsync(
                embeddedRoom.join()
            ).toBeRejectedWith(new Error('App initialization timeout'));
        });
    });

    describe('[joined]', ()=>{
        beforeEach(() =>{
            iframeMessenger.sendMessage
                .withArgs('initialize', {})
                .and.callFake(() => emitMessage('app:ready', {}));
            return embeddedRoom.join();
        });

    
        describe('enableCamera()', ()=>{
            it('should enable camera', ()=>{
                embeddedRoom.enableCamera('fake-constraints');

                expect(mediaSources.camera.enable).toHaveBeenCalledOnceWith('fake-constraints');
            });

            it('should return result of command', () =>{
                mediaSources.camera.enable.withArgs('fake-constraints')
                    .and.returnValue('fake-result');

                expect(embeddedRoom.enableCamera('fake-constraints')).toBe('fake-result');
            });
        });

        describe('disableCamera()', ()=>{
            it('should disable camera', ()=>{
                embeddedRoom.disableCamera();

                expect(mediaSources.camera.disable).toHaveBeenCalledOnceWith();
            });

            it('should return result of command', () =>{
                mediaSources.camera.disable.and.returnValue('fake-result');

                expect(embeddedRoom.disableCamera()).toBe('fake-result');
            });
        });

        describe('updateCamera()', ()=>{
            it('should update camera', ()=>{
                embeddedRoom.updateCamera('fake-constraints');

                expect(mediaSources.camera.update).toHaveBeenCalledOnceWith('fake-constraints');
            });

            it('should return result of command', () =>{
                mediaSources.camera.update.withArgs('fake-constraints').and.returnValue('fake-result');

                expect(embeddedRoom.updateCamera('fake-constraints')).toBe('fake-result');
            });
        });

        describe('getCameraState()', ()=>{
            it('should return camera state', () =>{
                mediaSources.camera.getState.and.returnValue('fake-result');

                expect(embeddedRoom.getCameraState()).toBe('fake-result');
            });
        });

        describe('enableMicrophone()', ()=>{
            it('should enable microphone', ()=>{
                embeddedRoom.enableMicrophone('fake-constraints');

                expect(mediaSources.microphone.enable).toHaveBeenCalledOnceWith('fake-constraints');
            });

            it('should return result of command', () =>{
                mediaSources.microphone.enable.withArgs('fake-constraints')
                    .and.returnValue('fake-result');

                expect(embeddedRoom.enableMicrophone('fake-constraints')).toBe('fake-result');
            });
        });

        describe('disableMicrophone()', ()=>{
            it('should disable microphone', ()=>{
                embeddedRoom.disableMicrophone();

                expect(mediaSources.microphone.disable).toHaveBeenCalledOnceWith();
            });

            it('should return result of command', () =>{
                mediaSources.microphone.disable.and.returnValue('fake-result');

                expect(embeddedRoom.disableMicrophone()).toBe('fake-result');
            });
        });

        describe('updateMicrophone()', ()=>{
            it('should update microphone', ()=>{
                embeddedRoom.updateMicrophone('fake-constraints');

                expect(mediaSources.microphone.update).toHaveBeenCalledOnceWith('fake-constraints');
            });

            it('should return result of command', () =>{
                mediaSources.microphone.update.withArgs('fake-constraints').and.returnValue('fake-result');

                expect(embeddedRoom.updateMicrophone('fake-constraints')).toBe('fake-result');
            });
        });

        describe('getMicrophoneState()', ()=>{
            it('should return microphone state', () =>{
                mediaSources.microphone.getState.and.returnValue('fake-result');

                expect(embeddedRoom.getMicrophoneState()).toBe('fake-result');
            });
        });

        describe('enableScreenSharing()', ()=>{
            it('should enable screenSharing', ()=>{
                embeddedRoom.enableScreenSharing('fake-constraints');

                expect(mediaSources.screenSharing.enable).toHaveBeenCalledOnceWith('fake-constraints');
            });

            it('should return result of command', () =>{
                mediaSources.screenSharing.enable.withArgs('fake-constraints')
                    .and.returnValue('fake-result');

                expect(embeddedRoom.enableScreenSharing('fake-constraints')).toBe('fake-result');
            });
        });

        describe('disableScreenSharing()', ()=>{
            it('should disable screenSharing', ()=>{
                embeddedRoom.disableScreenSharing();

                expect(mediaSources.screenSharing.disable).toHaveBeenCalledOnceWith();
            });

            it('should return result of command', () =>{
                mediaSources.screenSharing.disable.and.returnValue('fake-result');

                expect(embeddedRoom.disableScreenSharing()).toBe('fake-result');
            });
        });

        describe('getScreenSharingState()', ()=>{
            it('should return screenSharing state', () =>{
                mediaSources.screenSharing.getState.and.returnValue('fake-result');

                expect(embeddedRoom.getScreenSharingState()).toBe('fake-result');
            });
        });
    });
});