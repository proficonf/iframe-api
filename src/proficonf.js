import { DependencyContainer } from './dependency-container';
const MEETING_ALIAS_PATTERN = /\/j\/([a-zA-Z0-9-_]+)/;

const IFRAME_ALLOW_POLICIES = [
    'camera',
    'microphone',
    'display-capture',
    'autoplay',
    'clipboard-write',
    'clipboard-read',
    'fullscreen',
];
const DEFAULT_WIDTH = '640px';
const DEFAULT_HEIGHT = '450px';
const APP_INITIALIZATION_TIMEOUT_MS = 20 * 1000; // 20 seconds to load conference

export class Proficonf {
    constructor({
        meetingUrl,
        rootElement = document.body,
        user = {},
        iframe: {
            width = DEFAULT_WIDTH,
            height = DEFAULT_HEIGHT,
            style = {}
        } = {},
        ui = {},
    }) {
        const aliasMatch = MEETING_ALIAS_PATTERN.exec(meetingUrl);
        this._meetingId = aliasMatch && aliasMatch[1];
        this._eventEmitter = DependencyContainer.get('eventEmitterFactory').create();
        this._rootElement = rootElement;
        this._meetingUrl = this._buildUrl({
            user,
            meetingUrl,
            interfaceConfig: ui,
        });
        this._iframeElement = this._createIframeElement({
            width,
            height,
            style
        });
    }

    static create(...args) {
        return new Proficonf(...args);
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

    leave() {
        return this._iframeMessenger.sendRequest('leave')
            .then(() => this._eventForwarder.dispose())
            .then(() => this._iframeMessenger.dispose());
    }

    dispose() {
        return this._iframeMessenger.sendRequest('leave')
            .then(() => this._eventForwarder.dispose())
            .then(() => this._iframeMessenger.dispose())
            .then(() => this._iframeElement.remove());
    }

    getIframeElement() {
        return this._iframeElement;
    }

    getRootElement() {
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

    getUserName() {
        return this._iframeMessenger.sendRequest('getUserName');
    }

    getUserLocale() {
        return this._iframeMessenger.sendRequest('getUserLocale');
    }

    getMeetingState() {
        return this._iframeMessenger.sendRequest('getMeetingState');
    }

    switchCamera() {
        return this._iframeMessenger.sendRequest('switchCamera');
    }

    disableCamera() {
        return this._iframeMessenger.sendRequest('disableCamera');
    }

    setCameraDevice(deviceId) {
        return this._iframeMessenger.sendRequest('setCameraDevice', {
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

    setMicrophoneDevice(deviceId) {
        return this._iframeMessenger.sendRequest('setMicrophoneDevice', {
            deviceId
        });
    }

    switchMicrophone() {
        return this._iframeMessenger.sendRequest('switchMicrophone');
    }

    getMicrophoneState() {
        return this._iframeMessenger.sendRequest('getMicrophoneState');
    }

    startScreenSharing(constraints) {
        return this._iframeMessenger.sendRequest('startScreenSharing', {
            constraints
        });
    }

    getScreenSharingState() {
        return this._iframeMessenger.sendRequest('getScreenSharingState');
    }

    stopScreenSharing() {
        return this._iframeMessenger.sendRequest('stopScreenSharing');
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

    renameParticipant(name) {
        return this._iframeMessenger.sendRequest('renameParticipant', { name });
    }

    setChatState({ participantId, isChatAllowed }) {
        return this._iframeMessenger.sendRequest(
            'setChatState',
            { participantId, isChatAllowed }
        );
    }

    disableParticipantMicrophone(participantId) {
        return this._iframeMessenger.sendRequest('disableParticipantMicrophone', { id: participantId });
    }

    askToEnableParticipantMicrophone(participantId) {
        return this._iframeMessenger.sendRequest('askToEnableParticipantMicrophone', { id: participantId });
    }

    blockParticipantMicrophone(participantId) {
        return this._iframeMessenger.sendRequest('blockParticipantMicrophone', { id: participantId });
    }

    unblockParticipantMicrophone(participantId) {
        return this._iframeMessenger.sendRequest('unblockParticipantMicrophone', { id: participantId });
    }

    disableParticipantCamera(participantId) {
        return this._iframeMessenger.sendRequest('disableParticipantCamera', { id: participantId });
    }

    askToEnableParticipantCamera(participantId) {
        return this._iframeMessenger.sendRequest('askToEnableParticipantCamera', { id: participantId });
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

    endMeeting() {
        return this._iframeMessenger.sendRequest('endMeeting');
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

    startStream({ serverUrl, streamKey }) {
        return this._iframeMessenger.sendRequest('startStream', { serverUrl, streamKey });
    }

    stopStream({ serverUrl, streamKey }) {
        return this._iframeMessenger.sendRequest('stopStream', { serverUrl, streamKey });
    }

    stopAllStreams() {
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

    off(event, listener) {
        this._eventEmitter.removeListener(event, listener);
    }

    updateUIConfig(values) {
        const config = DependencyContainer.get('interfaceConfigSerializer').serializeToObject({
            ...values
        });

        return this._iframeMessenger.sendRequest('updateUIConfig', config);
    }

    _initializeIframe() {
        this._rootElement.appendChild(this._iframeElement);
        return DependencyContainer.get('iframeLoaderFactory').create(this._iframeElement)
            .loadUrl(this._meetingUrl);
    }

    _createIframeMessenger() {
        const url = new URL(this._meetingUrl);

        this._iframeMessenger = DependencyContainer.get('iframeMessengerFactory').create({
            targetOrigin: url.origin,
            targetWindow: this._iframeElement.contentWindow,
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

    _createIframeElement({ width, height, style = {} }) {
        const iframeId = `ProficonfEmbeddedRoom-${this._meetingId}`;
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

    _buildUrl({ user, meetingUrl, interfaceConfig }) {
        const location = DependencyContainer.get('location');
        const url = new URL(meetingUrl);
        url.searchParams.append('embedded', '1');

        if (user.locale) {
            url.searchParams.append('locale', user.locale);
        }

        const serializedConfig = DependencyContainer.get('interfaceConfigSerializer').serializeToString(interfaceConfig);

        if (user.token) {
            url.searchParams.append('t', user.token);
        } else if (user.name) {
            url.searchParams.append('un', user.name);
        }

        url.searchParams.append('ui', serializedConfig);

        if (location.protocol !== 'https:' && location.protocol !== 'http:') {
            url.searchParams.append('skipAuth', '1');
        }

        return url.toString();
    }
}

