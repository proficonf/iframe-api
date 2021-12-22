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

        interfaceConfigSerializer = jasmine.createSpyObj('interfaceConfigSerializer', ['serializeToString']);
        interfaceConfigSerializer.serializeToString.withArgs({
            disableLeftBar: 'fake-disable-left-bar',
            disableTopBar: false,
            disableChatbutton: false,
            disableSharingCenterButton: false,
            disableSharedFilesButton: false,
            disableParticipantsListButton: false,
            disableDeviceControls: false,
            disableCameraControl: false,
            disableMicrophoneControl: false,
            disableLeaveButton: false,
            disableMeetingName: false,
            disableRoomLocker: false,
            disableTimer: false,
            disableQualityIndicator: false,
            disableInviteButton: false,
            disableRecordingControl: false,
            disableStreamingControl: false,
            disableDisplayModeButton: false,
            disableConfigButton: false,
            disableLogo: false,
            primaryColor: 'default',
            logoSrc: 'default',
            displayMode: 'default'
        }).and.returnValue('fake-serialized-ui-config');

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
            ui: {
                disableLeftBar: 'fake-disable-left-bar'
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
                    ui: {
                        disableLeftBar: 'fake-disable-left-bar'
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
                'fake-app-origin/j/fake-meeting-id/?embedded=1&un=fake-user-name&ul=fake-locale&ui=fake-serialized-ui-config'
            );
        });

        it('should use only user token when provided for url', async () => {
            embeddedRoom = new EmbeddedRoom({
                rootElement,
                meetingId: 'fake-meeting-id',
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
                appOrigin: 'fake-app-origin'
            });

            await embeddedRoom.join();

            expect(iframeLoader.loadUrl).toHaveBeenCalledOnceWith(
                'fake-app-origin/j/fake-meeting-id/?embedded=1&t=fake-token&ui=fake-serialized-ui-config'
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
                    jasmine.clock().tick(300001);
                });

            await expectAsync(
                embeddedRoom.join()
            ).toBeRejectedWith(new Error('App initialization timeout'));
        });
    });

    describe('[joined]', () => {
        beforeEach(() => {
            iframeMessenger.sendMessage
                .withArgs('initialize', {})
                .and.callFake(() => emitMessage('app:ready', {}));
            return embeddedRoom.join();
        });

        async function testCommandProxy({ command, expectedRequestPayload = undefined, functionArguments = undefined }) {
            it(`should proxy command: ${command}`, async () => {
                const commandArguments = expectedRequestPayload
                    ? [command, expectedRequestPayload]
                    : [command];
                iframeMessenger.sendRequest.withArgs(...commandArguments).and.resolveTo('fake-result');

                await expectAsync(embeddedRoom[command](functionArguments)).toBeResolvedTo('fake-result');
            });
        }

        describe('getParticipants()', () => {
            testCommandProxy({ command: 'getParticipants' });
        });

        describe('getParticipantById()', () => {
            testCommandProxy({
                command: 'getParticipantById',
                functionArguments: 'fake-id',
                expectedRequestPayload: { id: 'fake-id' }
            });
        });

        describe('blockParticipant()', () => {
            testCommandProxy({
                command: 'blockParticipant',
                functionArguments: 'fake-id',
                expectedRequestPayload: { id: 'fake-id' }
            });
        });

        describe('unblockParticipant()', () => {
            testCommandProxy({
                command: 'unblockParticipant',
                functionArguments: 'fake-id',
                expectedRequestPayload: { id: 'fake-id' }
            });
        });

        describe('banParticipant()', () => {
            testCommandProxy({
                command: 'banParticipant',
                functionArguments: 'fake-id',
                expectedRequestPayload: { id: 'fake-id' }
            });
        });

        describe('renameParticipant()', () => {
            testCommandProxy({
                command: 'renameParticipant',
                functionArguments: { firstName: 'fake-first-name', lastName: 'fake-last-name' },
                expectedRequestPayload: { firstName: 'fake-first-name', lastName: 'fake-last-name' }
            });
        });

        describe('toggleChat()', () => {
            testCommandProxy({
                command: 'toggleChat',
                functionArguments: { participantId: 'fake-id', isChatAllowed: 'fake-is-chat-allowed', stub: true },
                expectedRequestPayload: { participantId: 'fake-id', isChatAllowed: 'fake-is-chat-allowed' }
            });
        });

        describe('muteParticipantMicrophone()', () => {
            testCommandProxy({
                command: 'muteParticipantMicrophone',
                functionArguments: 'fake-id',
                expectedRequestPayload: { id: 'fake-id' }
            });
        });

        describe('askToUnmuteMicrophone()', () => {
            testCommandProxy({
                command: 'askToUnmuteMicrophone',
                functionArguments: 'fake-id',
                expectedRequestPayload: { id: 'fake-id' }
            });
        });

        describe('blockParticipantMicrophone()', () => {
            testCommandProxy({
                command: 'blockParticipantMicrophone',
                functionArguments: 'fake-id',
                expectedRequestPayload: { id: 'fake-id' }
            });
        });

        describe('unblockParticipantMicrophone()', () => {
            testCommandProxy({
                command: 'unblockParticipantMicrophone',
                functionArguments: 'fake-id',
                expectedRequestPayload: { id: 'fake-id' }
            });
        });

        describe('muteParticipantCamera()', () => {
            testCommandProxy({
                command: 'muteParticipantCamera',
                functionArguments: 'fake-id',
                expectedRequestPayload: { id: 'fake-id' }
            });
        });

        describe('askToUnmuteCamera()', () => {
            testCommandProxy({
                command: 'askToUnmuteCamera',
                functionArguments: 'fake-id',
                expectedRequestPayload: { id: 'fake-id' }
            });
        });

        describe('blockParticipantCamera()', () => {
            testCommandProxy({
                command: 'blockParticipantCamera',
                functionArguments: 'fake-id',
                expectedRequestPayload: { id: 'fake-id' }
            });
        });

        describe('unblockParticipantCamera()', () => {
            testCommandProxy({
                command: 'unblockParticipantCamera',
                functionArguments: 'fake-id',
                expectedRequestPayload: { id: 'fake-id' }
            });
        });

        describe('setParticipantRole()', () => {
            testCommandProxy({
                command: 'setParticipantRole',
                functionArguments: { participantId: 'fake-id', role: 'fake-role' },
                expectedRequestPayload: { id: 'fake-id', role: 'fake-role' }
            });
        });

        describe('enableCamera()', () => {
            testCommandProxy({
                command: 'enableCamera',
                functionArguments: { stub: true },
                expectedRequestPayload: { constraints: { stub: true } }
            });
        });

        describe('disableCamera()', () => {
            testCommandProxy({
                command: 'disableCamera'
            });
        });

        describe('updateCameraDevice()', () => {
            testCommandProxy({
                command: 'updateCameraDevice',
                functionArguments: 'fake-device-id',
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
                functionArguments: { stub: true },
                expectedRequestPayload: { constraints: { stub: true } }
            });
        });

        describe('updateMicrophoneDevice()', () => {
            testCommandProxy({
                command: 'updateMicrophoneDevice',
                functionArguments: 'fake-device',
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

        describe('enableScreenSharing()', () => {
            testCommandProxy({
                command: 'enableScreenSharing',
                functionArguments: { stub: true },
                expectedRequestPayload: { constraints: { stub: true } }
            });
        });

        describe('getScreenSharingState()', () => {
            testCommandProxy({
                command: 'getScreenSharingState',
            });
        });

        describe('disableScreenSharing()', () => {
            testCommandProxy({
                command: 'disableScreenSharing',
            });
        });

        describe('muteParticipantMicrophone()', () => {
            testCommandProxy({
                command: 'muteParticipantMicrophone',
                functionArguments: 'fake-id',
                expectedRequestPayload: { id: 'fake-id' }
            });
        });

        describe('muteParticipantCamera()', () => {
            testCommandProxy({
                command: 'muteParticipantCamera',
                functionArguments: 'fake-id',
                expectedRequestPayload: { id: 'fake-id' }
            });
        });

        describe('askToUnmuteMicrophone()', () => {
            testCommandProxy({
                command: 'askToUnmuteMicrophone',
                functionArguments: 'fake-id',
                expectedRequestPayload: { id: 'fake-id' }
            });
        });

        describe('askToUnmuteCamera()', () => {
            testCommandProxy({
                command: 'askToUnmuteCamera',
                functionArguments: 'fake-id',
                expectedRequestPayload: { id: 'fake-id' }
            });
        });

        describe('blockParticipantMicrophone()', () => {
            testCommandProxy({
                command: 'blockParticipantMicrophone',
                functionArguments: 'fake-id',
                expectedRequestPayload: { id: 'fake-id' }
            });
        });

        describe('blockParticipantCamera()', () => {
            testCommandProxy({
                command: 'blockParticipantCamera',
                functionArguments: 'fake-id',
                expectedRequestPayload: { id: 'fake-id' }
            });
        });

        describe('unblockParticipantCamera()', () => {
            testCommandProxy({
                command: 'unblockParticipantCamera',
                functionArguments: 'fake-id',
                expectedRequestPayload: { id: 'fake-id' }
            });
        });

        describe('unblockParticipantMicrophone()', () => {
            testCommandProxy({
                command: 'unblockParticipantMicrophone',
                functionArguments: 'fake-id',
                expectedRequestPayload: { id: 'fake-id' }
            });
        });

        describe('setParticipantRole()', () => {
            testCommandProxy({
                command: 'setParticipantRole',
                functionArguments: { participantId: 'fake-id', role: 'fake-role' },
                expectedRequestPayload: { id: 'fake-id', role: 'fake-role' }
            });
        });

        describe('setScreenLayout()', () => {
            testCommandProxy({
                command: 'setScreenLayout',
                functionArguments: 'fake-mode',
                expectedRequestPayload: { layout: 'fake-mode' }
            });
        });

        describe('startMeeting()', () => {
            testCommandProxy({
                command: 'startMeeting',
            });
        });

        describe('finishMeeting()', () => {
            testCommandProxy({
                command: 'finishMeeting',
            });
        });

        describe('startRecording()', () => {
            testCommandProxy({
                command: 'startRecording',
                functionArguments: 'fake-ui-state',
                expectedRequestPayload: { uiState: 'fake-ui-state' },
            });
        });

        describe('setRecordingConfig()', () => {
            testCommandProxy({
                command: 'setRecordingConfig',
                functionArguments: 'fake-ui-state',
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
                functionArguments: 'fake-message',
                expectedRequestPayload: { message: 'fake-message' },
            });
        });

        describe('updateUIConfig()', () => {
            testCommandProxy({
                command: 'updateUIConfig',
                functionArguments: { fake: true },
                expectedRequestPayload: {
                    disableLeftBar: false,
                    disableTopBar: false,
                    disableChatbutton: false,
                    disableSharingCenterButton: false,
                    disableSharedFilesButton: false,
                    disableParticipantsListButton: false,
                    disableDeviceControls: false,
                    disableCameraControl: false,
                    disableMicrophoneControl: false,
                    disableLeaveButton: false,
                    disableMeetingName: false,
                    disableRoomLocker: false,
                    disableTimer: false,
                    disableQualityIndicator: false,
                    disableInviteButton: false,
                    disableRecordingControl: false,
                    disableStreamingControl: false,
                    disableDisplayModeButton: false,
                    disableConfigButton: false,
                    disableLogo: false,
                    primaryColor: 'default',
                    logoSrc: 'default',
                    displayMode: 'default',
                    fake: true
                }
            });
        });

        describe('startStream()', () => {
            testCommandProxy({
                command: 'startStream',
                functionArguments: { serverUrl: 'fake-server-url', streamKey: 'fake-stream-key'},
                expectedRequestPayload: { serverUrl: 'fake-server-url', streamKey: 'fake-stream-key'},
            });
        });

        describe('stopStream()', () => {
            testCommandProxy({
                command: 'stopStream',
                functionArguments: { serverUrl: 'fake-server-url', streamKey: 'fake-stream-key'},
                expectedRequestPayload: { serverUrl: 'fake-server-url', streamKey: 'fake-stream-key'},
            });
        });

        describe('stopAllStreams()', () => {
            testCommandProxy({
                command: 'stopAllStreams',
            });
        });
    });
});
