import { Camera } from './camera';
import { Microphone } from './microphone';
import { ScreenSharing } from './screen-sharing';

export class MediaSourcesManager {
    constructor({ iframeMessenger }){
        this._iframeMessenger = new iframeMessenger;

        this._camera = new Camera(this._iframeMessenger);
        this._microphone = new Microphone(this._iframeMessenger);
        this._screenSharing = new ScreenSharing(this._iframeMessenger);
    }

    listAvailableDevices(){
        return this._iframeMessenger.sendRequestToIframe('listAvailableDevices');
    }

    get microphone(){
        return this._microphone;
    }

    get camera(){
        return this._camera;
    }

    get screenSharing(){
        return this._screenSharing;
    }
}
