// TODO: keep status locally synchronized storing it here
export class Camera {
    constructor( iframeMessenger ){
        this.iframeMessenger = iframeMessenger;
    }

    enable(){
        return this._iframeMessenger.sendRequestToIframe('mediaSources.enableCamera');
    }

    disable(){
        return this._iframeMessenger.sendRequestToIframe('mediaSources.disableCamera');
    }

    switch({ deviceId, constraints }){
        return this._iframeMessenger.sendRequestToIframe(
            'mediaSources.updateCameraDevice',
            { deviceId, constraints }
        );
    }

    getStatus(){
        return this._iframeMessenger.sendRequestToIframe('mediaSources.getCameraStatus');
    }
}
