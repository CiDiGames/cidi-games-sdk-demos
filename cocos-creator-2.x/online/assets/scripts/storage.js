var DEFAULT_PREFIX = 'cidi-demo:';

class Storage {
    static configure(options) {
        options = options || {};

        this.prefix = typeof options.prefix === 'string' ? options.prefix : DEFAULT_PREFIX;

        return this;
    }

    static set(key, value) {
        var storage = this.getLocalStorage();
        if (!storage) {
            return false;
        }

        try {
            storage.setItem(this.buildKey(key), JSON.stringify(value));
            return true;
        } catch (error) {
            this.logError('set failed', error);
            return false;
        }
    }

    static get(key, defaultValue) {
        var storage = this.getLocalStorage();
        if (!storage) {
            return defaultValue;
        }

        try {
            var value = storage.getItem(this.buildKey(key));
            if (value === null) {
                return defaultValue;
            }

            return JSON.parse(value);
        } catch (error) {
            this.logError('get failed', error);
            return defaultValue;
        }
    }

    static remove(key) {
        var storage = this.getLocalStorage();
        if (!storage) {
            return false;
        }

        try {
            storage.removeItem(this.buildKey(key));
            return true;
        } catch (error) {
            this.logError('remove failed', error);
            return false;
        }
    }

    static has(key) {
        var storage = this.getLocalStorage();
        if (!storage) {
            return false;
        }

        try {
            return storage.getItem(this.buildKey(key)) !== null;
        } catch (error) {
            this.logError('has failed', error);
            return false;
        }
    }

    static clear() {
        var storage = this.getLocalStorage();
        if (!storage) {
            return false;
        }

        try {
            var keys = [];
            for (var i = 0; i < storage.length; i += 1) {
                var key = storage.key(i);
                if (key && key.indexOf(this.prefix) === 0) {
                    keys.push(key);
                }
            }

            for (var j = 0; j < keys.length; j += 1) {
                storage.removeItem(keys[j]);
            }

            return true;
        } catch (error) {
            this.logError('clear failed', error);
            return false;
        }
    }

    static buildKey(key) {
        return this.prefix + String(key);
    }

    static getLocalStorage() {
        if (typeof window === 'undefined' || !window.localStorage) {
            return null;
        }

        return window.localStorage;
    }

    static logError(action, error) {
        if (typeof cc !== 'undefined' && cc.warn) {
            cc.warn('[CIDI Demo Storage]', action, error && error.message ? error.message : String(error));
        }
    }
}

Storage.prefix = DEFAULT_PREFIX;

module.exports = Storage;
