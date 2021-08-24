export class ScreenSharing {
    constructor( iframeMessenger ) {
        this._iframeMessenger = iframeMessenger;
    }

    enable(constraints) {
        return this._iframeMessenger.sendRequestToIframe('enableScreenSharing', {
            constraints
        });
    }

    disable() {
        return this._iframeMessenger.sendRequestToIframe('disableScreenSharing');
    }

    switch(mediaTrack) {
        return this._iframeMessenger.sendRequestToIframe(
            'updateScreenSharing',
            { mediaTrack }
        );
    }

    getState() {
        return this._iframeMessenger.sendRequestToIframe('getScreenSharingState');
    }
}
