import { SimpleFactory } from '../../src/utils/SimpleFactory';

class FakeClass {
    constructor(...args) {
        this.args = args;
    }
}

describe('SimpleFactory', () => {
    describe('static for()', () => {
        let factory;

        beforeEach(() => {
            factory = SimpleFactory.for(FakeClass);
        });

        it('should create a simple factory for the provided class', () => {
            const instance = factory.create();

            expect(instance).toBeInstanceOf(FakeClass);
            expect(instance.args).toEqual([]);
        });

        it('should create a simple factory for the provided class (with arguments)', () => {
            const instance = factory.create(
                'fake', 'args', 1, 2, true, false, [1, 2, 3], { hello: 'world' }
            );

            expect(instance).toBeInstanceOf(FakeClass);
            expect(instance.args).toEqual([
                'fake', 'args', 1, 2, true, false, [1, 2, 3], { hello: 'world' }
            ]);
        });
    });
});
