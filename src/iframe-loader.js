export class IframeLoader {
    constructor(iframeElement) {
        this._iframeElement = iframeElement;
    }

    loadUrl(url) {
        return new Promise((resolve, reject) => {
            this._iframeElement.addEventListener('load', resolve);
            this._iframeElement.addEventListener('error', reject);
            this._iframeElement.setAttribute('src', url);
        });
    }
}
