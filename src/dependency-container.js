export class DependencyContainer {
    static dependencies = {};

    static get(name){
        return DependencyContainer.dependencies[name];
    }

    static set(name, value){
        DependencyContainer.dependencies[name] = value;
        return this;
    }
}
