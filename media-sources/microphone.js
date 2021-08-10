// TODO: keep status locally synchronized storing it here
export class Microphone {
    constructor( iframeMessenger ){
        this._iframeMessenger = iframeMessenger;
    }

    enable(constraints){
        return this._iframeMessenger.sendRequestToIframe('enableMicrophone', {
            constraints
        });
    }

    disable(){
        return this._iframeMessenger.sendRequestToIframe('disableMicrophone');
    }

    switch(constraints){
        return this._iframeMessenger.sendRequestToIframe(
            'updateMicrophoneDevice',
            { constraints }
        );
    }

    getState(){
        return this._iframeMessenger.sendRequestToIframe('getMicrophoneState');
    }
}
