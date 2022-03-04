export class SimpleFactory {
    /**
     * @param {T} class$
     * @returns {{ create: (...args: ConstructorParameters<T>) => InstanceType<T> }}
     * @template {new (...args: any[]) => InstanceType<T>} T
     */
    static for(class$) {
        return {
            create: (...args) => new class$(...args),
        };
    }
}
