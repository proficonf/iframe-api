import { InterfaceConfigSerializer } from '../src/interface-config-serializer';

describe('InterfaceConfigSerializer', () => {
    let serializer;

    beforeEach(() => {
        serializer = new InterfaceConfigSerializer({
            elementsMapping: {
                elementName: '[mappedName]',
                elementName2: '[mappedName2]'
            },
        });

        spyOn(serializer, '_encodeToBase64');
    });

    describe('serializeToString()', () => {
        it('should replace boolean values with number analog', () => {
            serializer.serializeToString({
                customLogoSrc: true,
                customPrimaryColor: true,
                displayMode: false,
                removeElements: []
            });

            expect(serializer._encodeToBase64).toHaveBeenCalledOnceWith(
                JSON.stringify({
                    re: [],
                    pc: 1,
                    l: 1,
                    dm: 0
                })
            );
        });

        it('should use null as default values', () => {
            serializer.serializeToString({
                removeElements: []
            });

            expect(serializer._encodeToBase64).toHaveBeenCalledOnceWith(
                JSON.stringify({
                    re: [],
                    pc: null,
                    l: null,
                    dm: null
                })
            );
        });

        it('should map removed elements', () => {
            serializer.serializeToString({
                customLogoSrc: '[customLogo]',
                customPrimaryColor: '[primaryColor]',
                displayMode: '[displayMode]',
                removeElements: ['elementName', 'elementName2', 'unknownElement']
            });

            expect(serializer._encodeToBase64).toHaveBeenCalledOnceWith(
                JSON.stringify({
                    re: ['[mappedName]', '[mappedName2]', 'unknownElement'],
                    pc: '[primaryColor]',
                    l: '[customLogo]',
                    dm: '[displayMode]'
                })
            );
        });
    });
});
