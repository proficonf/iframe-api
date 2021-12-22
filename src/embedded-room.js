import { DependencyContainer } from './dependency-container';
import { DEFAULT_UI_CONFIG } from './default-ui-config';

const APP_ORIGIN = 'https://app.proficonf.com';
const IFRAME_ALLOW_POLICIES = [
    'camera',
    'microphone',
    'display-capture',
    'autoplay',
    'clipboard-write',
    'clipboard-read',
    'fullscreen',
];
const DEFAULT_WIDTH = '100%';
const DEFAULT_HEIGHT = '100%';
const APP_INITIALIZATION_TIMEOUT_MS = 60 * 1000; // 60 seconds to load conference

export class EmbeddedRoom {
    constructor({
        rootElement,
        meetingId,
        user = {},
        iframe: {
            width = DEFAULT_WIDTH,
            height = DEFAULT_HEIGHT,
            style = {}
        } = {},
        ui = {},
        appOrigin = APP_ORIGIN
    }) {
        this._eventEmitter = DependencyContainer.get('eventEmitterFactory').create();
        this._rootElement = rootElement;
        this._meetingId = meetingId;
        this._appOrigin = appOrigin;
        this._meetingUrl = this._buildUrl({
            user,
            meetingId,
            interfaceConfig: { ...DEFAULT_UI_CONFIG, ...ui },
        });
        this._iframeElement = this._createIframeElement({
            meetingId,
            width,
            height,
            style
        });
    }

    static create(...args) {
        return new EmbeddedRoom(...args);
    }

    join() {
        return Promise.resolve()
            .then(() => this._initializeIframe())
            .then(() => this._createIframeMessenger())
            .then(() => this._initCommandsBackend())
            .then(() => this._iframeMessenger.initialize())
            .then(() => {
                const promise = new Promise((resolve, reject) => {
                    const initializationTimeout = setTimeout(() => {
                        reject(new Error('App initialization timeout'));
                    }, APP_INITIALIZATION_TIMEOUT_MS);

                    this._iframeMessenger.addMessageHandlerOnce('app:ready', (payload) => {
                        resolve(payload);
                        clearTimeout(initializationTimeout);
                    });
                });
                this._iframeMessenger.sendMessage('initialize', {});
                return promise;
            });
    }

    get iframeElement() {
        return this._iframeElement;
    }

    get rootElement() {
        return this._rootElement;
    }

    enableCamera(constraints) {
        return this._iframeMessenger.sendRequest('enableCamera', {
            constraints
        });
    }

    getDeviceList() {
        return this._iframeMessenger.sendRequest('getDeviceList');
    }

    switchCamera() {
        return this._iframeMessenger.sendRequest('switchCamera');
    }

    disableCamera() {
        return this._iframeMessenger.sendRequest('disableCamera');
    }

    updateCameraDevice(deviceId) {
        return this._iframeMessenger.sendRequest('updateCameraDevice', {
            deviceId
        });
    }

    getCameraState() {
        return this._iframeMessenger.sendRequest('getCameraState');
    }

    enableMicrophone(constraints) {
        return this._iframeMessenger.sendRequest('enableMicrophone', {
            constraints
        });
    }

    disableMicrophone() {
        return this._iframeMessenger.sendRequest('disableMicrophone');
    }

    updateMicrophoneDevice(deviceId) {
        return this._iframeMessenger.sendRequest('updateMicrophoneDevice', {
            deviceId
        });
    }

    switchMicrophone() {
        return this._iframeMessenger.sendRequest('switchMicrophone');
    }

    getMicrophoneState() {
        return this._iframeMessenger.sendRequest('getMicrophoneState');
    }

    enableScreenSharing(constraints) {
        return this._iframeMessenger.sendRequest('enableScreenSharing', {
            constraints
        });
    }

    getScreenSharingState() {
        return this._iframeMessenger.sendRequest('getScreenSharingState');
    }

    disableScreenSharing() {
        return this._iframeMessenger.sendRequest('disableScreenSharing');
    }

    getParticipants() {
        return this._iframeMessenger.sendRequest('getParticipants');
    }

    getParticipantById(id) {
        return this._iframeMessenger.sendRequest('getParticipantById', { id });
    }

    blockParticipant(id) {
        return this._iframeMessenger.sendRequest('blockParticipant', { id });
    }

    unblockParticipant(id) {
        return this._iframeMessenger.sendRequest('unblockParticipant', { id });
    }

    banParticipant(id) {
        return this._iframeMessenger.sendRequest('banParticipant', { id });
    }

    renameParticipant({ firstName, lastName }) {
        return this._iframeMessenger.sendRequest('renameParticipant', { firstName, lastName });
    }

    toggleChat({ participantId, isChatAllowed }) {
        return this._iframeMessenger.sendRequest(
            'toggleChat',
            { participantId, isChatAllowed }
        );
    }

    muteParticipantMicrophone(participantId) {
        return this._iframeMessenger.sendRequest('muteParticipantMicrophone', { id: participantId });
    }

