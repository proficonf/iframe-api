export class DependencyContainer {
    static _dependencies = {};

    static get(name){
        return this._dependencies[name];
    }

    static set(name, value){
        this._dependencies[name] = value;
        return this;
    }
}
