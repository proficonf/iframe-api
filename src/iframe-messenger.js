export class IframeMessenger {
    constructor({
        targetWindow,
        window,
        nanoid,
        correlationId,
        targetOrigin,
    }){
        this._targetOrigin = targetOrigin;
        this._correlationId = correlationId;
        this._targetWindow = targetWindow;
        this._messageHandlers = new Map();
        this._window = window;
        this._nanoid = nanoid;
        this._handleIframeMessage = this._handleIframeMessage.bind(this);
    }

    initialize() {
        this._window.addEventListener('message', this._handleIframeMessage);
    }

    dispose(){
        this._window.removeEventListener('message', this._handleIframeMessage);
        this._messageHandlers.clear();
    }

    addMessageHandler(command, handler){
        if(!this._messageHandlers.has(command)){
            this._messageHandlers.set(command, new Set());
        }
        this._messageHandlers.get(command).add(handler);
        return this;
    }

    removeMessageHandler(command, handler){
        if(this._messageHandlers.has(command)){
            this._messageHandlers.get(command).delete(handler);
        }
        return this;
    }

    sendMessageToIframe(command, payload){
        this._targetWindow.postMessage({
            command,
            payload,
            correlationId: this._correlationId
        }, this._targetOrigin);
    }

    sendRequestToIframe(command, payload = {}){
        return new Promise((resolve, reject) => {
            const commandId = this._nanoid();
            this.addMessageHandlerOnce(`re:${command}:${commandId}`, (payload) => {
                if (payload.error) {
                    reject(payload.error);
                    return;
                }
                resolve(payload);
            });
            this.sendMessageToIframe(command, {
                commandId,
                ...payload
            });
        });
    }

    sendReplyToIframeRequest(messageName, commandId,  payload){
        this.sendMessageToIframe(
            `re:${messageName}:${commandId}`,
            payload
        );
    }

    /** @param { MessageEvent } event */
    _handleIframeMessage(event){
        if(event.origin !== this._targetOrigin){
            return;
        }

        const { correlationId, command, payload } = event.data;

        if(correlationId !== this._correlationId){
            return;
        }
        
        const handlers = this._messageHandlers.get(command);
        if(!handlers) {
            return;
        }
        for (const handler of handlers) {
            Promise.resolve().then(() => handler(payload))
                .catch((error) => console.warn('[IframeApi] Could not handle incoming message:', command, error));
        }
    }

    addMessageHandlerOnce(command, handler){
        const _onceWrapper = (payload) =>{
            this.removeMessageHandler(command, _onceWrapper);
            return handler(payload);
        };
       
        this.addMessageHandler(command, _onceWrapper);
        return this;
    }
}