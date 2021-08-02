export class IframeMessenger {
    constructor({
        targetWindow,
        window,
        nanoid
    }){
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
        this._targetWindow.postMessage({ command, payload }, '*');
    }

    sendRequestToIframe(command, payload){
        return new Promise((resolve, reject) => {
            const commandId = this._nanoid();
            this._addMessageHandlerOnce(`re:${command}:${commandId}`, (payload) => {
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

    sendReplyToIframeRequest(messageName, messageId,  payload){
        this.sendMessageToIframe(
            `re:${messageName}:${messageId}`,
            payload
        );
    }

    /** @param { MessageEvent } event */
    _handleIframeMessage(event){
        const { command, payload } = event.data;
        const handlers = this._messageHandlers.get(command);
        if(!handlers) {
            return;
        }
        for (const handler of handlers) {
            Promise.resolve().then(() => handler(payload))
                .catch((error) => console.warn('[IframeApi] Could not handle incoming message:', command, error));
        }
    }

    _addMessageHandlerOnce(command, handler){
        const _onceWrapper = (payload) =>{
            this.removeMessageHandler(command, _onceWrapper);
            return handler(payload);
        };
       
        this.addMessageHandler(command, _onceWrapper);
        return this;
    }
}