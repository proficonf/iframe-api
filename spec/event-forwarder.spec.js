import { EventForwarder } from '../src/event-forwarder';
import { EventEmitter } from 'events';

describe('EventForwarder', () => {
    let forwarder;
    let eventEmitter;
    let iframeMessenger;

    beforeEach(() => {
        iframeMessenger = {
            handlers: {},
            addMessageHandler(command, callback) {
                iframeMessenger.handlers[command] = callback;
            },
            removeMessageHandler: jasmine.createSpy('removeHandler'),
            emitCommand(name, payload) {
                iframeMessenger.handlers[name](payload);
            }
        };
        eventEmitter = new EventEmitter();
        forwarder = new EventForwarder({ iframeMessenger, eventEmitter });
    });

    describe('initialize()', () => {
        it('should listen for event command', () => {
            spyOn(iframeMessenger, 'addMessageHandler');

            forwarder.initialize();

            expect(iframeMessenger.addMessageHandler).toHaveBeenCalledOnceWith(
                'event', jasmine.any(Function)
            );
        });
    });

    describe('dispose()', () => {
        it('should stop listening for event command', () => {
            forwarder.dispose();

            expect(iframeMessenger.removeMessageHandler).toHaveBeenCalledOnceWith(
                'event', jasmine.any(Function)
            );
        });
    });

    describe('[event handling]', () => {
        beforeEach(() => forwarder.initialize());

        it('should forward event by name', () => {
            const spy = jasmine.createSpy('handler');
            eventEmitter.on('fake-event-name', spy);

            iframeMessenger.emitCommand('event', {
                eventName: 'fake-event-name',
                payload: 'fake-payload'
            });

            expect(spy).toHaveBeenCalledOnceWith('fake-payload');
        });

        it('should forward event by asterisk', () => {
            const spy = jasmine.createSpy('handler');
            eventEmitter.on('*', spy);

            iframeMessenger.emitCommand('event', {
                eventName: 'fake-event-name',
                payload: 'fake-payload'
            });

            expect(spy).toHaveBeenCalledOnceWith({
                eventName: 'fake-event-name',
                payload: 'fake-payload'
            });
        });
    });
});
