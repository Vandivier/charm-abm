// derived from https://github.com/backspaces/asx/blob/master/src/Animator.js

// This class optimizes speed stepping for viewless models which are not multiStep

// The Animator runs the Model's step() methods.

// Because not all models have the same animator requirements, we build a class
// for customization by the programmer.  See these URLs for more info:
// * [JavaScript timers docs](
//    https://developer.mozilla.org/en-US/docs/JavaScript/Timers)
// * [Using timers & requestAnimationFrame together](http://goo.gl/ymEEX)

class SimpleBlindAnimator {
    // Create initial animator for the model, specifying rate (fps) and
    // multiStep. Called by Model during initialization, use setRate to modify.
    // If multiStep, run the step() methods separately by
    constructor(model) {
        Object.assign(this, {
            model,
        });
        this.reset();
    }
    // start/stop model, called by Model.
    // Often used for debugging and resetting model.
    start() {
        if (!this.stopped) return // avoid multiple starts
        this.resetTimes();
        this.stopped = false;
        this.step();
    }
    stop() {
        this.stopped = true;
        if (this.animHandle) cancelAnimationFrame(this.animHandle);
        if (this.timeoutHandle) clearTimeout(this.timeoutHandle);
        this.animHandle = this.timeoutHandle = null;
    }
    // Internal utility: reset time instance variables
    resetTimes() {
        this.startMS = this.now();
        this.startTick = this.ticks;
    }
    // Reset used by model.reset when resetting model.
    reset() {
        this.stop();
        this.ticks = 0;
    }
    // Two handlers used by animation loop
    step() {
        this.ticks++;
        this.model.step();
    }
    // step the model once
    once() {
        this.step();
    }
    // Get current time, with high resolution timer if available
    now() {
        return performance.now()
    }
    // Time in ms since starting animator
    ms() {
        return this.now() - this.startMS
    }
    // Get ticks per second.
    ticksPerSec() {
        const dt = this.ticks - this.startTick;
        return dt === 0 ? 0 : Math.round(dt * 1000 / this.ms()) // avoid divide by 0
    }
    // Return a status string for debugging and logging performance
    toString() {
        return `ticks: ${this.ticks}, ticks per second: ${this.ticksPerSec()}`
    }
}
