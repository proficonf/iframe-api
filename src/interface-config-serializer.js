export class InterfaceConfigSerializer {
    constructor({ elementsMapping }) {
        this._elementsMapping = elementsMapping;
    }

    serializeToString(interfaceConfig) {
        const config = this.serializeToObject(interfaceConfig);

        return this._encodeToBase64(JSON.stringify(config));
    }

    serializeToObject(interfaceConfig) {
        return {
            re: interfaceConfig.removeElements.map(elementName => this._elementsMapping[elementName] || elementName),
            pc: this._serializeValue(interfaceConfig.customPrimaryColor),
            l: this._serializeValue(interfaceConfig.customLogoSrc),
            dm: this._serializeValue(interfaceConfig.displayMode)
        };
    }

    _serializeValue(value) {
        if (value === true) {
            return 1;
        }

        if (value === false) {
            return 0;
        }

        if (!value) {
            return null;
        }

        return value;
    }

    _encodeToBase64(string) {
        return window.btoa(
            encodeURIComponent(string).replace(/%([0-9A-F]{2})/g,
                function toSolidBytes(match, p1) {
                    return String.fromCharCode('0x' + p1);
                })
        );
    }
}
