const { EventEmitter } = require('events');

class EmbeddedRoom {
    constructor({
        iframeElement,
        config: {
            meetingUrl,
            meetingId,
        },
        user: {
            name,
            locale,
            token
        }
    }){

        this._iframeElement = iframeElement;
        this._eventEmitter = new EventEmitter();
    }

    get iframeElement(){
        return this._iframeElement;
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

    static create(config = {}){

    }
}