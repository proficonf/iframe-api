export class InterfaceConfigSerializer {
    constructor({ lzString, serializationOrder }) {
        this._lzString = lzString;
        this._serializationOrder = serializationOrder;
    }

    serializeToString(interfaceConfig) {
        const configValues = [];

        for (const configKey of this._serializationOrder) {
            let value = interfaceConfig[configKey];

            if (String(value).toLowerCase() === 'true') {
                value = 1;
            }

            if (String(value).toLowerCase() === 'false') {
                value = 0;
            }

            configValues.push(value);
        }

        return this._lzString.compressToEncodedURIComponent(
            JSON.stringify(configValues)
        );
    }
}
