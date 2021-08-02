// TODO: keep status locally synchronized storing it here
export class Microphone {
    constructor( iframeMessenger ){
        this.iframeMessenger = iframeMessenger;
    }

    enable(){
        return this._iframeMessenger.sendRequestToIframe('mediaSources.enableMicrophone');
    }

    disable(){
        return this._iframeMessenger.sendRequestToIframe('mediaSources.disableMicrophone');
    }

    switch({ deviceId, constraints }){
        return this._iframeMessenger.sendRequestToIframe(
            'mediaSources.updateMicrophoneDevice',
            { deviceId, constraints }
        );
    }

    getStatus(){
        return this._iframeMessenger.sendRequestToIframe('mediaSources.getMicrophoneStatus');
    }
}
