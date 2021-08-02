import { EventEmitter } from 'events';
import { nanoid } from 'nanoid';
import { IframeLoader } from './iframe-loader';
import { IframeMessenger } from './iframe-messenger';
import { MediaSourcesManager } from './media-sources/media-sources-manager';

const APP_ORIGIN = 'https://app.proficonf.com';
const IFRAME_ALLOW_POLICIES = [
    'camera',
    'microphone',
    'display-capture', 
    'autoplay',
    'clipboard-write',
    'clipboard-read',
    'fullscreen',
    'speaker'
];
const DEFAULT_WIDTH = '100%';
const DEFAULT_HEIGHT = '100%';

class EmbeddedRoom {
    constructor({
        rootElement,
        user,
        meetingId,
        iframe: {
            width,
            height,
            style
        }
    }){
        this._eventEmitter = new EventEmitter();
        this._rootElement = rootElement;
        this._meetingUrl = this._buildUrl({
            user,
            meetingId,
        });
        this._iframeElement = this._createIframeElement({
            meetingId,
            width,
            height,
            style
        });
    }

    static create(...args){
        return new EmbeddedRoom(...args);
    }

    join(){
        return Promise.resolve()
            .then(()=> this._initializeIframe())
            .then(()=> this._createIframeMessenger())
            .then(()=> this._initCommandsBackend())
            .then(()=> this._iframeMessenger.initialize());   
    }

    get iframeElement(){
        return this._iframeElement;
    }

    get rootElement(){
        return this._rootElement;
    }

    get mediaSources(){
        return this._mediaSources;
    }

    on(event, listener){
        this._eventEmitter.on(event, listener);
    }

    once(event, listener){
        this._eventEmitter.once(event, listener);
    }

    removeEventListener(event, listener){
        this._eventEmitter.removeEventListener(event, listener);
    }

    _initializeIframe(){
        this._rootElement.appendChild(this._iframeElement);
        return new IframeLoader({ iframeElement: this.iframeElement})
            .loadUrl(this._meetingUrl);
    }

    _createIframeMessenger(){
        this._iframeMessenger = new IframeMessenger({
            targetWindow: this.iframeElement.contentWindow,
            window,
            nanoid
        });
    }

    _initCommandsBackend(){
        this._mediaSources = new MediaSourcesManager({ iframeMessenger: this._iframeMessenger });
    }

    _createIframeElement({ meetingId, width, height, style = {} }){
        const iframeId = `ProficonfEmbeddedRoom${meetingId}`;
        const iframe = document.createElement('iframe');

        iframe.allow = IFRAME_ALLOW_POLICIES.join('; ');
        iframe.name = iframeId;
        iframe.id = iframeId;
        iframe.style.border = 0;
        iframe.setAttribute('allowFullScreen', 'true');

        for(const [key, value] of Object.entries(style)){
            iframe.style[key] = value;
        }

        iframe.style.width = width || DEFAULT_WIDTH;
        iframe.style.height = height || DEFAULT_HEIGHT;

        return iframe;
    }

    _buildUrl({ user = {}, meetingId }){
        let url = `${APP_ORIGIN}/j/${meetingId}?embedded=1&appOrigin=${encodeURIComponent(location.origin)}`;

        if(user.token){
            url += `&userToken=${user.token}`;
        }
        if(user.name){
            url += `&userName=${encodeURIComponent(user.name)}`;
        }
        if(user.locale){
            url += `&userLocale=${user.locale}`;
        }

        return url;
    }
}

module.exports = EmbeddedRoom;
