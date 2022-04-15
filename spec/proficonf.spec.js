import { DependencyContainer } from '../src/dependency-container';
import { factoryMockHelper } from './setup';
import { Proficonf } from '../src/proficonf';

describe('Proficonf', () => {
    let proficonf;
    let eventEmitterFactory;
    let eventEmitter;
    let iframeLoaderFactory;
    let iframeLoader;
    let iframeMessengerFactory;
    let iframeMessenger;
    let window;
    let nanoid;
    let eventForwarderFactory;
    let eventForwarder;
    let document;
    let iframeElement;
    let rootElement;
    let interfaceConfigSerializer;
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

        interfaceConfigSerializer = jasmine.createSpyObj('interfaceConfigSerializer', ['serializeToString', 'serializeToObject']);
        interfaceConfigSerializer.serializeToString.and.returnValue('fake-serialized-ui-config');
        interfaceConfigSerializer.serializeToObject.withArgs({
            removeElements: ['fake-element'],
            customPrimaryColor: 'fake-color',
            customLogoSrc: 'fake-logo-src',
            displayMode: 'fake-display-mode'
        }).and.returnValue('fake-serialized-object');

        DependencyContainer
            .set('eventEmitterFactory', eventEmitterFactory)
            .set('iframeLoaderFactory', iframeLoaderFactory)
            .set('iframeMessengerFactory', iframeMessengerFactory)
            .set('nanoid', nanoid)
            .set('window', window)
            .set('document', document)
            .set('interfaceConfigSerializer', interfaceConfigSerializer)
            .set('eventForwarderFactory', eventForwarderFactory)
            .set('location', {
                protocol: 'http:',
                stub: true
            });

        proficonf = new Proficonf({
            rootElement,
            meetingUrl: 'https://fake.com/j/meeting-alias',
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
            ui: {
                disableElements: ['element-1']
            },
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
                expect(iframeElement.name).toBe('ProficonfEmbeddedRoom-meeting-alias');
                expect(iframeElement.id).toBe('ProficonfEmbeddedRoom-meeting-alias');
            });

            it('should initialize iframe styles', () => {
                expect(iframeElement.style['border']).toBe('0');
                expect(iframeElement.style['fake-style-prop']).toBe('fake-style-prop-value');
                expect(iframeElement.style['width']).toBe('fake-width');
                expect(iframeElement.style['height']).toBe('fake-height');
            });

            it('should set default values for height and width', () => {
                new Proficonf({
                    rootElement,
                    meetingUrl: 'https://fake.com/j/meeting-alias',
                    user: {
                        name: 'fake-user-name',
                        locale: 'fake-locale'
                    },
                    iframe: {
                        style: {
                            'fake-style-prop': 'fake-style-prop-value',
                        }
                    },
                    ui: {
                        disableLeftBar: 'fake-disable-left-bar'
                    },
                });

                expect(iframeElement.style['width']).toBe('640px');
                expect(iframeElement.style['height']).toBe('450px');
            });
        });
    });

    it('has iframeElement getter', () => {
        expect(proficonf.getIframeElement()).toBe(iframeElement);
    });

    it('has rootElement getter', () => {
        expect(proficonf.getRootElement()).toBe(rootElement);
    });

    it('should allow to subscribe for events', () => {
        proficonf.on('x', 'y');

        expect(eventEmitter.on).toHaveBeenCalledOnceWith('x', 'y');
    });

    it('should allow to subscribe for events once', () => {
        proficonf.once('x', 'y');

        expect(eventEmitter.once).toHaveBeenCalledOnceWith('x', 'y');
    });

    it('should allow to unsubscribe from events', () => {
        proficonf.removeListener('x', 'y');

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
            await proficonf.join();

            expect(rootElement.appendChild).toHaveBeenCalledOnceWith(iframeElement);
        });

        it('should initialize iframeLoader', async () => {
            await proficonf.join();

            expect(iframeLoaderFactory.create).toHaveBeenCalledOnceWith(iframeElement);
        });

        it('should load iframe url', async () => {
            await proficonf.join();

            expect(iframeLoader.loadUrl).toHaveBeenCalledOnceWith(
                'https://fake.com/j/meeting-alias?embedded=1&locale=fake-locale&un=fake-user-name&ui=fake-serialized-ui-config'
            );
        });

        it('should use user token when provided for url', async () => {
            proficonf = new Proficonf({
                rootElement,
                meetingUrl: 'https://fake.com/j/meeting-alias',
                user: {
                    token: 'fake-token'
                },
                iframe: {
                    width: 'fake-width',
                    height: 'fake-height',
                    style: {
                        'fake-style-prop': 'fake-style-prop-value',
                    }
                },
                ui: {
                    disableLeftBar: 'fake-disable-left-bar'
                },
            });

            await proficonf.join();

            expect(iframeLoader.loadUrl).toHaveBeenCalledOnceWith(
                'https://fake.com/j/meeting-alias?embedded=1&t=fake-token&ui=fake-serialized-ui-config'
            );
        });

        it('Should createe iframe messenger', async () => {
            await proficonf.join();

            expect(iframeMessengerFactory.create).toHaveBeenCalledOnceWith({
                targetOrigin: 'https://fake.com',
                targetWindow: iframeElement.contentWindow,
                window,
                nanoid,
                correlationId: 'meeting-alias'
            });
        });

        it('Should create eventForwarder', async () => {
            await proficonf.join();

            expect(eventForwarderFactory.create).toHaveBeenCalledOnceWith({
                iframeMessenger,
                eventEmitter
            });
        });

        it('Should initialize eventForwarder', async () => {
            await proficonf.join();

            expect(eventForwarder.initialize).toHaveBeenCalledOnceWith();
        });

        it('Should initialize iframeMessenger', async () => {
            await proficonf.join();

            expect(iframeMessenger.initialize).toHaveBeenCalledOnceWith();
        });

        it('Should send initialize command', async () => {
            await proficonf.join();

            expect(iframeMessenger.sendMessage).toHaveBeenCalledOnceWith('initialize', {});
        });

        it('Should throw on initialization timeout', async () => {
            iframeMessenger.sendMessage
                .withArgs('initialize', {})
                .and.callFake(() => {
                    jasmine.clock().tick(300001);
                });

            await expectAsync(
                proficonf.join()
            ).toBeRejectedWith(new Error('App initialization timeout'));
        });
    });

    describe('[joined]', () => {
        beforeEach(() => {
            iframeMessenger.sendMessage
                .withArgs('initialize', {})
                .and.callFake(() => emitMessage('app:ready', {}));
            return proficonf.join();
        });

        async function testCommandProxy({
            command,
            functionName = undefined,
            expectedRequestPayload = undefined,
            functionArguments = []
        }) {
            it(`should proxy command: ${command}`, async () => {
                const commandArguments = expectedRequestPayload
                    ? [command, expectedRequestPayload]
                    : [command];
                iframeMessenger.sendRequest.withArgs(...commandArguments).and.resolveTo('fake-result');

                await expectAsync(proficonf[functionName || command](...functionArguments)).toBeResolvedTo('fake-result');
            });
        }

        describe('getParticipants()', () => {
            testCommandProxy({ command: 'getParticipants' });
        });

        describe('getParticipantById()', () => {
            testCommandProxy({
                command: 'getParticipantById',
                functionArguments: ['fake-id'],
                expectedRequestPayload: { id: 'fake-id' }
            });
        });

        describe('blockParticipant()', () => {
            testCommandProxy({
                command: 'blockParticipant',
                functionArguments: ['fake-id'],
                expectedRequestPayload: { id: 'fake-id' }
            });
        });

        describe('unblockParticipant()', () => {
            testCommandProxy({
                command: 'unblockParticipant',
                functionArguments: ['fake-id'],
                expectedRequestPayload: { id: 'fake-id' }
            });
        });

        describe('banParticipant()', () => {
            testCommandProxy({
                command: 'banParticipant',
                functionArguments: ['fake-id'],
                expectedRequestPayload: { id: 'fake-id' }
            });
        });

        describe('setUserName()', () => {
            testCommandProxy({
                command: 'setUserName',
                functionArguments: ['fake-name'],
                expectedRequestPayload: { name: 'fake-name' }
            });
        });

        describe('setUserLocale()', () => {
            testCommandProxy({
                command: 'setUserLocale',
                functionArguments: ['fake-locale'],
                expectedRequestPayload: { locale: 'fake-locale' }
            });
        });

        describe('enableChatForParticipant()', () => {
            testCommandProxy({
                command: 'setChatState',
                functionName: 'enableChatForParticipant',
                functionArguments: ['fake-id'],
                expectedRequestPayload: { participantId: 'fake-id', isChatAllowed: true }
            });
        });

        describe('disableChatForParticipant()', () => {
            testCommandProxy({
                command: 'setChatState',
                functionName: 'disableChatForParticipant',
                functionArguments: ['fake-id'],
                expectedRequestPayload: { participantId: 'fake-id', isChatAllowed: false }
            });
        });

        describe('disableParticipantMicrophone()', () => {
            testCommandProxy({
                command: 'disableParticipantMicrophone',
                functionArguments: ['fake-id'],
                expectedRequestPayload: { id: 'fake-id' }
            });
        });

        describe('askToEnableParticipantMicrophone()', () => {
            testCommandProxy({
                command: 'askToEnableParticipantMicrophone',
                functionArguments: ['fake-id'],
                expectedRequestPayload: { id: 'fake-id' }
            });
        });

        describe('blockParticipantMicrophone()', () => {
            testCommandProxy({
                command: 'blockParticipantMicrophone',
                functionArguments: ['fake-id'],
                expectedRequestPayload: { id: 'fake-id' }
            });
        });

        describe('unblockParticipantMicrophone()', () => {
            testCommandProxy({
                command: 'unblockParticipantMicrophone',
                functionArguments: ['fake-id'],
                expectedRequestPayload: { id: 'fake-id' }
            });
        });

        describe('askToEnableParticipantCamera()', () => {
            testCommandProxy({
                command: 'askToEnableParticipantCamera',
                functionArguments: ['fake-id'],
                expectedRequestPayload: { id: 'fake-id' }
            });
        });

        describe('blockParticipantCamera()', () => {
            testCommandProxy({
                command: 'blockParticipantCamera',
                functionArguments: ['fake-id'],
                expectedRequestPayload: { id: 'fake-id' }
            });
        });

        describe('unblockParticipantCamera()', () => {
            testCommandProxy({
                command: 'unblockParticipantCamera',
                functionArguments: ['fake-id'],
                expectedRequestPayload: { id: 'fake-id' }
            });
        });

        describe('enableCamera()', () => {
            testCommandProxy({
                command: 'enableCamera',
                functionArguments: [{ stub: true }],
                expectedRequestPayload: { constraints: { stub: true } }
            });
        });

        describe('disableCamera()', () => {
            testCommandProxy({
                command: 'disableCamera'
            });
        });

        describe('setCameraDevice()', () => {
            testCommandProxy({
                command: 'setCameraDevice',
                functionArguments: ['fake-device-id'],
                expectedRequestPayload: { deviceId: 'fake-device-id' }
            });
        });

        describe('getCameraState()', () => {
            testCommandProxy({
                command: 'getCameraState',
            });
        });

        describe('enableMicrophone()', () => {
            testCommandProxy({
                command: 'enableMicrophone',
                functionArguments: [{ stub: true }],
                expectedRequestPayload: { constraints: { stub: true } }
            });
        });

        describe('setMicrophoneDevice()', () => {
            testCommandProxy({
                command: 'setMicrophoneDevice',
                functionArguments: ['fake-device'],
                expectedRequestPayload: { deviceId: 'fake-device' }
            });
        });

        describe('disableMicrophone()', () => {
            testCommandProxy({
                command: 'disableMicrophone'
            });
        });

        describe('getDeviceList()', () => {
            testCommandProxy({
                command: 'getDeviceList'
            });
        });

        describe('switchCamera()', () => {
            testCommandProxy({
                command: 'switchCamera'
            });
        });

        describe('switchMicrophone()', () => {
            testCommandProxy({
                command: 'switchMicrophone'
            });
        });

        describe('getMicrophoneState()', () => {
            testCommandProxy({
                command: 'getMicrophoneState'
            });
        });

        describe('startScreenSharing()', () => {
            testCommandProxy({
                command: 'startScreenSharing',
                functionArguments: [{ stub: true }],
                expectedRequestPayload: { constraints: { stub: true } }
            });
        });

        describe('getScreenSharingState()', () => {
            testCommandProxy({
                command: 'getScreenSharingState',
            });
        });

        describe('stopScreenSharing()', () => {
            testCommandProxy({
                command: 'stopScreenSharing',
            });
        });

        describe('disableParticipantMicrophone()', () => {
            testCommandProxy({
                command: 'disableParticipantMicrophone',
                functionArguments: ['fake-id'],
                expectedRequestPayload: { id: 'fake-id' }
            });
        });

        describe('disableParticipantCamera()', () => {
            testCommandProxy({
                command: 'disableParticipantCamera',
                functionArguments: ['fake-id'],
                expectedRequestPayload: { id: 'fake-id' }
            });
        });

        describe('blockParticipantMicrophone()', () => {
            testCommandProxy({
                command: 'blockParticipantMicrophone',
                functionArguments: ['fake-id'],
                expectedRequestPayload: { id: 'fake-id' }
            });
        });

        describe('blockParticipantCamera()', () => {
            testCommandProxy({
                command: 'blockParticipantCamera',
                functionArguments: ['fake-id'],
                expectedRequestPayload: { id: 'fake-id' }
            });
        });

        describe('unblockParticipantCamera()', () => {
            testCommandProxy({
                command: 'unblockParticipantCamera',
                functionArguments: ['fake-id'],
                expectedRequestPayload: { id: 'fake-id' }
            });
        });

        describe('unblockParticipantMicrophone()', () => {
            testCommandProxy({
                command: 'unblockParticipantMicrophone',
                functionArguments: ['fake-id'],
                expectedRequestPayload: { id: 'fake-id' }
            });
        });

        describe('setParticipantRole()', () => {
            testCommandProxy({
                command: 'setParticipantRole',
                functionArguments: ['fake-id', 'fake-role' ],
                expectedRequestPayload: { id: 'fake-id', role: 'fake-role' }
            });
        });

        describe('setScreenLayout()', () => {
            testCommandProxy({
                command: 'setScreenLayout',
                functionArguments: ['fake-mode'],
                expectedRequestPayload: { layout: 'fake-mode' }
            });
        });

        describe('startMeeting()', () => {
            testCommandProxy({
                command: 'startMeeting',
            });
        });

        describe('endMeeting()', () => {
            testCommandProxy({
                command: 'endMeeting',
            });
        });

        describe('startRecording()', () => {
            testCommandProxy({
                command: 'startRecording',
                functionArguments: ['fake-ui-state'],
                expectedRequestPayload: { uiState: 'fake-ui-state' },
            });
        });

        describe('setRecordingConfig()', () => {
            testCommandProxy({
                command: 'setRecordingConfig',
                functionArguments: ['fake-ui-state'],
                expectedRequestPayload: { uiState: 'fake-ui-state' },
            });
        });

        describe('stopRecording()', () => {
            testCommandProxy({
                command: 'stopRecording',
            });
        });

        describe('getRecordingState()', () => {
            testCommandProxy({
                command: 'getRecordingState',
            });
        });

        describe('sendChatMessage()', () => {
            testCommandProxy({
                command: 'sendChatMessage',
                functionArguments: ['fake-message'],
                expectedRequestPayload: { message: 'fake-message' },
            });
        });

        describe('updateUIConfig()', () => {
            testCommandProxy({
                command: 'updateUIConfig',
                functionArguments: [{
                    removeElements: ['fake-element'],
                    customPrimaryColor: 'fake-color',
                    customLogoSrc: 'fake-logo-src',
                    displayMode: 'fake-display-mode'
                }],
                expectedRequestPayload: 'fake-serialized-object'
            });
        });

        describe('startStream()', () => {
            testCommandProxy({
                command: 'startStream',
                functionArguments: [{ serverUrl: 'fake-server-url', streamKey: 'fake-stream-key' }],
                expectedRequestPayload: { serverUrl: 'fake-server-url', streamKey: 'fake-stream-key' },
            });
        });

        describe('stopStream()', () => {
            testCommandProxy({
                command: 'stopStream',
                functionArguments: [{ serverUrl: 'fake-server-url', streamKey: 'fake-stream-key' }],
                expectedRequestPayload: { serverUrl: 'fake-server-url', streamKey: 'fake-stream-key' },
            });
        });

        describe('stopAllStreams()', () => {
            testCommandProxy({
                command: 'stopAllStreams',
            });
        });
    });
});
