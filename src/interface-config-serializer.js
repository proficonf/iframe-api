export class InterfaceConfigSerializer {
    constructor({ serializationOrder }) {
        this._serializationOrder = serializationOrder;
    }

    serializeToString(interfaceConfig) {
        const configValues = [];

        for (const configKey of this._serializationOrder) {
            let value = interfaceConfig[configKey];

            if (value === true) {
                value = 1;
            }

            if (value === false) {
                value = 0;
            }

            configValues.push(value);
        }

        return this._encodeBase64(JSON.stringify(configValues));
    }

    _encodeBase64(string) {
        return btoa(
            encodeURIComponent(string).replace(/%([0-9A-F]{2})/g,
            function toSolidBytes(match, p1) {
                return String.fromCharCode('0x' + p1);
            })
        );
    }
}
