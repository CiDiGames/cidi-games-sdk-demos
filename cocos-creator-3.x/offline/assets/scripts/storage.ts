const DEFAULT_PREFIX = 'cidi-demo:';

export default class Storage {
    private static prefix = DEFAULT_PREFIX;

    static configure(options?: { prefix?: string }) {
        this.prefix = typeof options?.prefix === 'string' ? options.prefix : DEFAULT_PREFIX;
        return this;
    }

    static set(key: string, value: unknown): boolean {
        const storage = this.getLocalStorage();
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

    static get<T>(key: string, defaultValue: T): T {
        const storage = this.getLocalStorage();
        if (!storage) {
            return defaultValue;
        }

        try {
            const value = storage.getItem(this.buildKey(key));
            if (value === null) {
                return defaultValue;
            }

            return JSON.parse(value) as T;
        } catch (error) {
            this.logError('get failed', error);
            return defaultValue;
        }
    }

    static remove(key: string): boolean {
        const storage = this.getLocalStorage();
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

    static has(key: string): boolean {
        const storage = this.getLocalStorage();
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

    static clear(): boolean {
        const storage = this.getLocalStorage();
        if (!storage) {
            return false;
        }

        try {
            const keys: string[] = [];
            for (let i = 0; i < storage.length; i += 1) {
                const key = storage.key(i);
                if (key && key.indexOf(this.prefix) === 0) {
                    keys.push(key);
                }
            }

            keys.forEach((key) => storage.removeItem(key));
            return true;
        } catch (error) {
            this.logError('clear failed', error);
            return false;
        }
    }

    private static buildKey(key: string): string {
        return this.prefix + String(key);
    }

    private static getLocalStorage(): globalThis.Storage | null {
        if (typeof window === 'undefined' || !window.localStorage) {
            return null;
        }

        return window.localStorage;
    }

    private static logError(action: string, error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        console.warn('[CIDI Demo Storage]', action, message);
    }
}

