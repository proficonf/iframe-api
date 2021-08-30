import { Camera } from './camera';
import { Microphone } from './microphone';
import { ScreenSharing } from './screen-sharing';

export class MediaSources {
    constructor({ iframeMessenger }) {
        this._iframeMessenger = iframeMessenger;

        this._camera = new Camera(this._iframeMessenger);
        this._microphone = new Microphone(this._iframeMessenger);
        this._screenSharing = new ScreenSharing(this._iframeMessenger);
    }

    listAvailableDevices() {
        return this._iframeMessenger.sendRequest('listAvailableDevices');
    }

    get microphone() {
        return this._microphone;
    }

    get camera() {
        return this._camera;
    }

    get screenSharing() {
        return this._screenSharing;
    }
}