import { IframeLoader } from '../src/iframe-loader';

describe('IframeLoader', () => {
    let loader;
    let iframe;

    beforeEach(() => {
        iframe = {
            handlers: new Map(),
            async emitEvent(event, payload) {
                const handler = this.handlers.get(event);
                await handler(payload);
            },
            addEventListener(event, handler) {
                this.handlers.set(event, handler);
            },
            removeEventListener: jasmine.createSpy('removeEventListener'),
            setAttribute: jasmine.createSpy('setAttribute')
        };

        loader = new IframeLoader(iframe);
    });

    describe('loadUrl()', () => {
        it('should set src attribute to iframe', async () => {
            loader.loadUrl('fake-url');

            await iframe.emitEvent('load');

            expect(iframe.setAttribute).toHaveBeenCalledOnceWith('src', 'fake-url');
        });

        describe('[on load]', () => {
            it('should resolve', async () => {
                const promise = loader.loadUrl('fake-url');

                await iframe.emitEvent('load');

                await expectAsync(promise).toBeResolved();
            });
        });

        describe('[on error]', () => {
            it('should reject', async () => {
                const promise = expectAsync(loader.loadUrl('fake-url')).toBeRejectedWith(
                    new Error('Fake error')
                );

                await iframe.emitEvent('error', new Error('Fake error'));

                await promise;
            });
        });
    });
});
