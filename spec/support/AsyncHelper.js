export class AsyncHelper {
    constructor(jasmine, setImmediate) {
        this._jasmine = jasmine;
        this._setImmediate = setImmediate;
    }

    resolveAfterMs(delayMs, value) {
        return new Promise(resolve => setTimeout(resolve, delayMs, value));
    }

    rejectAfterMs(delayMs, reason) {
        return new Promise((_, reject) => setTimeout(reject, delayMs, reason));
    }

    /**
     * Useful when setTimeout/setInterval or its callback is wrapped into a Promise.
     * Regular jasmine clock doesn't resolve promises.
     *
     * @param {number} [delayMs]
     */
    async tick(delayMs = 1) {
        await this.waitForPromisesToSettle();

        for (let i = 0; i < delayMs; i++) {
            try {
                this._jasmine.clock().tick(1);
            } catch (error) {
                // don't care
            }

            await Promise.resolve();
        }

        await this.waitForPromisesToSettle();
    }

    /**
     * It's similar to AsyncHelper#tick, but performs multiple skips.
     * Useful for asynchronous intervals.
     *
     * @example
     * // expects for some action to perform after 1 second, then after 5 seconds, then after 10 seconds
     * await AsyncHelper.tickAll([1000, 5000, 10000]);
     *
     * @param {number[]} delaysMs
     */
    async tickAll(delaysMs) {
        for (const delayMs of delaysMs) {
            await this.tick(delayMs);
        }
    }

    /**
     * Skips "a tick", so all current promises could settle (resolve/reject) themselves
     *
     * NOTE: Doesn't work in browser, only works in Node environment (because of `setImmediate` usage)
     */
    waitForPromisesToSettle() {
        return new Promise(resolve => this._setImmediate(resolve));
    }
}
