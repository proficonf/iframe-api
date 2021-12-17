export class EventForwarder {
    constructor({ iframeMessenger, eventEmitter }) {
        this._iframeMessenger = iframeMessenger;
        this._eventEmitter = eventEmitter;
        this._handleEvent = this._handleEvent.bind(this);
    }

    initialize() {
        this._iframeMessenger.addMessageHandler('event', this._handleEvent);
    }

    dispose() {
        this._iframeMessenger.removeMessageHandler('event', this._handleEvent);
    }

    _handleEvent({ eventName, payload }) {
        this._eventEmitter.emit(eventName, {
            type: eventName,
            ...payload
        });
        this._eventEmitter.emit('*', { eventName, payload });
    }
}