    askToUnmuteMicrophone(participantId) {
        return this._iframeMessenger.sendRequest('askToUnmuteMicrophone', { id: participantId });
    }

    blockParticipantMicrophone(participantId) {
        return this._iframeMessenger.sendRequest('blockParticipantMicrophone', { id: participantId });
    }

    unblockParticipantMicrophone(participantId) {
        return this._iframeMessenger.sendRequest('unblockParticipantMicrophone', { id: participantId });
    }

    muteParticipantCamera(participantId) {
        return this._iframeMessenger.sendRequest('muteParticipantCamera', { id: participantId });
    }

    askToUnmuteCamera(participantId) {
        return this._iframeMessenger.sendRequest('askToUnmuteCamera', { id: participantId });
    }

    blockParticipantCamera(participantId) {
        return this._iframeMessenger.sendRequest('blockParticipantCamera', { id: participantId });
    }

    unblockParticipantCamera(participantId) {
        return this._iframeMessenger.sendRequest('unblockParticipantCamera', { id: participantId });
    }

    setParticipantRole({ participantId, role }) {
        return this._iframeMessenger.sendRequest('setParticipantRole', { id: participantId, role });
    }

    setScreenLayout(layout) {
        return this._iframeMessenger.sendRequest('setScreenLayout', { layout });
    }

    startMeeting() {
        return this._iframeMessenger.sendRequest('startMeeting');
    }

    finishMeeting() {
        return this._iframeMessenger.sendRequest('finishMeeting');
    }

    startRecording(uiState = null) {
        return this._iframeMessenger.sendRequest('startRecording', { uiState });
    }

    setRecordingConfig(uiState) {
        return this._iframeMessenger.sendRequest('setRecordingConfig', { uiState });
    }

    stopRecording() {
        return this._iframeMessenger.sendRequest('stopRecording');
    }

    getRecordingState() {
        return this._iframeMessenger.sendRequest('getRecordingState');
    }

    sendChatMessage(message) {
        return this._iframeMessenger.sendRequest('sendChatMessage', { message });
    }

    startStream({ serverUrl, streamKey }){
        return this._iframeMessenger.sendRequest('startStream', { serverUrl, streamKey });
    }

    stopStream({ serverUrl, streamKey }){
        return this._iframeMessenger.sendRequest('stopStream', { serverUrl, streamKey });
    }

    stopAllStreams(){
        return this._iframeMessenger.sendRequest('stopAllStreams');
    }

    on(event, listener) {
        this._eventEmitter.on(event, listener);
    }

    once(event, listener) {
        this._eventEmitter.once(event, listener);
    }

    removeListener(event, listener) {
        this._eventEmitter.removeListener(event, listener);
    }

    updateUIConfig(config) {
        return this._iframeMessenger.sendRequest('updateUIConfig', {
            ...DEFAULT_UI_CONFIG,
            ...config
        });
    }

    _initializeIframe() {
        this._rootElement.appendChild(this._iframeElement);
        return DependencyContainer.get('iframeLoaderFactory').create(this._iframeElement)
            .loadUrl(this._meetingUrl);
    }

    _createIframeMessenger() {
        this._iframeMessenger = DependencyContainer.get('iframeMessengerFactory').create({
            targetOrigin: this._appOrigin,
            targetWindow: this.iframeElement.contentWindow,
            window: DependencyContainer.get('window'),
            nanoid: DependencyContainer.get('nanoid'),
            correlationId: this._meetingId
        });
    }

    _initCommandsBackend() {
        this._eventForwarder = DependencyContainer.get('eventForwarderFactory').create({
            iframeMessenger: this._iframeMessenger,
            eventEmitter: this._eventEmitter
        });
        this._eventForwarder.initialize();
    }

    _createIframeElement({ meetingId, width, height, style = {} }) {
        const iframeId = `ProficonfEmbeddedRoom-${meetingId}`;
        const document = DependencyContainer.get('document');
        const iframe = document.createElement('iframe');

        iframe.allow = IFRAME_ALLOW_POLICIES.join('; ');
        iframe.name = iframeId;
        iframe.id = iframeId;
        iframe.style.border = '0';

        for (const [key, value] of Object.entries(style)) {
            iframe.style[key] = value;
        }

        iframe.style.width = width;
        iframe.style.height = height;

        return iframe;
    }

    _buildUrl({ user, meetingId, interfaceConfig }) {
        const location = DependencyContainer.get('location');
        let url = `${this._appOrigin}/j/${meetingId}/?embedded=1`;
        const serializedConfig = DependencyContainer.get('interfaceConfigSerializer').serializeToString(interfaceConfig);

        if (user.token) {
            url += `&t=${user.token}`;
        } else if (user.name) {
            url += `&un=${encodeURIComponent(user.name)}`;
            url += `&ul=${user.locale}`;
        }

        url += `&ui=${serializedConfig}`;

        if (location.protocol !== 'https:' && location.protocol !== 'http:') {
            url += '&skipAuth=1';
        }

        return url;
    }
}

