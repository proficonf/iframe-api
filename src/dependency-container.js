export const DependencyContainer  = {
    _dependencies: {},
    get(name) {
        return DependencyContainer._dependencies[name];
    },
    set(name, value) {
        DependencyContainer._dependencies[name] = value;
        return this;
    }
};
