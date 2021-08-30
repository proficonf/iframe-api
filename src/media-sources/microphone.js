// TODO: keep status locally synchronized storing it here
export class Microphone {
    constructor( iframeMessenger ) {
        this._iframeMessenger = iframeMessenger;
    }

    enable(constraints) {
        return this._iframeMessenger.sendRequest('enableMicrophone', {
            constraints
        });
    }

    disable() {
        return this._iframeMessenger.sendRequest('disableMicrophone');
    }

    update(constraints) {
        return this._iframeMessenger.sendRequest(
            'updateMicrophoneDevice',
            { constraints }
        );
    }

    getState() {
        return this._iframeMessenger.sendRequest('getMicrophoneState');
    }
}
