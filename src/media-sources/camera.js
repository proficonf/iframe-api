// TODO: keep status locally synchronized storing it here
export class Camera {
    constructor( iframeMessenger ) {
        this._iframeMessenger = iframeMessenger;
    }

    enable(constraints) {
        return this._iframeMessenger.sendRequestToIframe('enableCamera', {
            constraints
        });
    }

    disable() {
        return this._iframeMessenger.sendRequestToIframe('disableCamera');
    }

    switch(constraints) {
        return this._iframeMessenger.sendRequestToIframe(
            'updateCameraDevice',
            { constraints }
        );
    }

    getState() {
        return this._iframeMessenger.sendRequestToIframe('getCameraState');
    }
}
