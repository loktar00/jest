export default class EventBus {
    constructor() {
        this.listeners = new Map();
    }

    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push(callback);
        return this;
    }

    off(event, callback) {
        const callbacks = this.listeners.get(event);
        if (!callbacks) {
            return this;
        }

        if (callback) {
            const index = callbacks.indexOf(callback);
            if (index !== -1) {
                callbacks.splice(index, 1);
            }
        } else {
            this.listeners.delete(event);
        }
        return this;
    }

    emit(event, ...args) {
        const callbacks = this.listeners.get(event);
        if (!callbacks) {
            return this;
        }

        for (let i = 0, len = callbacks.length; i < len; i++) {
            callbacks[i](...args);
        }
        return this;
    }

    once(event, callback) {
        const wrapper = (...args) => {
            callback(...args);
            this.off(event, wrapper);
        };
        this.on(event, wrapper);
        return this;
    }
}
