export class ScreenSharing {
    constructor( iframeMessenger ) {
        this._iframeMessenger = iframeMessenger;
    }

    enable(constraints) {
        return this._iframeMessenger.sendRequest('enableScreenSharing', {
            constraints
        });
    }

    disable() {
        return this._iframeMessenger.sendRequest('disableScreenSharing');
    }

    switch(mediaTrack) {
        return this._iframeMessenger.sendRequest(
            'updateScreenSharing',
            { mediaTrack }
        );
    }

    getState() {
        return this._iframeMessenger.sendRequest('getScreenSharingState');
    }
}
