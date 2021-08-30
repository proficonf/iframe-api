import { DependencyContainer } from './dependency-container';

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
const APP_INITIALIZATION_TIMEOUT_MS = 60000;
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
        appOrigin = APP_ORIGIN
    }) {
        this._eventEmitter = DependencyContainer.get('eventEmitterFactory').create();
        this._rootElement = rootElement;
        this._meetingId = meetingId;
        this._appOrigin = appOrigin;
        this._meetingUrl = this._buildUrl({
            user,
            meetingId,
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
        return this._mediaSources.camera.enable(constraints);
    }

    disableCamera() {
        return this._mediaSources.camera.disable();
    }

    updateCamera(constraints) {
        return this._mediaSources.camera.switch(constraints);
    }

    getCameraState() {
        return this._mediaSources.camera.getState();
    }

    enableMicrophone(constraints) {
        return this._mediaSources.microphone.enable(constraints);
    }

    disableMicrophone() {
        return this._mediaSources.microphone.disable();
    }

    updateMicrophone(constraints) {
        return this._mediaSources.microphone.switch(constraints);
    }

    getMicrophoneState() {
        return this._mediaSources.microphone.getState();
    }

    enableScreenSharing(constraints) {
        return this._mediaSources.screenSharing.enable(constraints);
    }

    disableScreenSharing() {
        return this._mediaSources.screenSharing.disable();
    }

    listAvailableDevices() {
        return this._mediaSources.listAvailableDevices();
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

    on(event, listener) {
        this._eventEmitter.on(event, listener);
    }

    once(event, listener) {
        this._eventEmitter.once(event, listener);
    }

    removeListener(event, listener) {
        this._eventEmitter.removeListener(event, listener);
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
        this._mediaSources = DependencyContainer.get('mediaSourcesFactory').create({
            iframeMessenger: this._iframeMessenger
        });
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

    _buildUrl({ user, meetingId }) {
        let url = `${this._appOrigin}/j/${meetingId}/?embedded=1`;

        if (user.token) {
            url += `&userToken=${user.token}`;
        }
        if (user.name) {
            url += `&userName=${encodeURIComponent(user.name)}`;
        }
        if (user.locale) {
            url += `&userLocale=${user.locale}`;
        }

        return url;
    }
}

