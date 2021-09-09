import { InterfaceConfigSerializer } from '../src/interface-config-serializer';

describe('InterfaceConfigSerializer', () => {
    let lzString;
    let serializer;

    beforeEach(() => {
        lzString = jasmine.createSpyObj('lzString', ['compressToEncodedURIComponent']);
        serializer = new InterfaceConfigSerializer({
            lzString,
            serializationOrder: ['xField', 'yField', 'zField', 'aField']
        });
    });

    describe('serializeToString()', () => {
        it('should replace true values to 1', () => {
            serializer.serializeToString({
                aField: true,
                xField: true,
                yField: true,
                zField: true
            });

            expect(lzString.compressToEncodedURIComponent).toHaveBeenCalledOnceWith('[1,1,1,1]');
        });

        it('should replace false values to 0', () => {
            serializer.serializeToString({
                aField: false,
                xField: false,
                yField: false,
                zField: false
            });

            expect(lzString.compressToEncodedURIComponent).toHaveBeenCalledOnceWith('[0,0,0,0]');
        });

        it('should keep serialization order', () => {
            serializer.serializeToString({
                xField: 'fake-x',
                aField: 'fake-a',
                yField: 'fake-y',
                zField: 'fake-z',
                anotherField: 'fake-field'
            });

            expect(lzString.compressToEncodedURIComponent).toHaveBeenCalledOnceWith('["fake-x","fake-y","fake-z","fake-a"]');
        });

        it('should return result', () => {
            lzString.compressToEncodedURIComponent.and.returnValue('FakeResult');

            expect(serializer.serializeToString({
                xField: 'fake-x',
                aField: 'fake-a',
                yField: 'fake-y',
                zField: 'fake-z',
                anotherField: 'fake-field'
            })).toBe('FakeResult');
        });
    });
});
