import { IframeMessenger } from '../src/iframe-messenger';
import { asyncHelper } from './setup';

describe('IframeMessenger', () => {
    let window;
    let channel;
    let nanoid;
    let targetWindow;

    beforeEach(() => {
        window = {
            handlers: new Map(),
            async emitEvent(event, payload) {
                const handler = window.handlers.get(event);
                await handler(payload);
            },
            addEventListener(event, handler) {
                this.handlers.set(event, handler);
            },
            removeEventListener: jasmine.createSpy('removeEventListener')
        };

        targetWindow = jasmine.createSpyObj('targetWindow', ['postMessage']);

        nanoid = jasmine.createSpy('nanoid');

        channel = new IframeMessenger({
            nanoid,
            window,
            targetWindow,
            correlationId: 'fake-meeting-id',
            targetOrigin: 'fake-target-origin'
        });
    });

    describe('initialize()', () => {
        it('should listen for messages from window', async () => {
            const spy = jasmine.createSpy('listener');
            channel.initialize();
            channel.addMessageHandler('fakeMessage', spy);

            await window.emitEvent('message', {
                origin: 'fake-target-origin',
                data: { command: 'fakeMessage', payload: 'fakePayload', correlationId: 'fake-meeting-id' }
            });

            expect(spy).toHaveBeenCalledOnceWith(
                'fakePayload'
            );
        });
    });

    describe('sendMessage()', () => {
        it('should send post message to targetWindow', () => {
            channel.sendMessage('fake-command', 'fake-payload');

            expect(targetWindow.postMessage).toHaveBeenCalledOnceWith(
                { command: 'fake-command', payload: 'fake-payload', correlationId: 'fake-meeting-id' },
                'fake-target-origin'
            );
        });
    });

    describe('sendReplyToIframeRequest()', () => {
        beforeEach(() => spyOn(channel, 'sendMessage'));

        it('should send post message to targetWindow', () => {
            channel.sendReplyToIframeRequest('fake-command', 'fake-command-id', 'fake-payload');

            expect(channel.sendMessage).toHaveBeenCalledOnceWith(
                're:fake-command:fake-command-id',
                'fake-payload'
            );
        });
    });

    describe('sendRequest()', () => {
        beforeEach(() => {
            channel.initialize();
            nanoid.and.returnValue('fake-generated-nanoid');
            spyOn(channel, 'sendMessage');
        });

        async function emitResponse(command, payload) {
            await window.emitEvent('message', {
                origin: 'fake-target-origin',
                data: {
                    command: `re:${command}:fake-generated-nanoid`,
                    payload,
                    correlationId: 'fake-meeting-id'
                }
            });

            await asyncHelper.waitForPromisesToSettle();
        }

        it('should send request to targetWindow', async () => {
            const promise = channel.sendRequest('fake-command', { stubPayload: true });

            await emitResponse('fake-command', 'fake-response');

            await promise;

            expect(channel.sendMessage).toHaveBeenCalledOnceWith(
                'fake-command', {
                    commandId: 'fake-generated-nanoid',
                    stubPayload: true
                }
            );
        });

        it('should resolve to response payload', async () => {
            const promise = channel.sendRequest('fake-command', { stubPayload: true });

            await emitResponse('fake-command', 'fake-response');

            await expectAsync(promise).toBeResolvedTo('fake-response');
        });

        it('should reject when payload has error', async () => {
            const promise = expectAsync(
                channel.sendRequest('fake-command', { stubPayload: true })
            ).toBeRejectedWith('fake-error');

            await emitResponse('fake-command', { error: 'fake-error' });

            await promise;
        });
    });

    describe('addMessageHandler()', () => {
        beforeEach(() => {
            channel.initialize();
        });

        it('should wait for specific command from targetWindow', async () => {
            const handler = jasmine.createSpy('fake-handler');

            channel.addMessageHandler('fake-command', handler);
            await window.emitEvent('message', {
                origin: 'fake-target-origin',
                data: {
                    command: 'fake-command',
                    payload: 'fake-payload',
                    correlationId: 'fake-meeting-id'
                }
            });

            expect(handler).toHaveBeenCalledOnceWith('fake-payload');
        });

        it('should not allow duplicates', async () => {
            const handler = jasmine.createSpy('fake-handler');

            channel.addMessageHandler('fake-command', handler);
            channel.addMessageHandler('fake-command', handler);
            channel.addMessageHandler('fake-command', handler);
            channel.addMessageHandler('fake-command', handler);

            await window.emitEvent('message', {
                origin: 'fake-target-origin',
                data: {
                    command: 'fake-command',
                    payload: 'fake-payload',
                    correlationId: 'fake-meeting-id'
                }
            });

            expect(handler).toHaveBeenCalledOnceWith('fake-payload');
        });

        it('should allow multiple handlers', async () => {
            const handler = jasmine.createSpy('fake-handler');
            const handler2 = jasmine.createSpy('fake-handler-2');

            channel.addMessageHandler('fake-command', handler);
            channel.addMessageHandler('fake-command', handler2);

            await window.emitEvent('message', {
                origin: 'fake-target-origin',
                data: {
                    command: 'fake-command',
                    payload: 'fake-payload',
                    correlationId: 'fake-meeting-id'
                }
            });

            expect(handler).toHaveBeenCalledOnceWith('fake-payload');
            expect(handler2).toHaveBeenCalledOnceWith('fake-payload');
        });
    });

    describe('removeMessageHandler()', () => {
        beforeEach(() => {
            channel.initialize();
        });

        it('should stop to wait for specific command from targetWindow', async () => {
            const handler = jasmine.createSpy('fake-handler');

            channel.addMessageHandler('fake-command', handler);
            channel.removeMessageHandler('fake-command', handler);

            await window.emitEvent('message', {
                origin: 'fake-target-origin',
                data: {
                    command: 'fake-command',
                    payload: 'fake-payload',
                    correlationId: 'fake-meeting-id'
                }
            });

            expect(handler).not.toHaveBeenCalled();
        });
    });

});
