// TODO: keep status locally synchronized storing it here
export class DisplayCapture {
    constructor( iframeMessenger ){
        this.iframeMessenger = iframeMessenger;
    }

    enable(){
        return this._iframeMessenger.sendRequestToIframe('mediaSources.enableDisplayCapture');
    }

    disable(){
        return this._iframeMessenger.sendRequestToIframe('mediaSources.disableDisplayCapture');
    }

    switch({ mediaTrack }){
        return this._iframeMessenger.sendRequestToIframe(
            'mediaSources.updateDisplayCapture',
            { mediaTrack }
        );
    }

    getStatus(){
        return this._iframeMessenger.sendRequestToIframe('mediaSources.getDisplayCaptureStatus');
    }
}
