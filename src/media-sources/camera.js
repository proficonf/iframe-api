// TODO: keep status locally synchronized storing it here
export class Camera {
    constructor( iframeMessenger ) {
        this._iframeMessenger = iframeMessenger;
    }

    enable(constraints) {
        return this._iframeMessenger.sendRequest('enableCamera', {
            constraints
        });
    }

    disable() {
        return this._iframeMessenger.sendRequest('disableCamera');
    }

    update(constraints) {
        return this._iframeMessenger.sendRequest(
            'updateCameraDevice',
            { constraints }
        );
    }

    getState() {
        return this._iframeMessenger.sendRequest('getCameraState');
    }
}
