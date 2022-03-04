export class FactoryMockHelper {
    constructor(jasmine) {
        this._jasmine = jasmine;
    }

    create(instance = null, name = 'unnamed') {
        return this._jasmine.createSpyObj(`${name}Factory`, { create: instance });
    }
}
